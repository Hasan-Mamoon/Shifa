import { useState, useEffect, useCallback } from 'react';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(3); // Default: March
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const [highlightedDates, setHighlightedDates] = useState(new Set());

  // Fetch events for the entire month
  const fetchEventsForMonth = useCallback(async () => {
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/calendar?start=${startDate}&end=${endDate}`,
      );
      const data = await res.json();
      const eventDates = new Set(data.map((event) => event.date));
      setHighlightedDates(eventDates);
    } catch (err) {
      console.error('Error fetching month events:', err);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchEventsForMonth();
  }, [fetchEventsForMonth]);

  // Fetch events for a specific date
  const fetchEvents = async (date) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/calendar/${date}`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  // Handle date selection
  const handleDateClick = (day) => {
    const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(
      2,
      '0',
    )}`;
    setSelectedDate(date);
    fetchEvents(date);
  };

  // Add a new event
  const handleAddEvent = async () => {
    if (!newEvent || !selectedDate) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newEvent, date: selectedDate }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvents([...events, data]);
        setNewEvent('');
        setHighlightedDates((prev) => new Set(prev.add(selectedDate))); // Highlight the date
      }
    } catch (err) {
      console.error('Error adding event:', err);
    }
  };

  // Delete an event
  const handleDeleteEvent = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/calendar/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEvents(events.filter((event) => event._id !== id));

        // Remove highlight if no more events remain for the date
        if (events.length === 1) {
          setHighlightedDates((prev) => {
            const newSet = new Set(prev);
            newSet.delete(selectedDate);
            return newSet;
          });
        }
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  // Change month
  const changeMonth = (offset) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
    setEvents([]);
  };

  // Render calendar days
  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(
        2,
        '0',
      )}`;
      const isHighlighted = highlightedDates.has(date);
      const isSelected = selectedDate && selectedDate.endsWith(`-${String(i).padStart(2, '0')}`);

      days.push(
        <div
          key={i}
          className={`p-3 text-center rounded-full cursor-pointer transition ${
            isSelected
              ? 'bg-blue-500 text-white shadow-lg'
              : isHighlighted
                ? 'bg-blue-200 text-black'
                : 'bg-gray-100 hover:bg-blue-200'
          }`}
          onClick={() => handleDateClick(i)}
        >
          {i}
        </div>,
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      {/* Centered Heading */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-500 to-blue-500 text-transparent bg-clip-text mb-6">
        🌿 Health Event Calendar
      </h1>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl flex">
        {/* Calendar Section */}
        <div className="w-2/3">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="text-gray-600 text-lg hover:text-blue-500"
            >
              ◀
            </button>
            <h1 className="text-xl font-bold text-gray-700">
              {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })}{' '}
              {currentYear}
            </h1>
            <button
              onClick={() => changeMonth(1)}
              className="text-gray-600 text-lg hover:text-blue-500"
            >
              ▶
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
        </div>

        {/* Events Section */}
        {selectedDate && (
          <aside className="w-1/3 ml-6 p-4 bg-gray-50 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Events on {selectedDate}</h2>
            <ul>
              {events.map((event) => (
                <li
                  key={event._id}
                  className="flex justify-between items-center bg-white shadow p-2 rounded mb-2"
                >
                  <span className="text-gray-700">{event.title}</span>
                  <button
                    className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <input
                type="text"
                className="border rounded p-2 w-full focus:outline-none"
                placeholder="Add new event"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 mt-2 w-full rounded"
                onClick={handleAddEvent}
              >
                Add Event
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Calendar;
