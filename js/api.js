import { dummyData } from "./data.js";

// Simulate GET request to fetch data
export function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyData);
    }, 500); // Simulate network delay
  });
}
