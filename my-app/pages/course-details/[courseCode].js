// my-app/pages/course-details/[courseCode.js]

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Card, Form, Row, Col } from 'react-bootstrap';
import { getToken } from '@/lib/authenticate';
import { addCourseToCart } from '@/lib/authenticate';
import { addCourseToUserTeachingCourse } from '../api/user';
import { Nav } from 'react-bootstrap';
import { addTutorToCourse } from '../api/course';
import Link from 'next/link';

const CourseDetails = () => {
  const router = useRouter();
  const { courseCode } = router.query;
  const [course, setCourse] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [purchaseCount, setPurchasedCount] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = getToken();

  const handleTutorChange = (e) => {
    const tutorId = e.target.value;
    const selectedTutorObj = course.assignedTutors.find((tutor) => tutor._id === tutorId);
    setSelectedTutor(selectedTutorObj);
  };

  useEffect(() => {
    if (storedUser) {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (router.isReady && courseCode) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseCode}`)
        .then((res) => res.json())
        .then((data) => setCourse(data))
        .catch((err) => console.error('Failed to load course details:', err));
    }
  }, [router.isReady, courseCode]);

  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/courseRatings?userId=${storedUser._id}&courseCode=${courseCode}`)
  //     .then((res) => res.json())
  //     .then((data) => setRatings(data))
  //     .catch((err) => console.error('Failed to load course ratings:', err));
  // }, [courseCode]);

  useEffect(() => {
  if (!storedUser?._id) {
    setRatings([]);
    return;
  }

  fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/courseRatings?userId=${storedUser._id}&courseCode=${courseCode}`
  )
    .then((res) => res.json())
    .then((data) => {
      setRatings(data);
    })
    .catch((err) => console.error("Failed to load course ratings:", err));
}, [courseCode, storedUser]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/getPurchasedCount?courseCode=${courseCode}`)
      .then((res) => res.json())
      .then((data) => setPurchasedCount(data))
      .catch((err) => console.error('Failed to load course counts:', err));
  }, [courseCode]);

  if (!router.isReady || !course) return <p>Loading...</p>;

  const courseRating = ratings.find(rating => rating._id === course.courseCode);

  // const renderStars = (rating) => (
  //   [...Array(5)].map((_, i) => (
  //     <svg key={i} width="16" height="16" fill={i < rating ? 'gold' : 'gray'}>
  //       <path d="M3.612 15.443c-.396.197-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.396.73-.396.927 0l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.523 3.356.83 4.73c.078.443-.35.789-.746.592L8 13.187l-4.389 2.256z" />
  //     </svg>
  //   ))
  // );

  // const renderStars = (rating) => {
  //   const stars = [];
  //   for (let i = 1; i <= 5; i++) { 
  //     stars.push(
  //       i <= rating ? (
  //         <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gold" className="bi bi-star-fill" viewBox="0 0 16 16">
  //           <path d="M3.612 15.443c-.396.197-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.396.73-.396.927 0l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.523 3.356.83 4.73c.078.443-.35.789-.746.592L8 13.187l-4.389 2.256z" />
  //         </svg>
  //       ) : (
  //         <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="bi bi-star" viewBox="0 0 16 16">
  //           <path d="M2.866 14.85c-.078.443.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.15.746-.592l-.83-4.73 3.523-3.356c.329-.32.158-.888-.283-.95l-4.898-.696L8.465.792c-.197-.396-.73-.396-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.63-.283.95l3.523 3.356-.83 4.73z" />
  //         </svg>
  //       )
  //     );
  //   }
  //   return stars;
  // };

  const renderStars = (rating) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const star = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill={i <= rating ? "gold" : "gray"}
        className={i <= rating ? "bi bi-star-fill" : "bi bi-star"}
        viewBox="0 0 16 16"
      >
        {i <= rating ? (
          <path d="M3.612 15.443c-.396.197-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.396.73-.396.927 0l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.523 3.356.83 4.73c.078.443-.35.789-.746.592L8 13.187l-4.389 2.256z" />
        ) : (
          <path d="M2.866 14.85c-.078.443.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.15.746-.592l-.83-4.73 3.523-3.356c.329-.32.158-.888-.283-.95l-4.898-.696L8.465.792c-.197-.396-.73-.396-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.63-.283.95l3.523 3.356-.83 4.73z" />
        )}
      </svg>
    );

    stars.push(
      <span
        key={i}
        style={{
          position: "relative",
          display: "inline-block",
          marginRight: "2px",
        }}
      >
        {star}
        {!loggedIn && (
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "-2px",
              width: "20px",
              height: "2px",
              background: "red",
              transform: "rotate(-45deg)",
              transformOrigin: "center",
            }}
          />
        )}
      </span>
    );
  }

  return stars;
};

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '50px' }}>
      {token && storedUser && <h1 className="text-start mb-4">Welcome: {storedUser.userName}</h1>}

      <Card className="my-4 p-4 shadow-sm">
        <Row>
          <Col md={4} className="d-flex align-items-center justify-content-center">
            <Card.Img 
              variant="top" 
              src={course.courseImgUrl || "/placeholder.png"} 
              alt="Course Image" 
              style={{ 
                width: '100%', 
                height: 'auto',  // Set height to 'auto' to maintain aspect ratio
                maxHeight: '250px',  // Set a max height to avoid excessive length
                borderRadius: '10px' 
              }} 
            />
          </Col>
          <Col md={8}>
            <Card.Body>
              <h2 className="text-primary mb-4">{course.courseName}</h2>
              <p><strong>Course Code:</strong> {course.courseCode}</p>
              <p><strong>Description:</strong> {course.description}</p>
              <p><strong>Price:</strong> ${course.coursePrice}/hour</p>
              <p><strong>Institution:</strong> {course.institution ? course.institution : "N/A"}</p>
              <p><strong>Program:</strong> {course.program ? course.program : "N/A"}</p>
              <p><strong>Purchased:</strong> {course.purchasedCount ? course.purchasedCount : "N/A"}</p>
              {/* <p><strong>Purchased:</strong> {purchaseCount.feedbackCount ? purchaseCount.feedbackCount : "N/A"}</p> */}
              <p>
                <strong>Average Rating:</strong>{" "}
                {!loggedIn
                  ? "Log in to view ratings"
                  : courseRating
                    ? courseRating.averageRating.toFixed(1)
                    : "Not Rated"}
              </p>
              <div>{renderStars(courseRating?.averageRating || 0)}</div><br />
              <p><strong>Instructors: </strong> 
              {course.assignedTutors && course.assignedTutors.length > 0 ? (
  course.assignedTutors.map((tutor, index) => (
    <span key={tutor._id}>
      <Nav.Link
      as={Link}
        href={`/profile/${tutor._id}`}
        onClick={() => localStorage.setItem('viewingUserId', tutor._id)}
        style={{ display: 'inline', textDecoration: 'underline', color: '#007bff' }}
      >
        {tutor.firstName} {tutor.lastName}
      </Nav.Link>
      {index < course.assignedTutors.length - 1 && ', '}
    </span>
  ))
) : (
  <span>No tutors assigned</span>
)}
              </p>

              {token && storedUser && storedUser.userType === "student" && (
                <>
                  <Form.Group>
                    <Form.Label>Select a Tutor</Form.Label>
                    <Form.Select name="tutor" value={selectedTutor?._id || ''} onChange={handleTutorChange}>
                      <option value="" disabled>Select a Tutor</option>
                      {course.assignedTutors && course.assignedTutors.length > 0 ? (
  course.assignedTutors.map((tutor) => (
    <option key={tutor._id} value={tutor._id}>
      {tutor.firstName} {tutor.lastName}
    </option>
  ))
) : (
  <option disabled>No tutors assigned</option>
)}
                    </Form.Select>
                  </Form.Group>
                  <Button className="mt-3" variant="success" onClick={async () => {
                    if (!selectedTutor) {
                      alert("Please select a tutor before adding the course.");
                      return;
                    }
                    try {
                      await addCourseToCart(
                        storedUser.userName,
                        course.courseCode,
                        course.courseName,
                        course.courseImgUrl,
                        course.coursePrice,
                        `${selectedTutor.firstName} ${selectedTutor.lastName}`
                      );
                      alert("Course added to cart!");
                    } catch (error) {
                      console.error("Error adding course to cart:", error);
                    }
                  }}>
                    Add Course
                  </Button>
                </>
              )}

              {token && storedUser && storedUser.userType === "tutor" && (
                <Button className="mt-3" variant="primary" disabled onClick={async () => {
                  try {
                    await addCourseToUserTeachingCourse(storedUser._id, course._id);
                    await addTutorToCourse(course._id, storedUser._id);
                    alert("Course added to teach!");
                    window.location.reload();
                  } catch (error) {
                    alert("Course already in teaching list");
                    console.error("Error adding course to teach:", error);
                  }
                }}>
                  Add Course to Teach
                </Button>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>

      <Button
        variant="secondary"
        className="position-fixed"
        style={{ bottom: '20px', right: '20px' }}
        onClick={() => router.back()}
      >
        Back
      </Button>
    </div>
  );
};

export default CourseDetails;
