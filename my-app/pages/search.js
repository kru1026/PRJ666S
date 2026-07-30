// my-app/pages/search.js

import { Form, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { getAllCourses, getAllTutors } from '@/lib/authenticate';
import CourseCard from '@/components/CourseCard';
import { FaSearch, FaBook, FaUser, FaStar, FaUniversity, FaCertificate } from 'react-icons/fa';
import { getAllCoursesWithRating } from "./api/getAllCoursesWithRating";

export default function AdvancedSearch() {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      courseName: "",
      courseCode: "",
      description: "",
      courseRating: "",
      tutor: "",
      reputation: "",
      institution: "",
      program: ""
    },
  });

  const [filteredCourses, setFilteredCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const tutorList = await getAllTutors();
        setTutors(tutorList);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      }
    }

    async function fetchCoursesData() {
      try {
        const allCourses = await getAllCourses();
        const uniqueInstitutions = [...new Set(allCourses.map(course => course.institution))];
        const uniquePrograms = [...new Set(allCourses.map(course => course.program).filter(Boolean))];
        setInstitutions(uniqueInstitutions);
        setPrograms(uniquePrograms);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchTutors();
    fetchCoursesData();
  }, []);

  // useEffect(() => {
  //   async function fetchAllCoursesWithRating() {
  //     try {
  //       const coursesList = await getAllCoursesWithRating();
  //       setCoursesWithRating(coursesList);
  //     } catch (error) {
  //       console.error("Error fetching courses:", error);
  //     }
  //   }

  //   fetchAllCoursesWithRating();
  // }, []);

  useEffect(() => {
    const defaultData = {
      courseName: "",
      courseCode: "",
      description: "",
      courseRating: "",
      tutor: "",
      reputation: "",
      institution: "",
      program: ""
    };
    for (const prop in defaultData) {
      setValue(prop, defaultData[prop]);
    }
  }, [setValue]);


  const calculateTutorAverageRating = (feedbackArray) => {
    if (!feedbackArray || feedbackArray.length === 0) return null;
    const totalRating = feedbackArray.reduce((sum, feedback) => sum + feedback.rating, 0);
    return (totalRating / feedbackArray.length).toFixed(1);
  };

  async function submitForm(data) {
    setLoading(true);  // Show loading spinner
    try {
      const allCourses = await getAllCoursesWithRating();
      const filtered = allCourses.filter(course => {

        const courseNameMatch = data.courseName
          ? course.courseName.toLowerCase().includes(data.courseName.toLowerCase())
          : true;
        const courseCodeMatch = data.courseCode
          ? course.courseCode.toLowerCase().includes(data.courseCode.toLowerCase())
          : true;
        const descriptionMatch = data.description
          ? course.description.toLowerCase().includes(data.description.toLowerCase())
          : true;

          const courseRatingMatch = data.courseRating
          ? course.averageRating !== null && Math.trunc(course.averageRating) == parseInt(data.courseRating)
          : true;
  
        const tutorMatch = data.tutor
          ? course.assignedTutors.some(tutorId => {
              const tutor = tutors.find(t => t._id === tutorId);
              if (tutor) {
                const tutorInput = data.tutor.trim().toLowerCase();
                const inputParts = tutorInput.split(' ');
                const firstNameMatch = inputParts.some(part => tutor.firstName.toLowerCase().includes(part));
                const lastNameMatch = inputParts.some(part => tutor.lastName.toLowerCase().includes(part));
                return firstNameMatch || lastNameMatch;
              }
              return false;
            })
          : true;
        const reputationMatch = data.reputation
          ? course.assignedTutors.some(tutorId => {
              const tutor = tutors.find(t => t._id === tutorId);
              if (tutor) {
                const averageRating = calculateTutorAverageRating(tutor.feedback);
                // Ensure averageRating is defined and meets or exceeds the selected reputation
                return averageRating !== null && Math.trunc(averageRating) == parseInt(data.reputation);
              }
              return false;
            })
          : true;
        const institutionMatch = data.institution ? course.institution === data.institution : true;
        const programMatch = data.program ? course.program === data.program : true;

        return courseNameMatch && courseCodeMatch && descriptionMatch && tutorMatch && reputationMatch && institutionMatch && programMatch && courseRatingMatch;
      });

      setFilteredCourses(filtered);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Error fetching or filtering courses:", error);
    }
    setLoading(false);  // Hide loading spinner
  }

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-center mb-4">Advanced Course Search</h2>
      <p className="text-center mb-4 text-muted">Find the perfect course by filtering through a variety of criteria.</p>

      <Form onSubmit={handleSubmit(submitForm)} className="mb-4">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaBook className="me-1" /> Course Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course name"
                className={errors.courseName ? "is-invalid" : ""}
                {...register("courseName")}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaCertificate className="me-1" /> Course Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course code"
                {...register("courseCode")}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label><FaSearch className="me-1" /> Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course description"
                {...register("description")}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
        <Form.Group className="mb-3">
              <Form.Label><FaStar className="me-1" />Course Rating</Form.Label>
              <Form.Select {...register("courseRating")}>
                <option value="">Select a rating for courses</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </Form.Select>
            </Form.Group>
            </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaUser className="me-1" /> Tutor</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter tutor's name"
                {...register("tutor")}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaStar className="me-1" /> Reputation of Tutor</Form.Label>
              <Form.Select {...register("reputation")}>
                <option value="">Select tutor's rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaUniversity className="me-1" /> Institution</Form.Label>
              <Form.Select {...register("institution")}>
                <option value="">Select institution</option>
                {institutions.map((institution, index) => (
                  <option key={index} value={institution}>{institution}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaUniversity className="me-1" /> Program</Form.Label>
              <Form.Select {...register("program")}>
                <option value="">Select program</option>
                {programs.map((program, index) => (
                  <option key={index} value={program}>{program}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button variant="primary" type="submit" size="lg">
            <FaSearch className="me-2" /> Search Courses
          </Button>
        </div>
      </Form>

      <h3 className="text-center my-4">Search Results</h3>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <Col key={course.courseCode} xs={12} md={6} lg={4} className="mb-4">
                <CourseCard course={course} />
              </Col>
            ))
          ) : (
            isSubmitted && <p className="text-center text-muted">No matching courses found.</p>
          )}
        </Row>
      )}
    </Card>
  );
}
