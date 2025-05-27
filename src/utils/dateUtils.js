import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";

// Generate matrix of weeks (each with 7 days) for the calendar view of a month
export function generateCalendarMatrix(date) {
  const startMonth = startOfMonth(date);
  const endMonth = endOfMonth(date);

  const startDate = startOfWeek(startMonth, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(endMonth, { weekStartsOn: 0 });

  const weeks = [];
  let day = startDate;

  while (day <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  return weeks;
}

// Format date to YYYY-MM-DD string (for storage keys)
export function formatDateKey(date) {
  return format(date, "yyyy-MM-dd");
}
