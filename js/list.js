import { fetchData, getItemTypes } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const tableBody = document.getElementById("equipment-table-body");
  const pagination = document.getElementById("pagination");
  const overlay = document.getElementById("table-overlay");
  const rowsPerPageSelect = document.getElementById("rows-per-page");

  // Filters
  const dateRangeInput = document.getElementById("filter-date-range");
  const itemTypeSelect = document.getElementById("filter-item-type");
  const statusReturned = document.getElementById("status-returned");
  const statusPending = document.getElementById("status-pending");
  const statusOverdue = document.getElementById("status-overdue");
  const searchInput = document.getElementById("filter-search");

  // Pagination state
  let currentPage = 1;
  let rowsPerPage = parseInt(rowsPerPageSelect.value, 10);

  // Storage for all fetched data
  let allData = [];

  // Date filter variables (YYYY-MM-DD strings)
  let filterStartDate = "";
  let filterEndDate = "";

  // Load item types dynamically into filter dropdown
  getItemTypes().then((types) => {
    itemTypeSelect.innerHTML = `<option value="">All</option>`;
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      itemTypeSelect.appendChild(option);
    });
  });

  // Listen for custom event 'reservation-updated' from form.js
  // When triggered, refetch data and reset to first page
  document.addEventListener("reservation-updated", () => {
    fetchData().then((data) => {
      allData = data;
      currentPage = 1; // Reset pagination to first page
      renderTable();
    });
  });

  // Helper function to format Date object as "YYYY-MM-DD"
  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Initialize flatpickr date range picker
  flatpickr(dateRangeInput, {
    mode: "range",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        filterStartDate = formatDateLocal(selectedDates[0]);
        filterEndDate = formatDateLocal(selectedDates[1]);
      } else {
        filterStartDate = "";
        filterEndDate = "";
      }
      currentPage = 1; // Reset page on filter change
      renderTable();
    },
  });

  // Handle change in rows per page dropdown
  rowsPerPageSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(rowsPerPageSelect.value, 10);
    currentPage = 1; // Reset page when page size changes
    renderTable();
  });

  // Sorting state variables
  let sortField = "date";
  let sortDirection = "asc";

  // Filter dataset based on current filters
  function filterData(data) {
    return data.filter((record) => {
      const recordDateStr = record.date.slice(0, 10);

      if (filterStartDate && recordDateStr < filterStartDate) return false;
      if (filterEndDate && recordDateStr > filterEndDate) return false;

      if (itemTypeSelect.value && record.itemName !== itemTypeSelect.value)
        return false;

      if (!statusReturned.checked && record.status === "Returned") return false;
      if (!statusPending.checked && record.status === "Pending") return false;
      if (!statusOverdue.checked && record.status === "Overdue") return false;

      const searchTerm = searchInput.value.toLowerCase();
      return (
        !searchTerm ||
        record.employeeName.toLowerCase().includes(searchTerm) ||
        record.itemId.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Sort data by current sorting field and direction
  function sortData(data) {
    return data.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      // Parse dates if sorting by date fields
      if (sortField === "date" || sortField === "returnDate") {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Render table rows and pagination
  function renderTable() {
    overlay.classList.add("active");
    document.querySelector(".table-wrapper").classList.add("loading");

    setTimeout(() => {
      const filteredData = filterData(allData);
      const sortedData = sortData(filteredData);

      // Update results count display
      const resultsCountEl = document.getElementById("results-count");
      if (resultsCountEl) {
        resultsCountEl.textContent = `${filteredData.length} result${
          filteredData.length !== 1 ? "s" : ""
        } found`;
      }

      // Calculate pagination slice
      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedData = sortedData.slice(start, end);

      tableBody.innerHTML = "";

      // Render rows or "No records" message
      if (paginatedData.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-muted">No records found</td>
          </tr>`;
      } else {
        paginatedData.forEach((record) => {
          const row = document.createElement("tr");

          // Apply row color based on status
          if (record.status === "Overdue") row.classList.add("table-danger");
          if (record.status === "Pending") row.classList.add("table-warning");
          if (record.status === "Returned") row.classList.add("table-success");

          row.innerHTML = `
            <td data-label="Date">${record.date}</td>
            <td data-label="Item Name">${record.itemName}</td>
            <td data-label="Status">${record.status}</td>
            <td data-label="Return Date">${record.returnDate || "-"}</td>
            <td data-label="Employee Name">${record.employeeName}</td>
            <td data-label="Item ID">${record.itemId}</td>
          `;
          tableBody.appendChild(row);
        });
      }

      renderPagination(filteredData.length);

      // Scroll table wrapper to top smoothly
      const tableWrapper = document.querySelector(".table-wrapper");
      if (tableWrapper) {
        tableWrapper.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Hide loading overlay
      overlay.classList.remove("active");
      document.querySelector(".table-wrapper").classList.remove("loading");
    }, 400);
  }

  // Render pagination controls
  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    // Helper to create pagination button
    function createPageItem(
      page,
      text = null,
      disabled = false,
      active = false
    ) {
      const li = document.createElement("li");
      li.className = `page-item${active ? " active" : ""}${
        disabled ? " disabled" : ""
      }`;
      const btn = document.createElement("button");
      btn.className = "page-link";
      btn.textContent = text || page;

      if (!disabled && !active) {
        btn.addEventListener("click", () => {
          currentPage = page;
          renderTable();

          // Scroll to top on mobile for better UX
          if (window.innerWidth <= 768) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
      }
      li.appendChild(btn);
      return li;
    }

    pagination.appendChild(createPageItem(1, "«", currentPage === 1));
    pagination.appendChild(
      createPageItem(currentPage - 1, "‹", currentPage === 1)
    );

    let startPage = Math.max(currentPage - 1, 1);
    let endPage = Math.min(startPage + 2, totalPages);
    if (endPage - startPage < 2) startPage = Math.max(endPage - 2, 1);

    for (let i = startPage; i <= endPage; i++) {
      pagination.appendChild(createPageItem(i, null, false, i === currentPage));
    }

    pagination.appendChild(
      createPageItem(currentPage + 1, "›", currentPage === totalPages)
    );
    pagination.appendChild(
      createPageItem(totalPages, "»", currentPage === totalPages)
    );
  }

  // Add input event listeners to filters to reset page and re-render
  [
    itemTypeSelect,
    statusReturned,
    statusPending,
    statusOverdue,
    searchInput,
  ].forEach((el) =>
    el.addEventListener("input", () => {
      currentPage = 1;
      renderTable();
    })
  );

  // Add click event listeners for sortable table headers
  const headers = document.querySelectorAll(
    "#equipment-table thead th[data-sort]"
  );
  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.getAttribute("data-sort");

      // Toggle sorting direction if sorting the same field
      sortDirection =
        sortField === field && sortDirection === "asc" ? "desc" : "asc";
      sortField = field;

      // Update sort icons UI
      headers.forEach((el) => {
        el.classList.remove("active-sort");
        const icon = el.querySelector("i");
        if (icon) icon.className = "bi bi-arrow-down-up";
      });

      th.classList.add("active-sort");
      const icon = th.querySelector("i");
      if (icon)
        icon.className =
          sortDirection === "asc" ? "bi bi-arrow-up" : "bi bi-arrow-down";

      renderTable();
    });
  });

  // Set default sort icon on page load
  const defaultHeader = document.querySelector(
    `#equipment-table thead th[data-sort="${sortField}"]`
  );
  if (defaultHeader) {
    defaultHeader.classList.add("active-sort");
    const icon = defaultHeader.querySelector("i");
    if (icon) icon.className = "bi bi-arrow-up";
  }

  // Initial data fetch and render on page load
  fetchData()
    .then((data) => {
      allData = data;
      renderTable();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>`;
    });
});
