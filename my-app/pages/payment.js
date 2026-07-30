// my-app/pages/payment.js
import { addCourseToUser, deleteAllCartsFromOneUser, getToken } from "@/lib/authenticate";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { getAllCarts } from "@/lib/authenticate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAllCoursesFromOneUser } from "./api/getAllCoursesFromOneUser";
import { updateRemainingHours } from "./api/updateRemainingHours";

export default function Payment() {
    const router = useRouter();
    const [carts, setCarts] = useState([]);
    const [hours, setHours] = useState({}); // Store selected hours for each course
    const [error, setError] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [allCourses, setAllCourses] = useState([]);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = getToken();

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

    useEffect(() => {
        const fetchAllCoursesFromOneUser = async () => {
            try {
                const data = await getAllCoursesFromOneUser(storedUser.userName);
                
                if (data === undefined) {
                    // If the data is undefined, treat it as if no action needs to be taken
                    return;
                }
    
                if (!data || data.length === 0) {
                    // Handle case where no courses are found (but not undefined)
                    //setError("No purchased courses found for this user.");
                    //setAllCourses([]); // Optional: Clear existing courses if needed
                    return;
                } else {
                    setAllCourses(data); // Set courses if data exists
                }
            } catch (err) {
                setError(err.message);
            }
        };
    
        if (storedUser.userName) {
            fetchAllCoursesFromOneUser();
        }
    }, [storedUser.userName]);
    
    

    const handleHoursChange = (courseCode, value) => {
        setHours((prev) => ({
            ...prev,
            [courseCode]: value // Update hours for each course
        }));
    };

    const total = carts.reduce((acc, cart) => {
        const selectedHours = hours[cart.courseCode] || 1; // Default to 1 hour if not selected
        return acc + (Number(cart.coursePrice) * selectedHours);
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !cardNumber || !expirationDate || !cvv || !postalCode) {
            setError('Please fill in all fields.');
            return;
        }

        if (!/^\d{16}$/.test(cardNumber)) {
            setError('Card number must be 16 digits.');
            return;
        }

        if (!/^\d{3}$/.test(cvv)) {
            setError('CVV must be 3 digits.');
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(expirationDate)) {
            setError('Expiration date must be in MM/YY format.');
            return;
        }

        if (!/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(postalCode)) {
            setError('Postal Code must be in the format A1A 1A1.');
            return;
        }

        var flag = false;
        let purchasedCourse = null; 

        try {
            for (const cart of carts) {

                const selectedHours = hours[cart.courseCode] || 1; // Default to 1 hour
                
                // Check if cart.courseCode exists in allCourses.purchased (array of course codes)

                for (let i = 0; i < allCourses.length; i++) {
                
                    // Access the purchasedCourse object directly
                    if ((allCourses[i].purchasedCourse.courseCode === cart.courseCode) && (allCourses[i].purchasedCourse.taughtBy === cart.selectedTutor)) {
                        purchasedCourse = allCourses[i].purchasedCourse; // Store the found course
                        flag = true; // Course found
                        
                        break; // Exit the loop
                    }
                   
                }
                
                if (!flag) {
                    
                    // If the course is not in allCourses.purchased, add it
                    await addCourseToUser(cart.userName, cart.courseCode, cart.selectedTutor, selectedHours);
                } else {
                    // If the course is already purchased, update the remaining hours
                    await updateRemainingHours(storedUser._id, cart.courseCode, cart.selectedTutor, purchasedCourse.remainingHours + selectedHours);
                }
            }

            await deleteAllCartsFromOneUser(storedUser.userName);
            router.push("/historyOrder");
        } catch (error) {
            console.error("Error adding courses:", error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Review Your Cart</h1>
            <Row className="mb-4">
                {carts.length > 0 ? (
                    carts.map((cart) => (
                        <Col md={6} lg={4} className="mb-4" key={cart._id}>
                            <Card className="shadow-sm">
                                <Card.Img variant="top" src={cart.courseImgUrl} alt="course image" height={180} />
                                <Card.Body>
                                    <Card.Title>{cart.courseName}</Card.Title>
                                    <Card.Text><strong>Course Code:</strong> {cart.courseCode}</Card.Text>
                                    <Card.Text><strong>Price Per Hour:</strong> ${cart.coursePrice}</Card.Text>
                                    <Card.Text><strong>Selected Tutor:</strong> {cart.selectedTutor}</Card.Text>
                                    <Form.Group>
                                        <Form.Label>Choose Hours:</Form.Label>
                                        <Form.Control as="select"
                                            value={hours[cart.courseCode] || 1} // Default to 1 hour
                                            onChange={(e) => handleHoursChange(cart.courseCode, Number(e.target.value))}
                                        >
                                            {[...Array(10).keys()].map(n => (
                                                <option key={n + 1} value={n + 1}>{n + 1}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p>No courses in your cart.</p>
                )}
            </Row>

            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h5>Total Price: <strong>${total}</strong></h5>
                </Card.Body>
            </Card>

            <Form onSubmit={handleSubmit} className="p-4 border rounded shadow">
                <h2 className="mb-4">Payment Information</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <Form.Group className="mb-3">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Card Number:</Form.Label>
                    <Form.Control
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Expiration Date (MM/YY):</Form.Label>
                            <Form.Control
                                type="text"
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>CVV:</Form.Label>
                            <Form.Control
                                type="text"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Postal Code:</Form.Label>
                    <Form.Control
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button type="submit" className="btn btn-primary btn-block">
                    Pay Now
                </Button>
            </Form>
        </div>
    );
}
