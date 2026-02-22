import React, { useState } from 'react';
import '../styles/calendar.css';

const AvailabilityCalendar = ({ roomId, roomName }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock booked dates (can be replaced with real data from backend)
  const bookedDates = {
    'room-standard': [5, 12, 13, 20],
    'room-deluxe': [8, 15, 22, 25],
    'room-executive': [3, 10, 18, 28]
  };

  const isBooked = (day) => {
    return bookedDates[roomId]?.includes(day) || false;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <h4>{roomName} - Availability</h4>
        <div className="calendar-controls">
          <button onClick={prevMonth} className="nav-btn">❮</button>
          <span className="month-year">{monthName}</span>
          <button onClick={nextMonth} className="nav-btn">❯</button>
        </div>
      </div>

      <div className="calendar-legend">
        <span className="legend-item available">✓ Available</span>
        <span className="legend-item booked">✕ Booked</span>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="days">
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`day ${!day ? 'empty' : isBooked(day) ? 'booked' : 'available'}`}
            >
              {day && (
                <>
                  <span className="day-number">{day}</span>
                  <span className="day-status">{isBooked(day) ? '✕' : '✓'}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="calendar-info">
        <p>📅 Available: {daysInMonth - bookedDates[roomId]?.length || daysInMonth} days</p>
        <p>📍 Booked: {bookedDates[roomId]?.length || 0} days</p>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
