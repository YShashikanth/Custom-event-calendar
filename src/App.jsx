// App.jsx
import React, { useState, useEffect } from "react";
import { addMonths, subMonths, format } from "date-fns";
import CalendarGrid from "./components/Calendar";
import EventModal from "./components/EventModal";

import "./index.css"; // import Tailwind CSS + custom styles

const LOCAL_STORAGE_KEY = "my-calendar-events";

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setEvents(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const onDayClick = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const onSaveEvent = (event) => {
    setEvents((prev) => {
      const dayEvents = prev[event.date] || [];
      return {
        ...prev,
        [event.date]: [...dayEvents, event],
      };
    });
  };

  // Inside App.jsx

  return (
    <div className="app-wrapper flex justify-center p-4 bg-gray-50 min-h-screen">
      <div className="calendar-container bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <header className="calendar-header flex justify-between items-center mb-6">
          <button
            className="btn px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            Previous
          </button>
          <h1 className="month-label text-lg font-semibold text-gray-700">
            {format(currentMonth, "MMMM yyyy")}
          </h1>
          <button
            className="btn px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            Next
          </button>
        </header>

        <CalendarGrid
          currentMonth={currentMonth}
          events={events}
          onDayClick={onDayClick}
          className="max-w-full"
        />

        <EventModal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          selectedDate={selectedDate}
          onSave={onSaveEvent}
        />
      </div>
    </div>
  );
}
