// my-app/pages/feedback.js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { submitFeedback } from './api/submitFeedback';
import { getAllTutors } from '@/lib/authenticate';
import Rating from 'react-rating'; // Import react-rating

const Feedback = () => {
  const router = useRouter();
  const { sessionId, selectedCourse, selectedTutor } = router.query;

  const [rating, setRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [tutorId, setTutorId] = useState(null);

  useEffect(() => {
    const fetchTutorsAndMatch = async () => {
      try {
        const tutors = await getAllTutors();
        const tutor = tutors.find(t => `${t.firstName} ${t.lastName}` === selectedTutor);
        if (tutor) {
          setTutorId(tutor._id);
        } else {
          alert('Tutor not found!');
        }
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };

    if (selectedTutor) {
      fetchTutorsAndMatch();
    }
  }, [selectedTutor]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tutorId) {
      alert('Tutor ID not found. Please select a valid tutor.');
      return;
    }

    const feedbackData = {
      sessionId,
      selectedCourse,
      tutorId,
      rating,
      feedbackNote,
    };

    try {
      const response = await submitFeedback(feedbackData);
      alert('Feedback submitted successfully!');
      router.push('/confirmAppointment');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow-sm">
            <h2 className="text-center mb-4">Leave Feedback</h2>
            <Card.Body>
              <p><strong>Session ID:</strong> {sessionId}</p>
              <p><strong>Selected Course:</strong> {selectedCourse}</p>
              <p><strong>Selected Tutor:</strong> {selectedTutor}</p>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Rate the Session</Form.Label>
                  {/* Using react-rating for star rating */}
                  <div className="star-rating">
                    <Rating
                      emptySymbol="far fa-star fa-2x text-warning" // Empty star icon
                      fullSymbol="fas fa-star fa-2x text-warning"   // Filled star icon
                      fractions={2}              // Allows half-star ratings
                      initialRating={rating}
                      onChange={(rate) => setRating(rate)}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Feedback Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Leave your feedback here..."
                    style={{ resize: 'none' }}  // Disabling resize for a cleaner look
                  />
                </Form.Group>

                <div className="text-center">
                  <Button type="submit" variant="primary" size="lg" className="px-5">
                    Submit Feedback
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Feedback;
