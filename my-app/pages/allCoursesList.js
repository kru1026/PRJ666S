import { useState, useEffect } from "react";
import { getAllCourses } from "@/lib/authenticate";
import { getToken } from "@/lib/authenticate";
import CourseCard from "@/components/CourseCard";

export default function AllCoursesList() {

    const [courses, setCourses] = useState([]);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = getToken();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getAllCourses();
                // Sort the courses alphabetically by course name
                const sortedCourses = data.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
                setCourses(sortedCourses);
            } catch (err) {
                setError(err.message);
            }
        };
    
        fetchCourses();
    }, []);

    return (
        <div className="container-sm">
          {token && storedUser && <h1>Welcome: {storedUser.userName}</h1>}
      
          {courses && courses.length > 0 && (
            <>
              <h2>List of all courses</h2><br />
              <h4>Seneca Polytechnic</h4><br />
              <h5>Computer Programming & Analysis (CPA)</h5>
              {courses
  .filter(
    (course) =>
      course.institution === "Seneca Polytechnic" &&
      course.program === "Computer Programming & Analysis (CPA)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

<h5>Accounting & Finance (ACF)</h5>
{courses
  .filter(
    (course) =>
      course.institution === "Seneca Polytechnic" &&
      course.program === "Accounting & Finance (ACF)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

<h5>Chemical Engineering Technology (CHY)</h5>
{courses
  .filter(
    (course) =>
      course.institution === "Seneca Polytechnic" &&
      course.program === "Chemical Engineering Technology (CHY)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

<h4>George Brown College</h4><br />
<h5>Computer Systems Technician (T141)</h5>
{courses
  .filter(
    (course) =>
      course.institution === "George Brown College" &&
      course.program === "Computer Systems Technician (T141)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

  <h5>Aerospace Engineering</h5>
{courses
  .filter(
    (course) =>
      course.institution === "George Brown College" &&
      course.program === "Aerospace Engineering"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

<h5>Art and Design Foundation (G108)</h5>
{courses
  .filter(
    (course) =>
      course.institution === "George Brown College" &&
      course.program === "Art and Design Foundation (G108)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

<h5>Business – Accounting (B103)</h5>
{courses
  .filter(
    (course) =>
      course.institution === "George Brown College" &&
      course.program === "Business – Accounting (B103)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

<h4>Centennial College</h4><br />
<h5>Addiction and Mental Health Worker (1235)</h5>
{courses
  .filter(
    (course) =>
      course.institution === "Centennial College" &&
      course.program === "Addiction and Mental Health Worker (1235)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

<h5>Aerospace Manufacturing Engineering Technician (Optional Co-op) (3722)</h5>
{courses
  .filter(
    (course) =>
      course.institution === "Centennial College" &&
      course.program === "Aerospace Manufacturing Engineering Technician (Optional Co-op) (3722)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />

<h5>Architectural Technician (3101)</h5>
{courses
  .filter(
    (course) =>
      course.institution === "Centennial College" &&
      course.program === "Architectural Technician (3101)"
  )
  .map((course) => (
    <span className="mx-2" key={course._id}>
      <CourseCard course={course} />
    </span>
  ))}<br /><br />
            </>
          )}
        </div>
      );
};
