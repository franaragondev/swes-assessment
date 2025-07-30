import { dummyData, dummyItemTypes } from "./data.js";
// const API_BASE_URL = "https://my-backend.com";

/**
 * Helper: Simulates a possible network failure with a small probability.
 */
function simulateNetworkError() {
  const random = Math.random();
  if (random < 0.05) {
    // 5% chance of throwing a network error
    throw new Error("Network error. Please try again later.");
  }
}

/**
 * Fetch reservations data (simulated GET request)
 * @returns {Promise<Array>} List of reservations
 */
export async function fetchData() {
  try {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Randomly throw network error
    simulateNetworkError();

    return dummyData;
  } catch (error) {
    console.error("fetchData error:", error.message);
    // Return a generic error message to be shown in the UI
    throw new Error("Unable to fetch reservations at the moment.");
  }

  /**
   * Real implementation with fetch() (backend)
   *
   * return fetch(`${API_BASE_URL}/api/reservations`)
   *   .then((response) => {
   *     if (!response.ok) throw new Error("Error fetching reservations");
   *     return response.json();
   *   });
   */
}

/**
 * Fetch available item types (simulated GET request)
 * @returns {Promise<Array>} List of item types
 */
export async function getItemTypes() {
  try {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Randomly throw network error
    simulateNetworkError();

    return dummyItemTypes;
  } catch (error) {
    console.error("getItemTypes error:", error.message);
    throw new Error("Unable to fetch item types at the moment.");
  }

  /**
   * Real implementation with fetch() (backend)
   *
   * return fetch(`${API_BASE_URL}/api/item-types`)
   *   .then((response) => {
   *     if (!response.ok) throw new Error("Error fetching item types");
   *     return response.json();
   *   });
   */
}

/**
 * Create a new reservation (simulated POST request)
 * @param {Object} data - Reservation data (employeeId, item, reservationDate)
 * @returns {Promise<Object>} Success message
 */
export async function createReservation(data) {
  try {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Randomly throw network error
    simulateNetworkError();

    // Check if the selected date is already reserved for the same item
    const exists = dummyData.some(
      (res) => res.itemName === data.item && res.date === data.reservationDate
    );

    if (exists) {
      // Validation error for duplicate reservation
      throw new Error("This date is already reserved for the selected item.");
    }

    // Push new reservation to the dummy dataset (simulate database save)
    dummyData.push({
      date: data.reservationDate,
      itemName: data.item,
      status: "Pending",
      returnDate: "",
      employeeName: data.employeeId, // Could map ID to employee name here
      itemId: `${data.item[0]}${100 + dummyData.length + 1}`,
    });

    return { message: "Reservation created successfully!" };
  } catch (error) {
    console.error("createReservation error:", error.message);
    // Re-throw validation error as is; otherwise, show generic message
    if (error.message.includes("reserved")) throw error;
    throw new Error("Unable to create reservation at the moment.");
  }

  /**
   * Real implementation with fetch() (backend)
   *
   * return fetch(`${API_BASE_URL}/api/reservations`, {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(data)
   * }).then((response) => {
   *   if (!response.ok) throw new Error('Error creating reservation');
   *   return response.json();
   * });
   */
}

/**
 * Simulate sending an email notification (POST /api/notify)
 * @param {Object} data - Reservation data for notification
 * @returns {Promise<Object>} Success or error message
 */
export async function sendEmailNotification(data) {
  try {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Simulate success response
    return {
      message: `Notification email sent for reservation on ${data.reservationDate}.`,
    };
  } catch (error) {
    console.error("sendEmailNotification error:", error.message);
    throw error;
  }

  /**
   * Real implementation example:
   *
   * return fetch(`${API_BASE_URL}/api/notify`, {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify(data),
   * }).then((res) => {
   *   if (!res.ok) throw new Error("Email notification failed.");
   *   return res.json();
   * });
   */
}
