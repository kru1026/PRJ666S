// my-app/pages/api/createAppointment.js

export async function createAppointment(userName, firstName, lastName, phoneNum, selectedTutor, startingDateTime, endingDateTime, duration, selectedCourse, remainingHoursAfterBooking ) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/createAppointment`, {
        method: 'POST',
        body: JSON.stringify({ userName: userName, firstName: firstName, lastName: lastName, phoneNum: phoneNum, selectedTutor: selectedTutor, startTime: startingDateTime, endTime: endingDateTime, duration: duration, selectedCourse: selectedCourse, remainingHoursAfterBooking: remainingHoursAfterBooking}),
        headers: {
          'content-type': 'application/json',
        },
      });
    
      const data = await res.json();
    
      if (res.status === 200) {
        return true;
      } else {
        throw new Error(data.message);
      }
    }