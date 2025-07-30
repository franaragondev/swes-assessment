import { fetchData, getItemTypes } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const calendarContainer = document.getElementById("calendar");
  const reservationDateInput = document.getElementById("reservation-date");
  const itemSelect = document.getElementById("item-select-calendar");

  // Exit if essential elements are missing
  if (!calendarContainer || !reservationDateInput || !itemSelect) return;

  getItemTypes().then((types) => {
    itemSelect.innerHTML = `<option value="">Select item</option>`;
    types.forEach((type) => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type;
      itemSelect.appendChild(opt);
    });
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  let currentYear, currentMonth;
  let reservations = []; // All reservations loaded from API
  let reservedDatesForCurrentItem = new Set(); // Reserved dates (strings) for currently selected item

  /** Returns the number of days in a specific month and year */
  function daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  /** Clears calendar container content */
  function clearCalendar() {
    calendarContainer.innerHTML = "";
  }

  /** Creates calendar header with prev/next buttons and month/year title */
  function createHeader() {
    const header = document.createElement("div");
    header.className = "d-flex justify-content-between align-items-center mb-3";

    // Previous month button
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-outline-primary";
    prevBtn.textContent = "Prev";
    prevBtn.addEventListener("click", () => {
      if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
      } else {
        currentMonth--;
      }
      renderCalendar(currentYear, currentMonth);
    });

    // Next month button
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-outline-primary";
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", () => {
      if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
      } else {
        currentMonth++;
      }
      renderCalendar(currentYear, currentMonth);
    });

    // Month and year title
    const title = document.createElement("h5");
    title.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    title.className = "mb-0";

    // Append buttons and title to header container
    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);

    calendarContainer.appendChild(header);
  }

  /** Creates weekdays header row starting with Monday */
  function createWeekdays() {
    const weekdaysRow = document.createElement("div");
    weekdaysRow.className = "calendar-weekdays";

    weekdays.forEach((day) => {
      const dayEl = document.createElement("div");
      dayEl.textContent = day;
      weekdaysRow.appendChild(dayEl);
    });

    calendarContainer.appendChild(weekdaysRow);
  }

  /**
   * Calculate reserved dates for the current year, month, and selected item.
   * Populates reservedDatesForCurrentItem set with date strings (YYYY-MM-DD).
   */
  function calculateReservedDates(year, month, itemName) {
    reservedDatesForCurrentItem.clear();

    reservations.forEach((reservation) => {
      if (reservation.itemName !== itemName) return; // Skip other items

      const resDateStr = reservation.date; // ISO format: YYYY-MM-DD
      const dateObj = new Date(resDateStr);

      // Match only reservations in the currently viewed month and year
      if (dateObj.getFullYear() === year && dateObj.getMonth() === month) {
        reservedDatesForCurrentItem.add(resDateStr);
      }
    });
  }

  /**
   * Creates calendar day buttons grid.
   * Disables past days and reserved days for the selected item.
   */
  function createDaysGrid(year, month) {
    const daysGrid = document.createElement("div");
    daysGrid.className = "calendar-days";

    // Get first day of month (JS Sunday=0,... Saturday=6)
    // Adjust so Monday=0, Sunday=6
    const firstDayJS = new Date(year, month, 1).getDay();
    const firstDay = firstDayJS === 0 ? 6 : firstDayJS - 1;

    const totalDays = daysInMonth(month, year);

    // Today normalized to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalCells = 42; // 6 weeks * 7 days for uniform grid

    for (let i = 0; i < totalCells; i++) {
      const dayEl = document.createElement("button");
      dayEl.className = "btn btn-light border";
      dayEl.style.minWidth = "40px";
      dayEl.style.height = "40px";
      dayEl.style.margin = "2px";

      // Blank cells before month start and after month end
      if (i < firstDay || i >= firstDay + totalDays) {
        dayEl.disabled = true;
        dayEl.classList.add("invisible");
        daysGrid.appendChild(dayEl);
        continue;
      }

      const dayNumber = i - firstDay + 1;
      dayEl.textContent = dayNumber;

      const date = new Date(year, month, dayNumber);

      function formatDateLocal(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }

      const dateStr = formatDateLocal(date);

      // Disable past dates
      if (date < today) {
        dayEl.disabled = true;
        dayEl.classList.add("text-muted");
        dayEl.classList.add("past-day");
      }
      // Disable dates reserved for current item
      else if (reservedDatesForCurrentItem.has(dateStr)) {
        dayEl.disabled = true;
        dayEl.classList.add("reserved-day"); // Style reserved days differently
      }
      // Enable selectable dates
      else {
        if (itemSelect.value) {
          dayEl.style.cursor = "pointer";
          dayEl.addEventListener("click", () => {
            reservationDateInput.value = dateStr;
            const formItemSelect = document.querySelector(
              '#reservation-form select[name="item"]'
            );
            if (formItemSelect) {
              formItemSelect.value = itemSelect.value;
            }
            const formLink = document.querySelector(
              'a.nav-link[data-view="form-view"]'
            );
            if (formLink) formLink.click();
          });
        } else {
          dayEl.disabled = true;
          dayEl.title = "Select an item first";
          dayEl.classList.add("text-muted");
        }
      }

      daysGrid.appendChild(dayEl);
    }

    calendarContainer.appendChild(daysGrid);
  }

  /**
   * Main render function: clears and draws calendar UI for given year and month.
   * Calculates reserved dates for the selected item and disables those dates.
   */
  async function renderCalendar(year, month) {
    currentYear = year;
    currentMonth = month;

    clearCalendar();
    createHeader();
    createWeekdays();

    const selectedItem = itemSelect.value;
    if (selectedItem) {
      calculateReservedDates(year, month, selectedItem);
    } else {
      reservedDatesForCurrentItem.clear();
    }
    console.log("Selected item:", selectedItem);
    createDaysGrid(year, month);
  }

  /**
   * Initialize by fetching reservations and rendering current month calendar
   */
  async function init() {
    try {
      reservations = await fetchData();
      const now = new Date();
      renderCalendar(now.getFullYear(), now.getMonth());
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  }

  // Re-render calendar when the selected item changes
  itemSelect.addEventListener("change", () => {
    renderCalendar(currentYear, currentMonth);
  });

  init();
});
