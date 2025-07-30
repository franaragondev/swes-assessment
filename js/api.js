import { dummyData, dummyItemTypes } from "./data.js";
// const API_BASE_URL = "https://my-backend.com";

// Simulate GET request to fetch data
export function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyData);
    }, 500); // Simulate network delay
  });

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

// Simulate GET request to fetch available item types
export function getItemTypes() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyItemTypes);
    }, 200); // Simulate small network delay
  });

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

// Simulate POST request to create a reservation
export function createReservation(data) {
  return new Promise((resolve, reject) => {
    // Simulate backend validation and save
    setTimeout(() => {
      // Check if date is already reserved for the selected item
      const exists = dummyData.some(
        (res) => res.itemName === data.item && res.date === data.reservationDate
      );

      if (exists) {
        reject(
          new Error("This date is already reserved for the selected item.")
        );
      } else {
        // Add to dummyData (simulate saving)
        dummyData.push({
          date: data.reservationDate,
          itemName: data.item,
          status: "Pending",
          returnDate: "",
          employeeName: data.employeeId, // or map employee ID to name
          itemId: `${data.item[0]}${100 + dummyData.length + 1}`,
        });
        resolve({ message: "Reservation created successfully!" });
      }
    }, 700);
  });

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
