# 📅 Custom Event Calendar

A dynamic, interactive calendar application built with **React** that allows users to manage their schedule with advanced features like recurring events, event editing, conflict management, and drag-and-drop rescheduling.

---

## 🚀 Features

### ✅ Monthly View Calendar
- Traditional monthly calendar layout
- Highlight today’s date
- Navigate between months

### 📝 Event Management
- **Add Events** by clicking on a day
- **Edit Events** with a simple form
- **Delete Events** (single occurrence or full series)

### 🔁 Recurring Events
- Supports recurrence types:
  - **Daily**
  - **Weekly**
  - **Monthly**
  - **Custom** (e.g., every 2 weeks)
- Events repeat accurately across selected days

### 🖱️ Drag-and-Drop Rescheduling
- Easily reschedule events by dragging them to a new date
- Handles edge cases like conflicts and overlapping events

### ⚠️ Conflict Management
- Prevent overlapping events for the same date/time
- Displays warnings on conflicts

### 🔎 Optional Enhancements
- **Search and Filter** events by category or keyword
- **Responsive Design** for mobile and tablet support
- Data persisted using **Local Storage** for offline support

---

## 🛠️ Tech Stack

- **Framework:** React
- **Date Library:** date-fns
- **Drag and Drop:** React DnD or Interact.js
- **State Management:** React State + Hooks
- **Styling:** Tailwind CSS or CSS Modules
- **Persistence:** LocalStorage

---

## 📦 Setup Instructions

```bash
# Clone the repository
git clone https://github.com/your-username/custom-event-calendar.git

# Navigate to project folder
cd custom-event-calendar

# Install dependencies
npm install

# Start the development server
npm start
