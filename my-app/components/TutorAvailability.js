import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { addDays, startOfWeek } from 'date-fns'; // For date calculations
import { getUserById } from '@/pages/api/user';
import { createAvailability } from '@/pages/api/createAvailability';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { deleteAvailability } from '@/pages/api/deleteAvailability';
import { addWeeks } from 'date-fns';

const MyFullCalendar = () => {

const [user, setUser] = useState([]);

const [showDatePicker, setShowDatePicker] = useState(false);
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);

const [showDeleteMenu, setShowDeleteMenu] = useState(false);
const [selectedDay, setSelectedDay] = useState(null);
const [selectedTime, setSelectedTime] = useState(null);

// const [availability, setAvailability] = useState(() => {
//   const savedAvailability = localStorage.getItem('availability');
//   // localStorage.removeItem('availability');
//   return savedAvailability ? JSON.parse(savedAvailability) : ''; 
// });

const [availability, setAvailability] = useState(() => {
  const savedAvailability = localStorage.getItem('availability');
  return savedAvailability ? JSON.parse(savedAvailability) : '';
});

const [existingDays, setExistingDays] = useState([]);
const [existingTimes, setExistingTimes] = useState([]);

const storedUser = JSON.parse(localStorage.getItem('user'));
const viewingUserId = localStorage.getItem('viewingUserId');

const getStartTimeString = (startTime) => {
  const startHour = new Date(startTime).getHours().toString().padStart(2, '0'); // Ensures 2-digit format for hours
  const startMinute = new Date(startTime).getMinutes().toString().padStart(2, '0'); // Ensures 2-digit format for minutes
  const startTimeString = `${startHour}:${startMinute}`;
  return startTimeString;
}

const getEndTimeString = (endTime) => {
  const endHour = new Date(endTime).getHours().toString().padStart(2, '0'); // Ensures 2-digit format for hours
  const endMinute = new Date(endTime).getMinutes().toString().padStart(2, '0'); // Ensures 2-digit format for minutes
  const endTimeString = `${endHour}:${endMinute}`;
  return endTimeString;
}

const daysOfWeek2 = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

useEffect(() => {
  const fetchUser = async () => {
      try {
          const data = await getUserById(viewingUserId);

          setUser(data);
          
          setAvailability(data.availability);

          localStorage.setItem('availability', [JSON.stringify(data.availability)]);

      } catch (err) {
          setError(err.message);
      }
  };

  fetchUser();
}, [viewingUserId]);

useEffect(() => {
  const setDays = () => {
    if (!availability) return; // Exit early if availability is undefined

    const days = availability.map(slot => ({
      day: daysOfWeek2[new Date(slot.startTime).getDay()], 
      startTime: slot.startTime, 
      endTime: slot.endTime 
    }));
    setExistingDays(days);
  };

  setDays();
}, [availability]);


