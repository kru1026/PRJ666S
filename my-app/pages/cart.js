// my-app/pages/cart.js

import { useState, useEffect } from "react";
import { getAllCarts, getToken, removeOneCourseFromCart } from "@/lib/authenticate";
import { Button, Card, Row, Col, Container } from "react-bootstrap";
import { useRouter } from "next/router";

export default function Cart() {
    const [carts, setCarts] = useState([]);
    const [error, setError] = useState(null);
    const token = getToken();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const router = useRouter();

    useEffect(() => {
        const fetchCarts = async () => {
            try {
                const data = await getAllCarts(storedUser.userName);
                setCarts(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchCarts();
    }, []);

    const handleAddMoreCourses = () => {
        alert("Let's go to the search page, where you can find more courses to add.");
        router.push('/search'); // Navigate to the search page
    };

    const handleRemoveCourse = async (courseCode) => {
        try {
            await removeOneCourseFromCart(courseCode);
            setCarts(carts.filter(course => course.courseCode !== courseCode));
        } catch (error) {
            console.error("Error removing course from cart:", error);
        }
    };

    if (error) {
        return <h2 className="text-danger">{error}</h2>;
    }

    return (
        <Container className="mt-4">
            <h1 className="text-start mb-4">Welcome, {storedUser?.userName}</h1>
            <h2 className="text-center mb-4">Courses in Your Cart</h2>

            <Row className="mb-4">
                {carts.length === 0 ? (
                    <Col className="text-center">
                        <p>Your cart is currently empty.</p>
                    </Col>
                ) : (
                    carts.map((course) => (
                        <Col md={4} sm={6} xs={12} className="mb-4" key={course.courseCode}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Img
                                    variant="top"
                                    src={course.courseImgUrl || "/placeholder.png"}
                                    style={{ height: '150px', objectFit: 'cover' }}
                                    alt={`${course.courseName} image`}
                                />
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <div>
                                        <Card.Title className="text-primary">{course.courseName}</Card.Title>
                                        <Card.Text>
                                            <strong>Code:</strong> {course.courseCode} <br />
                                            <strong>Price:</strong> ${course.coursePrice}/hr <br />
                                            <strong>Tutor:</strong> {course.selectedTutor || "N/A"} <br />
                                        </Card.Text>
                                    </div>
                                    <Button
                                        variant="outline-danger"
                                        className="w-100 mt-3"
                                        onClick={() => handleRemoveCourse(course.courseCode)}
                                    >
                                        Remove from Cart
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {carts.length > 0 && (
                <Row className="mt-4 text-center">
                    <Col md={6}>
                        <Button
                            variant="success"
                            className="w-100"
                            onClick={() => router.push('/payment')}
                        >
                            Proceed to Payment
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Button
                            variant="primary"
                            className="w-100"
                            onClick={handleAddMoreCourses}
                        >
                            Add More Courses
                        </Button>
                    </Col>
                </Row>
            )}
        </Container>
    );
}
