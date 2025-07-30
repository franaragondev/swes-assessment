document.addEventListener("DOMContentLoaded", () => {
  // Select table body, pagination container and loading spinner
  const tableBody = document.getElementById("equipment-table-body");
  const pagination = document.getElementById("pagination");
  const spinner = document.getElementById("loading-spinner");

  // Select filter elements
  const startDateInput = document.getElementById("filter-date-start");
  const endDateInput = document.getElementById("filter-date-end");
  const itemTypeSelect = document.getElementById("filter-item-type");
  const statusReturned = document.getElementById("status-returned");
  const statusPending = document.getElementById("status-pending");
  const statusOverdue = document.getElementById("status-overdue");
  const searchInput = document.getElementById("filter-search");

  // Pagination configuration
  let currentPage = 1;
  const rowsPerPage = 10;

  // Sorting configuration
  let sortField = "date"; // Default sort column
  let sortDirection = "asc"; // Default sort direction

  /**
   * Filter data based on filters (dates, status, type, search)
   */
  function filterData() {
    return dummyData.filter((record) => {
      // Date range filter
      if (startDateInput.value && record.date < startDateInput.value)
        return false;
      if (endDateInput.value && record.date > endDateInput.value) return false;

      // Item type filter
      if (itemTypeSelect.value && record.itemName !== itemTypeSelect.value)
        return false;

      // Status filters
      if (!statusReturned.checked && record.status === "Returned") return false;
      if (!statusPending.checked && record.status === "Pending") return false;
      if (!statusOverdue.checked && record.status === "Overdue") return false;

      // Search filter (employee name or item ID)
      const searchTerm = searchInput.value.toLowerCase();
      if (
        searchTerm &&
        !record.employeeName.toLowerCase().includes(searchTerm) &&
        !record.itemId.toLowerCase().includes(searchTerm)
      )
        return false;

      return true;
    });
  }

  /**
   * Sort data based on current sort field and direction
   */
  function sortData(data) {
    return data.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      // Handle date fields (convert to Date objects)
      if (sortField === "date" || sortField === "returnDate") {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
      }

      // Compare values
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Render table rows and pagination
   */
  function renderTable() {
    // Show loading spinner
    spinner.classList.remove("d-none");
    tableBody.innerHTML = "";

    // Delay for better UX simulation
    setTimeout(() => {
      const filteredData = filterData();
      const sortedData = sortData(filteredData);

      // Get data for current page
      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedData = sortedData.slice(start, end);

      // Empty state
      if (paginatedData.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-muted">
              <i class="bi bi-emoji-frown fs-4"></i> No records found
            </td>
          </tr>`;
      } else {
        // Create rows
        paginatedData.forEach((record) => {
          const row = document.createElement("tr");

          // Add background color based on status
          if (record.status === "Overdue") row.classList.add("table-danger");
          if (record.status === "Pending") row.classList.add("table-warning");
          if (record.status === "Returned") row.classList.add("table-success");

          // Fill cells with data
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

      // Hide loading spinner
      spinner.classList.add("d-none");
    }, 400);
  }

  /**
   * Render pagination buttons (show only 3 pages + controls)
   */
  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    // Helper to create pagination buttons
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

      // Add click event
      if (!disabled && !active) {
        btn.addEventListener("click", () => {
          currentPage = page;
          renderTable();
        });
      }
      li.appendChild(btn);
      return li;
    }

    // First & Previous buttons
    pagination.appendChild(createPageItem(1, "«", currentPage === 1));
    pagination.appendChild(
      createPageItem(currentPage - 1, "‹", currentPage === 1)
    );

    // Calculate start and end page range (max 3 pages)
    let startPage = Math.max(currentPage - 1, 1);
    let endPage = Math.min(startPage + 2, totalPages);
    if (endPage - startPage < 2) startPage = Math.max(endPage - 2, 1);

    // Add page number buttons
    for (let i = startPage; i <= endPage; i++) {
      pagination.appendChild(createPageItem(i, null, false, i === currentPage));
    }

    // Next & Last buttons
    pagination.appendChild(
      createPageItem(currentPage + 1, "›", currentPage === totalPages)
    );
    pagination.appendChild(
      createPageItem(totalPages, "»", currentPage === totalPages)
    );
  }

  /**
   * Listen to filter inputs (reset to page 1)
   */
  [
    startDateInput,
    endDateInput,
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

  /**
   * Listen to column headers for sorting
   */
  const headers = document.querySelectorAll(
    "#equipment-table thead th[data-sort]"
  );
  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.getAttribute("data-sort");

      // Toggle direction if same column is clicked
      if (sortField === field) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortField = field;
        sortDirection = "asc";
      }

      // Reset all headers
      headers.forEach((el) => {
        el.classList.remove("active-sort");
        const icon = el.querySelector("i");
        if (icon) icon.className = "bi bi-arrow-down-up"; // Reset icon
      });

      // Highlight the active sorted column
      th.classList.add("active-sort");
      const icon = th.querySelector("i");
      if (icon)
        icon.className =
          sortDirection === "asc" ? "bi bi-arrow-up" : "bi bi-arrow-down";

      renderTable();
    });
  });

  /**
   * Set default sorted column
   */
  const defaultHeader = document.querySelector(
    `#equipment-table thead th[data-sort="${sortField}"]`
  );
  if (defaultHeader) {
    defaultHeader.classList.add("active-sort");
    const icon = defaultHeader.querySelector("i");
    if (icon) icon.className = "bi bi-arrow-up";
  }

  // Initial table render
  renderTable();
});
