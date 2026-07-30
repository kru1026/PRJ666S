// my-app/pages/confirmAppointment.js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/authenticate';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { getAppointmentsForUser } from './api/getAppointments';
import { getRemainingHoursForOneCourse } from './api/getRemainingHoursForOneCourse';

const ConfirmAppointment = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [remainingHours, setRemainingHours] = useState({});

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = getToken();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointmentsForUser(storedUser.userName);
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAppointments();
}, []);


  const goToFeedbackPage = (appointment) => {
    router.push({
      pathname: '/feedback',
      query: {
        sessionId: appointment._id,
        selectedCourse: appointment.selectedCourse,
        selectedTutor: appointment.selectedTutor,
      }
    });
  }

return (
  <Container className="my-5">
    {token && storedUser && (
      <div className="text-center mb-4">
        <h1>Welcome, {storedUser.userName}</h1>
        <h4>Session Details for: {storedUser.firstName} {storedUser.lastName}</h4>
      </div>
    )}

    {appointments.length > 0 ? (
      <Row className="g-4">
        {appointments.map((appointment, index) => (
          <Col key={index} md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{appointment.selectedCourse}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{appointment.selectedTutor}</Card.Subtitle>
                <Card.Text>
                  <strong>Session ID:</strong> {appointment._id} <br />
                  <strong>Start:</strong> {new Date(appointment.startTime).toLocaleString()} <br />
                  <strong>End:</strong> {new Date(appointment.endTime).toLocaleString()} <br />
                  <strong>Duration:</strong> {appointment.duration} minute(s) <br />
                  <strong>Remaining Hours:</strong> {appointment.remainingHoursAfterBooking} <br />
                  <strong>Phone Number:</strong> {appointment.phoneNum}
                </Card.Text>
                <Button variant="success" onClick={() => goToFeedbackPage(appointment)}>
                  Leave Feedback
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    ) : (
      <p className="text-center">No sessions found</p>
    )}

    <div className="text-center mt-4">
      <Button
        href={`/profile/${storedUser._id}`}
        variant="primary"
        className="px-4"
      >
        Back to Profile
      </Button>
    </div>
  </Container>
);
};


export default ConfirmAppointment;
