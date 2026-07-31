// my-app/components/MainNav.js

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { NavDropdown, Modal, Alert, Form } from 'react-bootstrap';
import Link from 'next/link';
import { removeToken, readToken } from '@/lib/authenticate';
import { FaSearch, FaHome, FaShoppingCart, FaUserCircle, FaUser, FaClipboardList, FaClock, FaBook, FaClipboard } from 'react-icons/fa';


function MainNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const router = useRouter();
  let token = readToken();

  const handleToggleClick = () => setIsExpanded(!isExpanded);
  const closeExpanded = () => setIsExpanded(false);

  function logout() {
    closeExpanded();
    removeToken();
    localStorage.removeItem("user")
    router.push('/login');
  }

  async function deleteUser(userName) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete`, {
        method: 'POST',
        body: JSON.stringify({ userName, password }),
        headers: { 'content-type': 'application/json' },
      });
      const data = await res.json();
      if (res.status === 200) {
        logout();
        setShowDeleteModal(false);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setErrorMessage('');
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setPassword('');
    setErrorMessage('');
  };

  return (
    <>
      <Navbar expand="lg" className="bg-dark fixed-top navbar-dark py-3" expanded={isExpanded}>
        <Container>
          <Navbar.Brand className="fw-bold text-light">Find Me a Tutor</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleToggleClick} />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {token && storedUser?.userType === "admin" && (
                <Link href="/admin#user" passHref legacyBehavior>
                  <Nav.Link active={router.pathname.includes("/admin")} onClick={closeExpanded} className="ms-3">
                    <FaUser /> Dashboard
                  </Nav.Link>
                </Link>
              )}
              <Link href="/" passHref legacyBehavior>
                <Nav.Link active={router.pathname === "/"} onClick={closeExpanded} className="ms-3">
                  <FaHome /> Home
                </Nav.Link>
              </Link>
              {token && (
                <>
                  <Link href="/search" passHref legacyBehavior>
                    <Nav.Link active={router.pathname === "/search"} onClick={closeExpanded} className="ms-3">
                      <FaSearch /> Advanced Search
                    </Nav.Link>
                  </Link>
                  <Link href="/cart" passHref legacyBehavior>
                    <Nav.Link active={router.pathname === "/cart"} onClick={closeExpanded} className="ms-3">
                      <FaShoppingCart /> Cart
                    </Nav.Link>
                  </Link>
                  <Link href="/tutorsList" passHref legacyBehavior>
                    <Nav.Link active={router.pathname === "/tutorsList"} onClick={closeExpanded} className="ms-3">
                      <FaUser /> Tutors
                    </Nav.Link>
                  </Link>
                  <Link href="/allCoursesList" passHref legacyBehavior>
                    <Nav.Link active={router.pathname === "/allCoursesList"} onClick={closeExpanded} className="ms-3">
                    <FaClipboard /> All Courses
                    </Nav.Link>
                  </Link>
                </>
              )}
            </Nav>
            <Nav>
              {!token && (
                <>
                  <Link href="/register" passHref legacyBehavior>
                    <Nav.Link active={router.pathname === "/register"} onClick={closeExpanded}>Register</Nav.Link>
                  </Link>
                  <Link href="/login" passHref legacyBehavior>
                    <Nav.Link active={router.pathname === "/login"} onClick={closeExpanded}>Login</Nav.Link>
                  </Link>
                </>
              )}
              {token && (
                <NavDropdown title={<><FaUserCircle /> {token.userName}</>} id="basic-nav-dropdown" className="text-light ms-3">
                  {storedUser?.userType === "student" && (
                    <NavDropdown.Item as={Link} href={`/profile/${storedUser?._id || ""}`}>
                      <FaUser /> Profile
                    </NavDropdown.Item>
                  )}
                  {storedUser?.userType === "tutor" && (
                    <NavDropdown.Item as={Link} href={`/profile/${storedUser?._id || ""}`}>
                      <FaUser /> Profile
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} href="/historyOrder">
                    <FaClipboardList /> History Order
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} href="/confirmAppointment">
                    <FaBook /> My Sessions
                  </NavDropdown.Item>
                  {/* {storedUser?.userType === "tutor" && (
                    <NavDropdown.Item as={Link} href={`/tutor/${token.userName}`}>
                      <FaClock /> Availability
                    </NavDropdown.Item>
                  )} */}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>Log out</NavDropdown.Item>
                  <NavDropdown.Item onClick={handleDeleteClick}>Delete Account</NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <br /><br /><br />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form>
            <Form.Group>
              <Form.Label>Please enter your password to confirm deletion:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteUser(token.userName)}>Confirm Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MainNav;
