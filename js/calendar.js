document.addEventListener("DOMContentLoaded", () => {
  const calendarContainer = document.getElementById("calendar");
  const reservationDateInput = document.getElementById("reservation-date");

  // Exit if calendar container or reservation input doesn't exist
  if (!calendarContainer || !reservationDateInput) return;

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

  // Weekdays starting with Monday (Monday=0, Sunday=6)
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  let currentYear, currentMonth;

  // Helper function: returns number of days in a given month/year
  function daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Clears calendar content before re-rendering
  function clearCalendar() {
    calendarContainer.innerHTML = "";
  }

  // Creates the calendar header with month/year and prev/next buttons
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

    // Append buttons and title to header
    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);

    calendarContainer.appendChild(header);
  }

  // Creates the weekdays header row aligned with Monday as first day
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

  // Creates the day cells grid for the calendar month view
  function createDaysGrid(year, month) {
    const daysGrid = document.createElement("div");
    daysGrid.className = "calendar-days";

    // JavaScript getDay() returns 0=Sunday, ..., 6=Saturday
    // Adjust so Monday=0, Sunday=6 for calendar alignment
    const firstDayJS = new Date(year, month, 1).getDay();
    const firstDay = firstDayJS === 0 ? 6 : firstDayJS - 1;

    const totalDays = daysInMonth(month, year);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

    const totalCells = 42; // 6 weeks * 7 days to keep grid uniform

    for (let i = 0; i < totalCells; i++) {
      const dayEl = document.createElement("button");
      dayEl.className = "btn btn-light border";
      dayEl.style.minWidth = "40px";
      dayEl.style.height = "40px";
      dayEl.style.margin = "2px";

      // Blank cells before the start of the month or after end of month
      if (i < firstDay || i >= firstDay + totalDays) {
        dayEl.disabled = true;
        dayEl.classList.add("invisible");
        daysGrid.appendChild(dayEl);
        continue;
      }

      const dayNumber = i - firstDay + 1;
      dayEl.textContent = dayNumber;

      const date = new Date(year, month, dayNumber);

      // Disable days before today to prevent past date selection
      if (date < today) {
        dayEl.disabled = true;
        dayEl.classList.add("text-muted");
      } else {
        // Enable selectable days with pointer cursor
        dayEl.style.cursor = "pointer";

        // On click, set the reservation input value and switch to form view
        dayEl.addEventListener("click", () => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          reservationDateInput.value = `${yyyy}-${mm}-${dd}`;

          // Switch to reservation form view if such a nav element exists
          const formLink = document.querySelector(
            'a.nav-link[data-view="form-view"]'
          );
          if (formLink) formLink.click();
        });
      }

      daysGrid.appendChild(dayEl);
    }

    calendarContainer.appendChild(daysGrid);
  }

  // Main function to render calendar UI for given year and month
  function renderCalendar(year, month) {
    currentYear = year;
    currentMonth = month;

    clearCalendar();
    createHeader();
    createWeekdays();
    createDaysGrid(year, month);
  }

  // Initialize calendar to current month and year on page load
  const now = new Date();
  renderCalendar(now.getFullYear(), now.getMonth());
});
