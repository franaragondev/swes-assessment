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

  // Pagination & Sorting state
  let currentPage = 1;
  let rowsPerPage = parseInt(rowsPerPageSelect.value, 10);
  let sortField = "date";
  let sortDirection = "asc";

  // Data storage
  let allData = [];

  // Date filter state
  let filterStartDate = "";
  let filterEndDate = "";

  // --- UTILITIES ---

  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // --- FILTERS ---

  function applyFilters(data) {
    const searchTerm = searchInput.value.toLowerCase();

    return data.filter((record) => {
      const recordDate = record.date.slice(0, 10);

      if (filterStartDate && recordDate < filterStartDate) return false;
      if (filterEndDate && recordDate > filterEndDate) return false;
      if (itemTypeSelect.value && record.itemName !== itemTypeSelect.value)
        return false;

      if (!statusReturned.checked && record.status === "Returned") return false;
      if (!statusPending.checked && record.status === "Pending") return false;
      if (!statusOverdue.checked && record.status === "Overdue") return false;

      if (
        searchTerm &&
        !(
          record.employeeName.toLowerCase().includes(searchTerm) ||
          record.itemId.toLowerCase().includes(searchTerm)
        )
      )
        return false;

      return true;
    });
  }

  // --- SORTING ---

  function applySorting(data) {
    return [...data].sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (sortField === "date" || sortField === "returnDate") {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // --- PAGINATION ---

  function paginate(data, page, pageSize) {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }

  function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    const createButton = (page, label, disabled = false, active = false) => {
      const li = document.createElement("li");
      li.className = `page-item${active ? " active" : ""}${
        disabled ? " disabled" : ""
      }`;
      const btn = document.createElement("button");
      btn.className = "page-link";
      btn.textContent = label || page;

      if (!disabled && !active) {
        btn.addEventListener("click", () => {
          currentPage = page;
          renderTable();
          if (window.innerWidth <= 768)
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
      li.appendChild(btn);
      return li;
    };

    pagination.appendChild(createButton(1, "«", currentPage === 1));
    pagination.appendChild(
      createButton(currentPage - 1, "‹", currentPage === 1)
    );

    let startPage = Math.max(currentPage - 1, 1);
    let endPage = Math.min(startPage + 2, totalPages);
    if (endPage - startPage < 2) startPage = Math.max(endPage - 2, 1);

    for (let i = startPage; i <= endPage; i++) {
      pagination.appendChild(createButton(i, null, false, i === currentPage));
    }

    pagination.appendChild(
      createButton(currentPage + 1, "›", currentPage === totalPages)
    );
    pagination.appendChild(
      createButton(totalPages, "»", currentPage === totalPages)
    );
  }

  // --- TABLE RENDERING ---

  function renderTable() {
    overlay.classList.add("active");
    document.querySelector(".table-wrapper").classList.add("loading");

    setTimeout(() => {
      const filtered = applyFilters(allData);
      const sorted = applySorting(filtered);
      const paginated = paginate(sorted, currentPage, rowsPerPage);

      // Update results count
      const resultsCountEl = document.getElementById("results-count");
      if (resultsCountEl) {
        resultsCountEl.textContent = `${filtered.length} result${
          filtered.length !== 1 ? "s" : ""
        } found`;
      }

      // Render rows or fallback message
      tableBody.innerHTML = "";
      if (paginated.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No records found</td></tr>`;
      } else {
        paginated.forEach((record) => {
          const row = document.createElement("tr");

          if (record.status === "Overdue") row.classList.add("table-danger");
          else if (record.status === "Pending")
            row.classList.add("table-warning");
          else if (record.status === "Returned")
            row.classList.add("table-success");

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

      renderPaginationControls(filtered.length);

      const tableWrapper = document.querySelector(".table-wrapper");
      if (tableWrapper) tableWrapper.scrollTo({ top: 0, behavior: "smooth" });

      overlay.classList.remove("active");
      document.querySelector(".table-wrapper").classList.remove("loading");
    }, 400);
  }

  // --- EVENT LISTENERS ---

  // Load item types in filter dropdown
  getItemTypes().then((types) => {
    itemTypeSelect.innerHTML = `<option value="">All</option>`;
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      itemTypeSelect.appendChild(option);
    });
  });

  // Date range picker initialization
  flatpickr(dateRangeInput, {
    mode: "range",
    dateFormat: "Y-m-d",
    onChange: (selectedDates) => {
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

  // Rows per page change
  rowsPerPageSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(rowsPerPageSelect.value, 10);
    currentPage = 1;
    renderTable();
  });

  // Filters input listener to reset page and re-render
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

  // Sorting headers listener
  const headers = document.querySelectorAll(
    "#equipment-table thead th[data-sort]"
  );
  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.getAttribute("data-sort");
      sortDirection =
        sortField === field && sortDirection === "asc" ? "desc" : "asc";
      sortField = field;

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

  // Default sort icon
  const defaultHeader = document.querySelector(
    `#equipment-table thead th[data-sort="${sortField}"]`
  );
  if (defaultHeader) {
    defaultHeader.classList.add("active-sort");
    const icon = defaultHeader.querySelector("i");
    if (icon) icon.className = "bi bi-arrow-up";
  }

  // Listen for external event to refresh reservations
  document.addEventListener("reservation-updated", () => {
    fetchData()
      .then((data) => {
        allData = data;
        currentPage = 1;
        renderTable();
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>`;
      });
  });

  // Initial fetch & render
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
