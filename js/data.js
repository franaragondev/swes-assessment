// Array to hold 100 dummy records
const dummyData = [];

// Possible values for random generation
const items = ["Boots", "Helmet", "Vest"];
const statuses = ["Returned", "Pending", "Overdue"];
const employees = [
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

// Generate 100 records with random data
for (let i = 1; i <= 100; i++) {
  // Pick random values for each field
  const randomItem = items[Math.floor(Math.random() * items.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomEmployee =
    employees[Math.floor(Math.random() * employees.length)];

  // Generate random date in July 2025
  const baseDate = new Date(2025, 6, 1); // July is month 6 (0-based)
  const date = new Date(baseDate);
  date.setDate(baseDate.getDate() + Math.floor(Math.random() * 30));

  // Return date only for "Returned" items (3 days later)
  const returnDate =
    randomStatus === "Returned"
      ? new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 days
          .toISOString()
          .split("T")[0]
      : "";

  // Push record into dummyData array
  dummyData.push({
    date: date.toISOString().split("T")[0],
    itemName: randomItem,
    status: randomStatus,
    returnDate: returnDate,
    employeeName: randomEmployee,
    itemId: `${randomItem[0]}${100 + i}`,
  });
}
