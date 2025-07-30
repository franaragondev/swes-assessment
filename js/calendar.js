import { fetchData, getItemTypes } from "./api.js";

export let reservedDatesForCurrentItem = new Set();

document.addEventListener("DOMContentLoaded", () => {
  const calendarContainer = document.getElementById("calendar");
  const reservationDateInput = document.getElementById("reservation-date");
  const itemSelect = document.getElementById("item-select-calendar");

  if (!calendarContainer || !reservationDateInput || !itemSelect) return;

  // Load item types into the calendar select dropdown
  getItemTypes().then((types) => {
    itemSelect.innerHTML = `<option value="">Select item</option>`;
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      itemSelect.appendChild(option);
    });
  });

  // Constants
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
  let reservations = [];

  // Helpers
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // UI creation helpers
  const createButton = (text, className, onClick) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = className;
    if (onClick) btn.addEventListener("click", onClick);
    return btn;
  };

  // Clear calendar content
  const clearCalendar = () => {
    calendarContainer.innerHTML = "";
  };

  // Header with prev/next buttons and title
  const createHeader = () => {
    const header = document.createElement("div");
    header.className = "d-flex justify-content-between align-items-center mb-3";

    const prevBtn = createButton("Prev", "btn btn-outline-primary", () => {
      if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
      } else {
        currentMonth--;
      }
      renderCalendar(currentYear, currentMonth);
    });

    const nextBtn = createButton("Next", "btn btn-outline-primary", () => {
      if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
      } else {
        currentMonth++;
      }
      renderCalendar(currentYear, currentMonth);
    });

    const title = document.createElement("h5");
    title.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    title.className = "mb-0";

    header.append(prevBtn, title, nextBtn);
    calendarContainer.appendChild(header);
  };

  // Weekdays header
  const createWeekdays = () => {
    const weekdaysRow = document.createElement("div");
    weekdaysRow.className = "calendar-weekdays";
    weekdays.forEach((day) => {
      const dayEl = document.createElement("div");
      dayEl.textContent = day;
      weekdaysRow.appendChild(dayEl);
    });
    calendarContainer.appendChild(weekdaysRow);
  };

  // Calculate reserved dates for selected item/month/year
  const calculateReservedDates = (year, month, itemName) => {
    reservedDatesForCurrentItem.clear();
    reservations.forEach((res) => {
      if (res.itemName !== itemName) return;

      const dateObj = new Date(res.date);
      if (dateObj.getFullYear() === year && dateObj.getMonth() === month) {
        reservedDatesForCurrentItem.add(res.date);
      }
    });
  };

  // Create day buttons grid with disabled states
  const createDaysGrid = (year, month) => {
    const daysGrid = document.createElement("div");
    daysGrid.className = "calendar-days";

    const firstDayJS = new Date(year, month, 1).getDay();
    const firstDay = firstDayJS === 0 ? 6 : firstDayJS - 1;
    const totalDays = daysInMonth(month, year);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
      const dayEl = document.createElement("button");
      dayEl.className = "btn btn-light border";
      dayEl.style.minWidth = "40px";
      dayEl.style.height = "40px";
      dayEl.style.margin = "2px";

      if (i < firstDay || i >= firstDay + totalDays) {
        dayEl.disabled = true;
        dayEl.classList.add("invisible");
        daysGrid.appendChild(dayEl);
        continue;
      }

      const dayNum = i - firstDay + 1;
      dayEl.textContent = dayNum;

      const date = new Date(year, month, dayNum);
      const dateStr = formatDateLocal(date);

      if (date < today) {
        dayEl.disabled = true;
        dayEl.classList.add("text-muted", "past-day");
      } else if (reservedDatesForCurrentItem.has(dateStr)) {
        dayEl.disabled = true;
        dayEl.classList.add("reserved-day");
      } else if (itemSelect.value) {
        dayEl.style.cursor = "pointer";
        dayEl.addEventListener("click", () => {
          reservationDateInput.value = dateStr;
          const formItemSelect = document.querySelector(
            '#reservation-form select[name="item"]'
          );
          if (formItemSelect) formItemSelect.value = itemSelect.value;
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

      daysGrid.appendChild(dayEl);
    }

    calendarContainer.appendChild(daysGrid);
  };

  // Main render calendar function
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
    createDaysGrid(year, month);
  }

  // Initialize calendar data and UI
  async function init() {
    try {
      reservations = await fetchData();
      const now = new Date();
      renderCalendar(now.getFullYear(), now.getMonth());
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  }

  // Event: item selection changes
  itemSelect.addEventListener("change", () => {
    renderCalendar(currentYear, currentMonth);
  });

  init();
});

// Helper to check if a date is available
export function isDateAvailable(item, date) {
  return !reservedDatesForCurrentItem.has(date);
}
