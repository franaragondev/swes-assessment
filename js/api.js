import { dummyData, dummyItemTypes } from "./data.js";

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
   * return fetch("https://mi-backend.com/api/reservations")
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
   * return fetch("https://mi-backend.com/api/item-types")
   *   .then((response) => {
   *     if (!response.ok) throw new Error("Error fetching item types");
   *     return response.json();
   *   });
   */
}
