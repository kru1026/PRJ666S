// my-app/pages/appointment.js

import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { createAppointment } from './api/createAppointment';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
//import { getAllTutors } from './api/user';
import { getAppointmentsForUser } from './api/getAppointments';
import { getAllAppointments } from './api/getAllAppointments';
import { getAllCoursesFromOneUser } from './api/getAllCoursesFromOneUser';
import { getTutorsByCourseCode } from './api/getTutorsByCourseCode';
import { getRemainingHoursForOneCourse } from './api/getRemainingHoursForOneCourse';
import { updateRemainingHours } from './api/updateRemainingHours';
import "react-datepicker/dist/react-datepicker.css";

export default function Appointment() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNum, setPhoneNum] = useState("");
    const [startingDateTime, setStartingDateTime] = useState("");
    const [endingDateTime, setEndingDateTime] = useState("");
    const [warning, setWarning] = useState("");
    const [error, setError] = useState(null);
    const [tutors, setTutors] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState("");
    //const predefinedDurations = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const [appointments, setAppointments] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [allCoursesForStudent, setAllCoursesForStudent] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [remainingHours, setRemainingHours] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    //const [allStarting, setAllStarting] = useState("");
    //const [allEnding, setAllEnding] = useState("");
    const [userAppointments, setUserAppointments] = useState([]);
    const [tutorAppointments, setTutorAppointments] = useState([]);

    const router = useRouter();
    const storedUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchAllCoursesForStudent = async () => {
            try {
                const data = await getAllCoursesFromOneUser(storedUser.userName);
                setAllCoursesForStudent(data);
            } catch (err) {
                if (allCoursesForStudent.length > 0) {
                    setError(err.message);
                }
            }
        };
        fetchAllCoursesForStudent();
    }, []);


    useEffect(() => {
        const fetchAllTutorsForOneCourse = async () => {
            try { 
                const data = await getTutorsByCourseCode(storedUser._id, selectedCourse);
                setTutors(data);
                setError(null); // Clear any previous error if the fetch is successful
            } catch (err) {
                setError(err.message); // Set the error message
            }
        };
    
        if (selectedCourse) {
            fetchAllTutorsForOneCourse();
        }
    }, [selectedCourse]);
    

    useEffect(() => {
        const fetchRemainingHoursForOneCourse = async () => {
            try {
                const data = await getRemainingHoursForOneCourse(storedUser.userName, selectedCourse, selectedTutor);
                setRemainingHours(data);
            } catch (err) {
                if (remainingHours > 0) {
                    setError(err.message);
                }
            }
        };
        if (selectedCourse && selectedTutor){
            fetchRemainingHoursForOneCourse();
        }
        
    }, [selectedCourse, selectedTutor]);

    useEffect(() => {
        const fetchAppointmentsForUser = async () => {
            try {
                const data = await getAppointmentsForUser(storedUser.userName);
                setAppointments(data);
            } catch (err) {
                if (appointments.length > 0) {
                    setError(err.message);
                }
            }
        };
        fetchAppointmentsForUser();
    }, []);

    useEffect(() => {
    const fetchAllAppointments = async () => {
        try {
            const data = await getAllAppointments(storedUser.userName, selectedTutor);
            setAllAppointments(data);
        } catch (err) {
            if (appointments.length > 0) {
                setError(err.message);
            }
        }
    };

    fetchAllAppointments();
}, []);

useEffect(() => {
    const userAppts = allAppointments.filter(
        appointment => appointment.userName === storedUser.userName
    );

    const tutorAppts = allAppointments.filter(
        appointment => appointment.selectedTutor === selectedTutor
    );

    setUserAppointments(userAppts);
    setTutorAppointments(tutorAppts);

}, [allAppointments, storedUser.userName, selectedTutor]);

