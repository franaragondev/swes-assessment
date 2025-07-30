import { createReservation } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");
  const alertDiv = document.getElementById("form-alert");

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Safely get inputs by name
    const employeeIdInput = form.querySelector('[name="employeeId"]');
    const itemSelect = form.querySelector('[name="item"]');
    const dateInput = form.querySelector('[name="reservationDate"]');

    // If any input is missing, log error and stop
    if (!employeeIdInput || !itemSelect || !dateInput) {
      console.error("One or more form elements could not be found!");
      return;
    }

    // Reset alert styles and message
    alertDiv.classList.add("d-none");
    alertDiv.textContent = "";
    alertDiv.classList.remove("alert-success", "alert-danger", "alert-info");

    let valid = true;

    // Validate Employee ID (cannot be empty)
    if (!employeeIdInput.value.trim()) {
      employeeIdInput.classList.add("is-invalid");
      valid = false;
    } else {
      employeeIdInput.classList.remove("is-invalid");
    }

    // Validate Item selection
    if (!itemSelect.value) {
      itemSelect.classList.add("is-invalid");
      valid = false;
    } else {
      itemSelect.classList.remove("is-invalid");
    }

    // Validate Date (must be today or later)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateInput.value);

    if (!dateInput.value || selectedDate < today) {
      dateInput.classList.add("is-invalid");
      valid = false;
    } else {
      dateInput.classList.remove("is-invalid");
    }

    // Stop if form is invalid
    if (!valid) return;

    // Prepare data to send to API
    const reservationData = {
      employeeId: employeeIdInput.value.trim(),
      item: itemSelect.value,
      reservationDate: dateInput.value,
    };

    // Show "loading" message
    alertDiv.textContent = "Submitting reservation...";
    alertDiv.classList.remove("d-none");
    alertDiv.classList.add("alert-info");

    try {
      // Call API (mocked createReservation)
      const response = await createReservation(reservationData);

      // Show success message
      alertDiv.textContent = response.message;
      alertDiv.classList.remove("alert-info");
      alertDiv.classList.add("alert-success");

      // Reset form fields
      form.reset();

      // Dispatch a custom event to notify other views (calendar/list) to refresh
      const event = new CustomEvent("reservation-updated");
      document.dispatchEvent(event);
    } catch (error) {
      // Show error message if reservation cannot be created
      alertDiv.textContent = error.message;
      alertDiv.classList.remove("alert-info");
      alertDiv.classList.add("alert-danger");
    }
  });

  // Handle form reset (clear validation errors and alerts)
  form.addEventListener("reset", () => {
    // Remove invalid classes from all inputs
    form
      .querySelectorAll(".is-invalid")
      .forEach((el) => el.classList.remove("is-invalid"));

    // Hide alert and reset its classes and text
    alertDiv.classList.add("d-none");
    alertDiv.textContent = "";
    alertDiv.classList.remove("alert-success", "alert-danger", "alert-info");
  });
});
