document.addEventListener("DOMContentLoaded", () => {
  // Select table body and pagination container
  const tableBody = document.getElementById("equipment-table-body");
  const pagination = document.getElementById("pagination");

  // Select filter inputs
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
  let sortDirection = "asc"; // Default direction

  /**
   * Filter data according to all the filter inputs
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

      // Status filter
      if (!statusReturned.checked && record.status === "Returned") return false;
      if (!statusPending.checked && record.status === "Pending") return false;
      if (!statusOverdue.checked && record.status === "Overdue") return false;

      // Search filter (employee name or item ID)
      const searchTerm = searchInput.value.toLowerCase();
      if (
        searchTerm &&
        !record.employeeName.toLowerCase().includes(searchTerm) &&
        !record.itemId.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort the filtered data by the selected column and direction
   */
  function sortData(data) {
    return data.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      // Handle date fields (convert strings to Date objects)
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
   * Render the table rows with pagination
   */
  function renderTable() {
    const filteredData = filterData(); // Apply filters
    const sortedData = sortData(filteredData); // Sort data

    // Get the rows for the current page
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = sortedData.slice(start, end);

    // Clear previous rows
    tableBody.innerHTML = "";

    // If no records found, show empty message
    if (paginatedData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No data found</td></tr>`;
    } else {
      // Create a <tr> for each record
      paginatedData.forEach((record) => {
        const row = document.createElement("tr");

        // Apply background color based on status
        if (record.status === "Overdue") row.classList.add("table-danger");
        if (record.status === "Pending") row.classList.add("table-warning");
        if (record.status === "Returned") row.classList.add("table-success");

        // Fill the row with data
        row.innerHTML = `
          <td>${record.date}</td>
          <td>${record.itemName}</td>
          <td>${record.status}</td>
          <td>${record.returnDate || "-"}</td>
          <td>${record.employeeName}</td>
          <td>${record.itemId}</td>
        `;
        tableBody.appendChild(row);
      });
    }

    renderPagination(filteredData.length); // Render pagination buttons
  }

  /**
   * Render the pagination buttons
   */
  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    // Helper to create page item
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
        });
      }
      li.appendChild(btn);
      return li;
    }

    // Add "First" button
    pagination.appendChild(createPageItem(1, "«", currentPage === 1));

    // Add "Previous" button
    pagination.appendChild(
      createPageItem(currentPage - 1, "‹", currentPage === 1)
    );

    // Calculate start and end page numbers to display (max 3)
    let startPage = Math.max(currentPage - 1, 1);
    let endPage = Math.min(startPage + 2, totalPages);

    // Adjust if we are near the last page
    if (endPage - startPage < 2) {
      startPage = Math.max(endPage - 2, 1);
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pagination.appendChild(createPageItem(i, null, false, i === currentPage));
    }

    // Add "Next" button
    pagination.appendChild(
      createPageItem(currentPage + 1, "›", currentPage === totalPages)
    );

    // Add "Last" button
    pagination.appendChild(
      createPageItem(totalPages, "»", currentPage === totalPages)
    );
  }

  /**
   * Event listeners for filters
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
      currentPage = 1; // Reset to page 1 when filter changes
      renderTable();
    })
  );

  /**
   * Event listeners for sorting (click on <th>)
   */
  const headers = document.querySelectorAll(
    "#equipment-table thead th[data-sort]"
  );
  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.getAttribute("data-sort");

      // Toggle sort direction if the same column is clicked
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
        if (icon) icon.className = "bi bi-arrow-down-up"; // reset icon
      });

      // Add active class and update icon for current column
      th.classList.add("active-sort");
      const icon = th.querySelector("i");
      if (icon) {
        icon.className =
          sortDirection === "asc" ? "bi bi-arrow-up" : "bi bi-arrow-down";
      }

      renderTable();
    });
  });

  // Initial render and mark default sorted column
  const defaultHeader = document.querySelector(
    `#equipment-table thead th[data-sort="${sortField}"]`
  );
  if (defaultHeader) {
    defaultHeader.classList.add("active-sort");
    const icon = defaultHeader.querySelector("i");
    if (icon) icon.className = "bi bi-arrow-up";
  }

  renderTable();
});
