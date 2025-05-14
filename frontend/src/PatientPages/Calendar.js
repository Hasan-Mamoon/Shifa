import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(3); // Default: March
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const [highlightedDates, setHighlightedDates] = useState(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch events for the entire month
  const fetchEventsForMonth = useCallback(async () => {
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/calendar?start=${startDate}&end=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/calendar/${date}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    const eventData = { title: newEvent, date: selectedDate };
    console.log('Sending event data:', eventData);
    console.log('Token:', token);

    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      });

      const responseData = await res.json();
      console.log('Server response:', {
        status: res.status,
        data: responseData
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }

      if (res.ok) {
        setEvents([...events, responseData]);
        setNewEvent('');
        setHighlightedDates((prev) => new Set(prev.add(selectedDate)));
      } else {
        console.error('Error response:', responseData);
      }
    } catch (err) {
      console.error('Error adding event:', err);
    }
  };

  // Delete an event
  const handleDeleteEvent = async (id) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/calendar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }

      if (res.ok) {
        setEvents(events.filter((event) => event._id !== id));
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
    <div className="flex flex-col items-center  bg-gray-100 p-4">
      {/* Centered Heading */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-500 to-blue-500 text-transparent bg-clip-text mb-6">
        🌿 Health Event Calendar
      </h1>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full flex">
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
            {!isAuthenticated && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                <p>Please log in to add or manage events.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Log In
                </button>
              </div>
            )}
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
            {isAuthenticated && (
              <div className="mt-4">
                <input
                  type="text"
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  placeholder="New event"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleAddEvent}
                  className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Add Event
                </button>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default Calendar;
