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

  // Pagination configuration
  let currentPage = 1;
  // Use the selected rows per page from dropdown, default to 10
  let rowsPerPage = parseInt(rowsPerPageSelect.value, 10);

  // Store fetched data here
  let allData = [];

  // Date filters (strings in "YYYY-MM-DD" format)
  let filterStartDate = "";
  let filterEndDate = "";

  // Load item types dynamically
  getItemTypes().then((types) => {
    itemTypeSelect.innerHTML = `<option value="">All</option>`;
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      itemTypeSelect.appendChild(option);
    });
  });

  // Helper function to format a Date object to "YYYY-MM-DD" in local time
  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Initialize flatpickr in range mode
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
      currentPage = 1;
      renderTable();
    },
  });

  // Update rows per page and reset to first page
  rowsPerPageSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(rowsPerPageSelect.value, 10);
    currentPage = 1; // reset page to first when page size changes
    renderTable();
  });

  // Sorting
  let sortField = "date";
  let sortDirection = "asc";

  /**
   * Filters the dataset based on selected filters
   */
  function filterData(data) {
    return data.filter((record) => {
      // Extract the date part "YYYY-MM-DD" from the record's date string
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

  /**
   * Sorts data based on the selected field and direction
   */
  function sortData(data) {
    return data.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      // For date fields, parse into Date objects
      if (sortField === "date" || sortField === "returnDate") {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Renders the table and activates the overlay while loading
   */
  function renderTable() {
    overlay.classList.add("active");
    document.querySelector(".table-wrapper").classList.add("loading");
    1;

    /**
     * Use setTimeout to simulate a network delay and ensure the loading spinner is visible
     * before rendering the table. In a real API call, this would be replaced by the async fetch().
     */
    setTimeout(() => {
      const filteredData = filterData(allData);
      const sortedData = sortData(filteredData);

      // Update results count
      const resultsCountEl = document.getElementById("results-count");
      if (resultsCountEl) {
        resultsCountEl.textContent = `${filteredData.length} result${
          filteredData.length !== 1 ? "s" : ""
        } found`;
      }

      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedData = sortedData.slice(start, end);

      tableBody.innerHTML = "";

      // Render rows
      if (paginatedData.length === 0) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">No records found</td>
        </tr>`;
      } else {
        paginatedData.forEach((record) => {
          const row = document.createElement("tr");

          // Row background based on status
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

      // Render pagination
      renderPagination(filteredData.length);

      // Scroll the table-wrapper container to the top
      const tableWrapper = document.querySelector(".table-wrapper");
      if (tableWrapper) {
        tableWrapper.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Hide overlay
      overlay.classList.remove("active");
      document.querySelector(".table-wrapper").classList.remove("loading");
    }, 400);
  }

  /**
   * Renders the pagination buttons
   */
  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    // Create pagination button helper
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

          // Scroll to top on page change (for mobile/cards)
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

  // Listen for filter changes to re-render table and reset page to 1
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

  // Sorting event listeners
  const headers = document.querySelectorAll(
    "#equipment-table thead th[data-sort]"
  );
  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.getAttribute("data-sort");

      // Toggle sort direction if same field, else set ascending
      sortDirection =
        sortField === field && sortDirection === "asc" ? "desc" : "asc";
      sortField = field;

      // Update active sort icons
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

  // Set default sorted column icon
  const defaultHeader = document.querySelector(
    `#equipment-table thead th[data-sort="${sortField}"]`
  );
  if (defaultHeader) {
    defaultHeader.classList.add("active-sort");
    const icon = defaultHeader.querySelector("i");
    if (icon) icon.className = "bi bi-arrow-up";
  }

  // Fetch data and render table initially
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