const checkAvailability = () => {
    const appointmentsToCheck = [
        ...userAppointments,
        ...tutorAppointments
    ];

    for (const appointment of appointmentsToCheck) {
        const appointmentStart = new Date(appointment.startTime);
        const appointmentEnd = new Date(appointment.endTime);

        if (startingDateTime < appointmentEnd && endingDateTime > appointmentStart) {
            return false;
        }
    }

    return true;
};

    // const checkAvailability = () => {
    //     for (const appointment of allAppointments) {

    //         const appointmentStart = new Date(appointment.startTime);
    //         const appointmentEnd = new Date(appointment.endTime);
    //         if (startingDateTime < appointmentEnd && endingDateTime > appointmentStart) {
    //             return false;
    //         }
    //     }
    //     return true;
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const startingDateTimeDateObject = new Date(startingDateTime);
        const endingDateTimeDateObject = new Date(endingDateTime);
        const durationInMinutes = (endingDateTimeDateObject - startingDateTimeDateObject) / 60000;
        const durationInHours = durationInMinutes / 60;

        try {
            if ((remainingHours - durationInHours >= 0)){
                if (checkAvailability()) {
                    if (startingDateTime && endingDateTime) {
                        var remainingHoursAfterBooking = remainingHours - durationInHours;
                        await createAppointment(
                            storedUser.userName,
                            firstName,
                            lastName,
                            phoneNum,
                            selectedTutor,
                            startingDateTimeDateObject,
                            endingDateTimeDateObject,
                            durationInMinutes,
                            selectedCourse,
                            remainingHoursAfterBooking
                        );
                        await updateRemainingHours(storedUser._id, selectedCourse, selectedTutor, (remainingHours - durationInMinutes / 60));
                        setStartingDateTime("");
                        setEndingDateTime("");
                        router.push("/confirmAppointment");
                    }
                } else {
                    setError("Time slot not available. Please choose a different time.");
                }
            }
            else {
                alert("Not enough Remaining Hours for this course.")
            }
        } catch (err) {
            setWarning(err.message);
        }
    };

    const isWeekday = (date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    };

    const workingHours = (time) => {
        const hour = time.getHours();
        return hour >= 9 && hour < 17;
    };

    const sameDay = (date) => {
        const startDate = new Date(startingDateTime);
        return date.getFullYear() === startDate.getFullYear() && date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate();
    };

    const availableTime = (time) => {
        if (!startingDateTime) return true;
        const startTime = new Date(startingDateTime);
        const maxEndTime = new Date(startTime);
        maxEndTime.setMinutes(maxEndTime.getMinutes() + 120);
        return time > startTime && time <= maxEndTime;
    };

    const combinedFilterTime = (time) => availableTime(time) && workingHours(time);

    return (
        <div className="appointment-form">
            <h2>Book a Session</h2>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>First Name</Form.Label>
                            <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group>
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control type="text" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} required />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select Course</Form.Label>
                                <Form.Control as="select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
                                    <option value="" disabled>-- Select a Course --</option>
                                        {Array.from(new Set(allCoursesForStudent.map(course => course.courseDetails.courseName)))
                                        .map((courseName) => {
                                        const course = allCoursesForStudent.find(c => c.courseDetails.courseName === courseName);
                            return (
                                     <option key={course.purchasedCourse.courseCode} value={course.purchasedCourse.courseCode}>
                                    {course.courseDetails.courseName}
                                    </option>
                );
            })}
    </Form.Control>
</Form.Group>

                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select Tutor</Form.Label>
                            <Form.Control as="select" value={selectedTutor} onChange={(e) => setSelectedTutor(e.target.value)} required>
                                <option value="" disabled>-- Select a Tutor --</option>
                                {tutors.map((tutor) => (
                                    <option key={tutor} value={tutor}>{tutor}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mt-3">
                  <Button onClick={() => setShowDatePicker(!showDatePicker)} className="mb-3">
                      {showDatePicker ? 'Hide Date Pickers' : 'Show Date Pickers'}
                  </Button>
                  {showDatePicker && (
                      <>
                          <Row className="align-items-center">
                              <Col md={3}>
                                  <Form.Label>Starting Date and Time</Form.Label>
                              </Col>
                              <Col md={9}>
                                  <Form.Group>
                                      <DatePicker
                                          selected={startingDateTime}
                                          onChange={date => {
                                              setStartingDateTime(date);
                                              setEndingDateTime(null);
                                          }}
                                          showTimeSelect
                                          timeIntervals={15}
                                          dateFormat="MMMM d, yyyy h:mm aa"
                                          filterDate={isWeekday}
                                          filterTime={workingHours}
                                          minDate={new Date()} // Restricts past dates
                                          required
                                      />
                                  </Form.Group>
                              </Col>
                          </Row>

                          <Row className="align-items-center mt-3">
                              <Col md={3}>
                                  <Form.Label>Ending Date and Time</Form.Label>
                              </Col>
                              <Col md={9}>
                                  <Form.Group>
                                      <DatePicker
                                          selected={endingDateTime}
                                          onChange={setEndingDateTime}
                                          showTimeSelect
                                          timeIntervals={15}
                                          dateFormat="MMMM d, yyyy h:mm aa"
                                          filterDate={sameDay}
                                          filterTime={combinedFilterTime}
                                          required
                                      />
                                  </Form.Group>
                              </Col>
                          </Row>
                      </>
                  )}
                </div>

                {warning && <Alert variant="danger">{warning}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Button variant="primary" type="submit" className="mt-3">
                    Book Session
                </Button>
            </Form>

            <style jsx>{`
                .appointment-form {
                    max-width: 800px;
                    margin: auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 10px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .mb-3 {
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
}
