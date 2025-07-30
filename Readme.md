# SWES Reservation Module — Frontend Technical Assessment

This repository contains the frontend implementation of the **SWES (Staff Wear & Equipment Scheduler) Reservation Module**, developed as part of a technical assessment for Solutia s.r.o.


---

## Live Demo

You can try the application live here:  
[https://swes-assessment.vercel.app/](https://swes-assessment.vercel.app/)

---

## Project Overview

The SWES Reservation Module is a web application that allows users to:

- Create equipment reservations (e.g., boots, helmets, vests) with client-side validation.
- View equipment reservation history with filtering, sorting, pagination, and responsive design.
- Check equipment availability on a calendar with selectable and disabled dates.
- Simulate backend API interactions including network latency, random errors, and conflict handling.
- Simulate sending email notifications on reservation creation with user feedback.
- Provide user-friendly alerts for success, loading, and error states.

---

## Technologies Used

- HTML5, CSS3  
- JavaScript (ES6+) with modular structure  
- Bootstrap 5 for consistent and responsive UI  
- Simulated REST API calls within frontend code (no real backend)  

---

## Features Implemented

- **Reservation Form** with thorough validation (required fields, date logic) and submission simulation.  
- **Equipment List View** supporting multiple filters (date range, item type, status), sorting, pagination, sticky headers, responsive cards for mobile, and loading states.  
- **Calendar View** highlighting available, reserved, and past dates; clicking a date pre-fills the reservation form.  
- **Simulated API Layer** that introduces network latency, random failures, and data conflicts to mimic real backend behavior.  
- **Email Notification Simulation** integrated with API layer and UI feedback alerts for confirmation and error handling.  
- **Error handling and debugging aids** with console logs and user alerts.

---

## Known Limitations & Areas for Improvement

- Some JavaScript modules (`list.js`, `calendar.js`) are relatively large and could be refactored into smaller reusable components or submodules.  
- Network error handling could be centralized for a more uniform user experience across the app.  
- The calendar UI lacks a legend explaining color codes (reserved, available, past) which would improve UX.  
- Loading spinners could be added in the calendar when changing months or item filters to keep UI consistency with the list view.  
- Email notification feedback is currently integrated indirectly with reservation creation; a dedicated user confirmation message could enhance clarity.  
- Additional console logs for key user actions (e.g., filter application, form submissions) would improve debugging ease.  
- Calendar error states (e.g., failed data fetch) are not currently handled in the UI.

---

## How to Run

1. Clone the repository:  
   ```bash
   git clone https://github.com/franaragondev/swes-assessment.git
   ```

2.	Open index.html in a modern web browser (Chrome, Firefox, Edge).

3.	No backend is required; all API calls are simulated inside the frontend.

---

## Project Structure

	•	index.html — Main HTML file with application layout and views.
	•	js/ — JavaScript modules including api.js, form.js, calendar.js, list.js, etc.
	•	styles/ — CSS files for styling and layout.
	•	assets/ — Contains project images such as favicon.

---

## Notes

	•	API calls simulate realistic network latency and have a small probability of failure to emulate real-world network conditions.
	•	Email notifications are simulated with a mock API call that shows success or error messages to users.
	•	The project prioritizes frontend logic, UI/UX, and interaction flow aligned with the assessment requirements.

---

## Contact

For any inquiries related to this technical assessment, contact:  
**Fran Aragón**  
Email: franaragondeveloper@gmail.com

Thank you for reviewing this project!
