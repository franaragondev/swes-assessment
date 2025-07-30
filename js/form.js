document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");
  const alertDiv = document.getElementById("form-alert");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Inputs
    const employeeIdInput = form.elements["employeeId"];
    const itemSelect = form.elements["item"];
    const dateInput = form.elements["reservationDate"];

    // Reset alert and invalid classes
    alertDiv.classList.add("d-none");
    alertDiv.textContent = "";
    alertDiv.classList.remove("alert-success", "alert-danger", "alert-info");

    let valid = true;

    // Employee ID validation
    if (!employeeIdInput.value.trim()) {
      employeeIdInput.classList.add("is-invalid");
      valid = false;
    } else {
      employeeIdInput.classList.remove("is-invalid");
    }

    // Item validation
    if (!itemSelect.value) {
      itemSelect.classList.add("is-invalid");
      valid = false;
    } else {
      itemSelect.classList.remove("is-invalid");
    }

    // Date validation (today or later)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateInput.value);
    if (!dateInput.value || selectedDate < today) {
      dateInput.classList.add("is-invalid");
      valid = false;
    } else {
      dateInput.classList.remove("is-invalid");
    }

    if (!valid) {
      return;
    }

    // Prepare data for submission
    const reservationData = {
      employeeId: employeeIdInput.value.trim(),
      item: itemSelect.value,
      reservationDate: dateInput.value,
    };

    // Show loading message
    alertDiv.textContent = "Submitting reservation...";
    alertDiv.classList.remove("d-none");
    alertDiv.classList.add("alert-info");

    // Simulate API call (mock)
    setTimeout(() => {
      alertDiv.textContent = "Reservation created successfully!";
      alertDiv.classList.remove("alert-info");
      alertDiv.classList.add("alert-success");
      form.reset();
    }, 1000);
  });

  // Clear validation and alerts on form reset
  form.addEventListener("reset", () => {
    // Remove validation classes
    form
      .querySelectorAll(".is-invalid")
      .forEach((el) => el.classList.remove("is-invalid"));

    // Hide alert and reset its classes and content
    alertDiv.classList.add("d-none");
    alertDiv.textContent = "";
    alertDiv.classList.remove("alert-success", "alert-danger", "alert-info");
  });
});
