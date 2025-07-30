export const items = ["Boots", "Helmet", "Vest"];

// List of employee names
export const employees = [
  "John Smith",
  "Mary Johnson",
  "James Williams",
  "Patricia Brown",
  "Robert Jones",
  "Linda Garcia",
  "Michael Miller",
  "Elizabeth Davis",
  "William Rodriguez",
  "Barbara Martinez",
  "David Hernandez",
  "Jennifer Lopez",
  "Richard Gonzalez",
  "Susan Wilson",
  "Joseph Anderson",
  "Karen Thomas",
  "Charles Taylor",
  "Nancy Moore",
  "Thomas Jackson",
  "Lisa Martin",
];

// Possible statuses for equipment reservations
export const statuses = ["Returned", "Pending", "Overdue"];

/**
 * Generates a random Date object between the given start and end dates
 * @param {Date} start - Start date boundary
 * @param {Date} end - End date boundary
 * @returns {Date} Random date between start and end
 */
export function randomDateBetween(start, end) {
  const diff = end.getTime() - start.getTime(); // time difference in ms
  const newDiff = Math.floor(Math.random() * diff); // random offset within diff
  return new Date(start.getTime() + newDiff); // return new date offset by random ms
}

/**
 * Simulates an API call that resolves to the list of item types
 * @returns {Promise<string[]>} Promise resolving to array of item names
 */
export function getItemTypes() {
  // Simulate asynchronous API response with 200ms delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(items), 200);
  });
}

/**
 * Generates dummy reservation data for testing or development
 * @param {number} count - Number of data entries to generate (default 500)
 * @param {Date} startDate - Start date boundary for random dates
 * @param {Date} endDate - End date boundary for random dates
 * @returns {Array<Object>} Array of generated dummy reservation objects
 */
export function generateDummyData(count = 500, startDate, endDate) {
  const data = [];

  for (let i = 1; i <= count; i++) {
    // Select a random item from the list
    const randomItem = items[Math.floor(Math.random() * items.length)];
    // Select a random status from the statuses list
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    // Select a random employee name from the employees list
    const randomEmployee =
      employees[Math.floor(Math.random() * employees.length)];

    // Generate a random date within the given range
    const date = randomDateBetween(startDate, endDate);

    // If status is "Returned", calculate a return date 3 days after reservation date
    const returnDate =
      randomStatus === "Returned"
        ? new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] // format as YYYY-MM-DD
        : ""; // empty string if not returned

    // Create the reservation object and add to data array
    data.push({
      date: date.toISOString().split("T")[0], // reservation date in YYYY-MM-DD
      itemName: randomItem, // item type reserved
      status: randomStatus, // current status of reservation
      returnDate, // return date or empty string
      employeeName: randomEmployee, // employee who reserved the item
      itemId: `${randomItem[0]}${100 + i}`, // generate item ID like 'B101', 'H102', etc.
    });
  }

  return data;
}
