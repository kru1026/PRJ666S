import { useEffect, useState } from 'react';
import { getAllCoursesFromOneUser } from '@/pages/api/getAllCoursesFromOneUser';
import { Card, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';

export default function HistoryOrder() {
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    const [error, setError] = useState(null);
    const router = useRouter(); // Router for navigation

    // Get the stored user from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchPurchasedCourses = async () => {
            try {
                const data = await getAllCoursesFromOneUser(storedUser.userName); // Fetch user's purchased courses
                setPurchasedCourses(data); // Set the fetched courses in the state
            } catch (err) {
                setError(err.message); // Capture the error if there's an issue
            }
        };

        fetchPurchasedCourses();
    }, [storedUser.userName]);

    // Function to handle booking a session
    const handleBookSession = () => {
        router.push('/appointment'); // Navigate to the appointment page
    };

    if (error) {
        return <div className="alert alert-danger">Error: {error}</div>;
    }

    return (
        <div className="container mt-4">
            {/* Row with heading and button aligned */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>My Purchased Courses</h1>
                <Button variant="primary" onClick={handleBookSession} disabled={purchasedCourses.length===0}>Book a Session</Button>
            </div>

            {purchasedCourses.length === 0 ? (
                <p>You have not purchased any courses yet.</p>
            ) : (
                <div className="row">
                    {purchasedCourses.map((course) => (
                        <div key={course.purchasedCourse.courseCode} className="col-md-4">
                            <Card className="mb-3 shadow-sm">
                                <Card.Img variant="top" height="250px" src={course.courseDetails.courseImgUrl} alt={course.courseDetails.courseName} />
                                <Card.Body>
                                    <Card.Title>{course.courseDetails.courseName}</Card.Title>
                                    <Card.Text><strong>Course Code:</strong> {course.purchasedCourse.courseCode}</Card.Text>
                                    <Card.Text><strong>Remaining Hours:</strong> {course.purchasedCourse.remainingHours}</Card.Text>
                                    <Card.Text><strong>Taught By:</strong> {course.purchasedCourse.taughtBy}</Card.Text>
                                    <Card.Text><strong>Price per Hour:</strong> ${course.courseDetails.coursePrice}</Card.Text>
                                    <Card.Text><strong>School:</strong> {course.courseDetails.school}</Card.Text>
                                    <Card.Text style={{ height: '400px', overflow: 'auto' }}><strong>Description:</strong> {course.courseDetails.description}</Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
