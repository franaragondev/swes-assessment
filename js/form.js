import { createReservation, sendEmailNotification } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");
  const alertDiv = document.getElementById("form-alert");

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form inputs safely
    const employeeIdInput = form.querySelector('[name="employeeId"]');
    const itemSelect = form.querySelector('[name="item"]');
    const dateInput = form.querySelector('[name="reservationDate"]');

    // Stop if any input is missing
    if (!employeeIdInput || !itemSelect || !dateInput) {
      console.error("One or more form elements could not be found!");
      return;
    }

    // Reset alert state before validation
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

    // Validate Item selection (must be selected)
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

    // Prepare reservation data for the API
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
      // Call the API and wait for the result
      const response = await createReservation(reservationData);

      // Show success message
      alertDiv.textContent = response.message;
      alertDiv.classList.remove("alert-info");
      alertDiv.classList.add("alert-success");

      // Then, simulate sending email notification
      try {
        const emailResponse = await sendEmailNotification(reservationData);

        // Append success message for email notification
        alertDiv.textContent += ` ${emailResponse.message}`;
      } catch (emailError) {
        // Append error message for email notification failure
        alertDiv.textContent += ` Warning: ${emailError.message}`;
      }

      // Delay form reset so the user can read the success message
      setTimeout(() => {
        form.reset();
        alertDiv.classList.add("d-none");
        alertDiv.textContent = "";
        alertDiv.classList.remove("alert-success");
      }, 4000);

      // Notify other views (list/calendar) to refresh after reservation
      document.dispatchEvent(new CustomEvent("reservation-updated"));
    } catch (error) {
      // Show error message
      alertDiv.textContent = error.message;
      alertDiv.classList.remove("alert-info");
      alertDiv.classList.add("alert-danger");
    }
  });

  // Handle manual reset (when user clicks the "Clear" button)
  form.addEventListener("reset", () => {
    // Clear validation classes
    form
      .querySelectorAll(".is-invalid")
      .forEach((el) => el.classList.remove("is-invalid"));

    // Hide and reset alert box
    alertDiv.classList.add("d-none");
    alertDiv.textContent = "";
    alertDiv.classList.remove("alert-success", "alert-danger", "alert-info");
  });
});