const getHighlightEvents = () => {
  const daysOfWeek = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday:7
  };

  // const highlightTimes = availability.map(slot => ({
  //   day: new Date(slot.startTime),
  //   startTime: getStartTimeString(slot.startTime),
  //   endTime: getEndTimeString(slot.endTime)
  // }));

  const highlightTimes = availability? availability.map(slot => {
    const startDate = new Date(slot.startTime);
    const day = new Date(startDate); // Create a Date object from the startTime
  
    // Set the time to midnight to ensure it represents just the date
    day.setHours(0, 0, 0, 0); // Set time to 00:00:00 for the day
  
    return {
      day, // This now represents the date without time
      startTime: getStartTimeString(slot.startTime),
      endTime: getEndTimeString(slot.endTime),
    };
  }) : [];

  const events = highlightTimes.map(({ day, startTime, endTime }) => {
    // Extract hours and minutes from startTime
    const [startHour, startMinute] = startTime.split(':');
    const start = new Date(day); // Start with the day and set the time
    start.setHours(startHour);
    start.setMinutes(startMinute);
  
    // Extract hours and minutes from endTime
    const [endHour, endMinute] = endTime.split(':');
    const end = new Date(day); // Start with the day and set the time
    end.setHours(endHour);
    end.setMinutes(endMinute);
  
    return {
      title: 'Available', // Set the title for the event
      start, // The start date and time
      end,   // The end date and time
      color: 'rgba(0, 255, 0, 0.3)', // Green background
      textColor: '#000000', // Black text
    };
  });
  
  // Now `events` contains all your event objects
  return events;
};


  const [events, setEvents] = useState([]);

  useEffect(() => {
    const highlightEvents = getHighlightEvents();
    setEvents(highlightEvents);
  }, []);

  const handleSelect = (e) => {
    const selectedDayTime = e.target.value;
    const slot = availability.find(item => item.startTime === selectedDayTime);
    setSelectedDay(slot); 
  };

  const handleDelete = () => {
    if (selectedDay) {
      console.log(selectedDay._id);
      deleteAvailability(selectedDay._id);
      alert(`Deleted availability for ${selectedDay.startTime}`);
      setSelectedDay(null);
      window.location.reload();
    } else {
      alert("Please select a day to delete.");
    }
  };

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
  };

  const filterTime = (time) => {
    const hour = time.getHours();
    return hour >= 8 && hour < 19; // 9 AM (inclusive) to 5 PM (exclusive)
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events} 
        editable={false}
        selectable={false}
        dayMaxEvents={true}
      /><br />
      
      {storedUser._id === user._id && (
      <div>
      <button
      onClick={() => {
          const availabilityData = {
              _id: user._id,
              availability: { 
                  startTime: startDate, // Ensure startDate is in the correct format
                  endTime: endDate // Ensure endDate is in the correct format
              }
          };
  
          createAvailability(availabilityData)
              .then(updatedUser => {
                  console.log("Updated User:", updatedUser);
                  setShowDatePicker(false);
                  window.location.reload();
                  setStartDate(null);
              })
              .catch(error => {
                  console.error("Error:", error);
              });
      }}
      disabled={!startDate || !endDate} // Disable if startDate or endDate are not set
  >
      Create Availability
  </button><br/><br />
  
      
<div>
      {/* Button to toggle date/time picker */}
      <button onClick={() => setShowDatePicker(!showDatePicker)}>
        {showDatePicker ? 'Hide Date Pickers' : 'Show Date Pickers'}
      </button><br />

      {/* Show the date picker when the button is clicked */}
      {showDatePicker && (
         <><br /><label>Select Start Date and Time:</label><br /><DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect // Enable time selection
            showTimeSelectOnly={false} // Show date and time selection together
            timeIntervals={15} // Time intervals in minutes
            dateFormat="MMMM d, yyyy h:mm aa" // Format for date and time
            timeFormat="HH:mm" // 24-hour format for time
            placeholderText="Select Date and Time"
            inline // Optional: If you want it to appear inline
            filterDate={isWeekday}
            filterTime={filterTime}
          /></>
      )} <br />
   

    
         {showDatePicker && (
         <><br /><label>Select End Date and Time:</label><br /><DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect // Enable time selection
            showTimeSelectOnly={false} // Show date and time selection together
            timeIntervals={15} // Time intervals in minutes
            dateFormat="MMMM d, yyyy h:mm aa" // Format for date and time
            timeFormat="HH:mm" // 24-hour format for time
            placeholderText="Select Date and Time"
            inline // Optional: If you want it to appear inline
            filterDate={isWeekday}
            filterTime={filterTime}
          /><br /><br /></>
      )}

       
<div>
      <button onClick={() => setShowDeleteMenu(!showDeleteMenu)}>
        {showDeleteMenu ? 'Hide Delete Menu' : 'Delete Availability'}
      </button><br /><br />
      </div>

      {showDeleteMenu && (
        <div>
          <label>Select Day and Time:</label>
          <select onChange={handleSelect} defaultValue="">
        <option value="" disabled>Select Day and Time</option>
        {existingDays.map((day) => (
          <option key={day} value={day.startTime}>
          {new Date(day.startTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} - {new Date(day.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
          })}
        </option>
        ))}
      </select><br />

          <br />

          <button onClick={handleDelete} disabled={!selectedDay}>
            Confirm Delete
          </button>
        </div>
      )}
    </div>
      
          </div>)}

    </div>
  );
};

export default MyFullCalendar;
