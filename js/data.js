import { items, statuses, employees, generateDummyData } from "./utils.js";

// Date range from July 1, 2025 to October 31, 2025
const startDate = new Date(2025, 6, 1); // July 1, 2025 (month 6)
const endDate = new Date(2025, 9, 31); // October 31, 2025 (month 9)

// Export generated dummy data
export const dummyData = generateDummyData(500, startDate, endDate);

// Export item types for selects, directly from items array
export const dummyItemTypes = items;
