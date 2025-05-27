import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  isToday,
} from "date-fns";

interface EventType {
  id: number;
  date: string;
  title: string;
  time: string;
  description: string;
  color: string;
  recurrence: string;
  customDates?: string[];
  exceptions?: string[];
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventType[]>(() => {
    const savedEvents = localStorage.getItem("events");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formData, setFormData] = useState<Omit<EventType, "id">>({
    title: "",
    date: "",
    time: "",
    description: "",
    color: "#2563eb",
    recurrence: "None",
    customDates: [],
  });
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<EventType, "id">>({
    title: "",
    date: "",
    time: "",
    description: "",
    color: "#2563eb",
    recurrence: "None",
    customDates: [],
  });
  const [showDeleteOccurrenceConfirm, setShowDeleteOccurrenceConfirm] =
    useState(false);
  const [deleteOccurrenceDate, setDeleteOccurrenceDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Persist events to localStorage
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Conflict checking function
  const hasConflict = (date: string, time: string, ignoreId?: number) => {
    return events.some(
      (event) =>
        event.date === date && event.time === time && event.id !== ignoreId
    );
  };

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    [event.title, event.description].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const eventsOnDate = (date: string) => {
    const checkDate = startOfDay(parseISO(date));
    return filteredEvents.filter((event) => {
      const eventDate = startOfDay(parseISO(event.date));
      if (event.exceptions?.includes(date)) return false;
      if (event.recurrence === "None") return event.date === date;
      if (event.recurrence === "Daily") return checkDate >= eventDate;
      if (event.recurrence === "Weekly")
        return (
          checkDate >= eventDate && checkDate.getDay() === eventDate.getDay()
        );
      if (event.recurrence === "Monthly")
        return (
          checkDate >= eventDate && checkDate.getDate() === eventDate.getDate()
        );
      if (event.recurrence === "Custom")
        return event.customDates?.includes(date) ?? false;
      return false;
    });
  };

  const isExceptionOnDate = (date: string) => {
    return events.some((event) => event.exceptions?.includes(date));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, event: EventType) => {
    e.dataTransfer.setData("text/plain", event.id.toString());
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData("text/plain"));
    const draggedEvent = events.find((event) => event.id === draggedId);

    if (!draggedEvent) return;

    // Check for conflicts
    if (hasConflict(targetDate, draggedEvent.time, draggedId)) {
      alert("Time conflict detected!");
      return;
    }

    // Handle recurring events by creating exception
    if (draggedEvent.recurrence !== "None") {
      const updatedEvent = {
        ...draggedEvent,
        exceptions: [...(draggedEvent.exceptions || []), draggedEvent.date],
      };
      const newEvent = {
        ...draggedEvent,
        id: Date.now(),
        date: targetDate,
        recurrence: "None",
        exceptions: [],
      };
      setEvents([
        ...events.map((e) => (e.id === draggedId ? updatedEvent : e)),
        newEvent,
      ]);
    } else {
      setEvents(
        events.map((event) =>
          event.id === draggedId ? { ...event, date: targetDate } : event
        )
      );
    }
  };

  const handleAddEvent = () => {
    if (!selectedDate || !formData.title) return;

    // Check for conflicts
    if (hasConflict(selectedDate, formData.time)) {
      alert("Time conflict detected!");
      return;
    }

    const newEvent: EventType = {
      ...formData,
      date: selectedDate,
      id: Date.now(),
      customDates:
        formData.recurrence === "Custom"
          ? formData.customDates || []
          : undefined,
      exceptions: [],
    };

    setEvents([...events, newEvent]);
    setFormData({
      title: "",
      date: "",
      time: "",
      description: "",
      color: "#2563eb",
      recurrence: "None",
      customDates: [],
    });
    setSelectedDate("");
  };
  const handleDeleteEventSeries = (id: number) => {
    setEvents(events.filter((e) => e.id !== id));
    setEditingEvent(null);
    setShowDeleteOccurrenceConfirm(false);
  };

  const handleDeleteOccurrenceOnly = (event: EventType, date: string) => {
    if (!event.exceptions) event.exceptions = [];
    if (!event.exceptions.includes(date)) {
      event.exceptions.push(date);
    }

    setEvents((prevEvents) =>
      prevEvents.map((e) => (e.id === event.id ? { ...event } : e))
    );
    setEditingEvent(null);
    setShowDeleteOccurrenceConfirm(false);
  };

  const handleDeleteClick = (event: EventType, date: string) => {
    if (event.recurrence === "None") {
      handleDeleteEventSeries(event.id);
    } else {
      setEditingEvent(event);
      setDeleteOccurrenceDate(date);
      setShowDeleteOccurrenceConfirm(true);
    }
  };

  const openEditForm = (event: EventType) => {
    setEditingEvent(event);
    setEditFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      color: event.color,
      recurrence: event.recurrence,
      customDates: event.customDates || [],
    });
  };

  const handleSaveEdit = () => {
    if (!editingEvent) return;

    const updatedEvent: EventType = {
      ...editingEvent,
      ...editFormData,
      customDates:
        editFormData.recurrence === "Custom"
          ? editFormData.customDates || []
          : undefined,
      exceptions: editingEvent.exceptions || [],
    };

    setEvents(events.map((e) => (e.id === editingEvent.id ? updatedEvent : e)));
    setEditingEvent(null);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-center text-2xl font-bold mb-4">🗓️ Event Calendar</h1>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <input
          type="text"
          placeholder="Search events..."
          className="p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-7 text-center font-bold mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const formattedDay = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, currentDate);
          const eventsForDay = eventsOnDate(formattedDay);

          return (
            <div
              key={formattedDay}
              className={`border p-2 rounded min-h-32 overflow-y-auto ${
                inMonth ? "bg-white" : "bg-gray-100"
              } ${isToday ? "border-2 border-blue-400" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, formattedDay)}
            >
              <div className="text-center mb-1 relative">
                <span className={`${isToday ? "text-blue-600 font-bold" : ""}`}>
                  {inMonth ? format(day, "d") : ""}
                </span>
                {isExceptionOnDate(formattedDay) && (
                  <span className="absolute top-1 right-2 text-red-500">✖</span>
                )}
              </div>

              <div className="space-y-1">
                {eventsForDay.map((e) => (
                  <div
                    key={e.id}
                    className="text-xs p-1 rounded text-white cursor-pointer truncate"
                    style={{ backgroundColor: e.color }}
                    title={`${e.title} - ${e.time}`}
                    draggable
                    onDragStart={(event) => handleDragStart(event, e)}
                    onClick={() => openEditForm(e)}
                  >
                    {e.title}
                  </div>
                ))}
              </div>

              {inMonth && (
                <button
                  className="text-xs text-blue-500 mt-1"
                  onClick={() => {
                    setSelectedDate(formattedDay);
                    setFormData((prev) => ({
                      ...prev,
                      date: formattedDay,
                    }));
                  }}
                >
                  Add Event
                </button>
              )}
            </div>
          );
        })}
      </div>


      {/* Add Event Form */}
      {selectedDate && !editingEvent && (
        <div className="mt-6 p-4 border rounded shadow-md bg-gray-50">
          <h3 className="font-bold mb-2">Add Event on {selectedDate}</h3>
          <input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Event Title"
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="p-2 border rounded w-full mb-2"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="p-2 border rounded w-full mb-2"
          />
          <select
            value={formData.recurrence}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({
                ...formData,
                recurrence: val,
                customDates: val === "Custom" ? [] : undefined,
              });
            }}
            className="p-2 border rounded w-full mb-2"
          >
            <option value="None">None</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Custom">Custom</option>
          </select>

          {formData.recurrence === "Custom" && (
            <div className="mb-2">
              <label className="block font-semibold mb-1">Custom Dates:</label>
              <input
                type="date"
                onChange={(e) => {
                  const date = e.target.value;
                  if (date && !formData.customDates?.includes(date)) {
                    setFormData({
                      ...formData,
                      customDates: [...(formData.customDates || []), date],
                    });
                  }
                }}
                className="p-2 border rounded w-full"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.customDates || []).map((date) => (
                  <span
                    key={date}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {date}{" "}
                    <button
                      className="text-red-500 ml-1"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          customDates: formData.customDates?.filter(
                            (d) => d !== date
                          ),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <input
            type="color"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value })
            }
            className="w-full mb-4"
          />
          <button
            onClick={handleAddEvent}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Event
          </button>
        </div>
      )}

      {/* Edit Event */}
      {editingEvent && (
        <div className="mt-6 p-4 border rounded shadow-md bg-gray-50">
          <h3 className="font-bold mb-2">Edit Event</h3>
          <input
            value={editFormData.title}
            onChange={(e) =>
              setEditFormData({ ...editFormData, title: e.target.value })
            }
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="time"
            value={editFormData.time}
            onChange={(e) =>
              setEditFormData({ ...editFormData, time: e.target.value })
            }
            className="p-2 border rounded w-full mb-2"
          />
          <textarea
            value={editFormData.description}
            onChange={(e) =>
              setEditFormData({ ...editFormData, description: e.target.value })
            }
            className="p-2 border rounded w-full mb-2"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 mr-2 rounded"
            onClick={handleSaveEdit}
          >
            Save
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() =>
              handleDeleteClick(editingEvent, format(new Date(), "yyyy-MM-dd"))
            }
          >
            Delete
          </button>
        </div>
      )}

      {/* Confirm Delete Occurrence Modal */}
      {showDeleteOccurrenceConfirm && editingEvent && (
        <div className="mt-4 p-4 border bg-white rounded shadow">
          <p className="mb-2">
            Do you want to delete just the occurrence on{" "}
            <strong>{deleteOccurrenceDate}</strong> or the entire series?
          </p>
          <button
            className="bg-yellow-500 text-white px-4 py-2 mr-2 rounded"
            onClick={() =>
              handleDeleteOccurrenceOnly(editingEvent, deleteOccurrenceDate)
            }
          >
            Delete This Occurrence
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 mr-2 rounded"
            onClick={() => handleDeleteEventSeries(editingEvent.id)}
          >
            Delete Entire Series
          </button>
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => setShowDeleteOccurrenceConfirm(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
