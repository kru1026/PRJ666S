// my-app/pages/tutorsList.js

import { Card, Row, Col, Button } from "react-bootstrap";
import { getAllTutors } from "./api/user";
import { useState, useEffect } from "react";
import { Nav } from 'react-bootstrap';
import Link from "next/link";
import { FaUserTie } from "react-icons/fa";
import { Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaSearch, FaBook, FaUser, FaStar, FaUniversity, FaCertificate } from 'react-icons/fa';
import { getTutorsWithAvgRating } from "./api/getTutorsWithAvgRating";


export default function TutorList() {
    const [tutors, setTutors] = useState([]);
    const [error, setError] = useState(null);
    const [filteredTutors, setFilteredTutors] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayTitle, setDisplayTitle] = useState('false');
    const [searchCriteria, setSearchCriteria] = useState({});

        const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
          defaultValues: {
            tutorRating: "",
            numOfCourses: "",
          },
        });

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const data = await getTutorsWithAvgRating();
                setTutors(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchTutors();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    async function submitForm(data) {
      setSearchQuery(true);
      setSearchCriteria(data); 
      const hasSearchCriteria = data.tutorRating || data.numOfCourses;
      if (hasSearchCriteria) {
        setDisplayTitle(false);
      } else {
        setDisplayTitle(true);
      }
        try {
          const filteredTutors = tutors.filter(tutor => {
    
            const ratingMatch = data.tutorRating
              ? Math.trunc(tutor.averageRating) == data.tutorRating
              : true;

              const numOfCoursesMatch = data.numOfCourses
              ? data.numOfCourses === "moreThan5"
                  ? tutor.numberOfCourses > 5 // If selected "more than 5"
                  : tutor.numberOfCourses == data.numOfCourses // Exact number of courses match
              : true;
    
            return ratingMatch && numOfCoursesMatch;
            });

            if (filteredTutors.length === 0) {
            alert("No tutors found matching your filters.");
            }
    
          setFilteredTutors(filteredTutors);
          setIsSubmitted(true);
          reset();
        } catch (error) {
          console.error("Error fetching or filtering courses:", error);
        }
      }

      useEffect(() => {
        const defaultData = {
          tutorRating: "",
          numOfCourses: ""
        };
        for (const prop in defaultData) {
          setValue(prop, defaultData[prop]);
        }
      }, [setValue]);
      


    return (
        <>
        <Form onSubmit={handleSubmit(submitForm)} className="mb-4">
    
          <Form.Group className="mb-3">
              <Form.Label><FaStar className="me-1" />Tutor Rating</Form.Label>
              <Form.Select {...register("tutorRating")}>
                <option value="">Select tutor's rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaStar className="me-1" />Number of courses</Form.Label>
              <Form.Select {...register("numOfCourses")}>
                <option value="">Select number of courses tutor teaches</option>
                <option value="moreThan5">More than 5 Courses</option>
                <option value="5">5 Courses</option>
                <option value="4">4 Courses</option>
                <option value="3">3 Courses</option>
                <option value="2">2 Courses</option>
                <option value="1">1 Courses</option>
              </Form.Select>
            </Form.Group>

            <div className="text-center mt-4">
          <Button variant="primary" type="submit" size="lg">
            <FaSearch className="me-2" /> Get Tutors List
          </Button>
        </div>
          
        </Form>
        <div className="tutor-list-container">
        <h2 className="text-center my-4">
            {displayTitle ? "All Tutors" : "Filtered Tutors"}
        </h2>
            <Row className="g-3">
            {searchQuery ? (
  filteredTutors.map((tutor) => (
    <Col md={6} lg={4} key={tutor._id}>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center">
            <FaUserTie size={32} className="me-3 text-primary" />
            <div>
              <Nav.Link
                as={Link}
                href={`/profile/${tutor?._id || ""}`}
                onClick={() => localStorage.setItem('viewingUserId', tutor._id)}
                className="text-decoration-none"
              >
                <h5 className="mb-1">{tutor.firstName} {tutor.lastName}</h5>
                {searchCriteria.tutorRating && !searchCriteria.numOfCourses && (<p className="mb-1">Rating: {tutor.averageRating}</p>)}
                {searchCriteria.numOfCourses && !searchCriteria.tutorRating && (<p className="mb-1">Number of Teaching Courses: {tutor.numberOfCourses}</p>)}
                {!searchCriteria.numOfCourses && !searchCriteria.tutorRating && (<p><span className="text-muted small">Experienced Tutor</span></p>)}
                {searchCriteria.numOfCourses && searchCriteria.tutorRating && (<p className="mb-1">Rating: {tutor.averageRating} | Number of Teaching Courses: {tutor.numberOfCourses}</p>)}
              </Nav.Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  ))
) : (
  tutors.map((tutor) => (
    <Col md={6} lg={4} key={tutor._id}>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center">
            <FaUserTie size={32} className="me-3 text-primary" />
            <div>
              <Nav.Link
                as={Link}
                href={`/profile/${tutor?._id || ""}`}
                onClick={() => localStorage.setItem('viewingUserId', tutor._id)}
                className="text-decoration-none"
              >
                <h5 className="mb-1">{tutor.firstName} {tutor.lastName}</h5>
                {searchCriteria.tutorRating && !searchCriteria.numOfCourses && (<p className="mb-1">Rating: {tutor.averageRating}</p>)}
                {searchCriteria.numOfCourses && !searchCriteria.tutorRating && (<p className="mb-1">Number of Teaching Courses: {tutor.numberOfCourses}</p>)}
                {!searchCriteria.numOfCourses && !searchCriteria.tutorRating && (<p><span className="text-muted small">Experienced Tutor</span></p>)}
                {searchCriteria.numOfCourses && searchCriteria.tutorRating && (<p className="mb-1">Rating: {tutor.averageRating} | Number of Teaching Courses: {tutor.numberOfCourses}</p>)}
              </Nav.Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  ))
)}

            </Row>
        </div></>
    );
};
