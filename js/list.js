document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const tableBody = document.getElementById("equipment-table-body");
  const pagination = document.getElementById("pagination");
  const overlay = document.getElementById("table-overlay");

  // Filters
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
  let sortField = "date";
  let sortDirection = "asc";

  /**
   * Filters the dataset based on selected filters
   */
  function filterData() {
    return dummyData.filter((record) => {
      if (startDateInput.value && record.date < startDateInput.value)
        return false;
      if (endDateInput.value && record.date > endDateInput.value) return false;
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

      // Handle date sorting
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

    setTimeout(() => {
      const filteredData = filterData();
      const sortedData = sortData(filteredData);

      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedData = sortedData.slice(start, end);

      tableBody.innerHTML = "";

      // Render rows
      if (paginatedData.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-muted">
              <i class="bi bi-emoji-frown fs-4"></i> No records found
            </td>
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
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
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

  // Listen for filter changes
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

  // Sorting event listeners
  const headers = document.querySelectorAll(
    "#equipment-table thead th[data-sort]"
  );
  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.getAttribute("data-sort");

      // Toggle sort direction
      sortDirection =
        sortField === field && sortDirection === "asc" ? "desc" : "asc";
      sortField = field;

      // Update header icons
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

  // Set default sorted column
  const defaultHeader = document.querySelector(
    `#equipment-table thead th[data-sort="${sortField}"]`
  );
  if (defaultHeader) {
    defaultHeader.classList.add("active-sort");
    const icon = defaultHeader.querySelector("i");
    if (icon) icon.className = "bi bi-arrow-up";
  }

  // Initial render
  renderTable();
});
