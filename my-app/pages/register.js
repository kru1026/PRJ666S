// my-app/pages/register.js

import { Card, Form, Alert, Button } from "react-bootstrap";
import { useState, useEffect } from 'react';
import { registerUser } from '@/lib/authenticate';
import { useRouter } from 'next/router';


export default function Register(props){

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState("");
  const [certificate, setCertificate] = useState("");
  const [warning, setWarning] = useState("");

  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');

  const router = useRouter();

  async function handleSubmit(e) {
  e.preventDefault();
  try {
    await registerUser(user, password, password2, email, userType, firstName, lastName, selectedInstitution, selectedProgram);
    
    router.push("/login" );
  } catch (err) {
    setWarning(err.message);
  }
  }

  const institutions = {
    "Seneca Polytechnic": ["Computer Programming & Analysis (CPA)", "Accounting & Finance (ACF)", "Chemical Engineering Technology (CHY)"],
    "George Brown College": ["Computer Systems Technician (T141)", "Art and Design Foundation (G108)", "Business – Accounting (B103)"],
    "Centennial College": ["Addiction and Mental Health Worker (1235)", "Aerospace Manufacturing Engineering Technician (Optional Co-op) (3722)", "Architectural Technician (3101)"]
  };

  const handleInstitutionChanges = (event) => {
    setSelectedInstitution(event.target.value);
    setSelectedProgram(''); // Reset item selection when category changes
  };

  useEffect(() => {
    // Reset selected institution when userType is "tutor"
    if (userType === 'tutor') {
      setSelectedInstitution('');
    }
  }, [userType]);

  return (
    <>
      <Card bg="light">
        <Card.Body><h2>Register</h2>Register for an account:</Card.Body>
      </Card>
      <br />
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>User:</Form.Label><Form.Control type="text" value={user} id="userName" name="userName" onChange={e => setUser(e.target.value)} required/>
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>Password:</Form.Label><Form.Control type="password" value={password} id="password" name="password" onChange={e => setPassword(e.target.value)} required />
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>Confirm Password:</Form.Label><Form.Control type="password" value={password2} id="password2" name="password2" onChange={e => setPassword2(e.target.value)} required/>
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>Email:</Form.Label><Form.Control type="email" value={email} id="email" name="email" onChange={e => setEmail(e.target.value)} required/><br />
        </Form.Group>
        <Form.Group>
          <Form.Label>First Name:</Form.Label><Form.Control type="text" value={firstName} id="firstName" name="firstName" onChange={e => setFirstName(e.target.value)} required/><br />
        </Form.Group>
        <Form.Group>
          <Form.Label>Last Name:</Form.Label><Form.Control type="text" value={lastName} id="lastName" name="lastName" onChange={e => setLastName(e.target.value)} required/>
        </Form.Group>
        <Form.Group>
        <br />
        <Form.Label>Select account type:</Form.Label>
        <Form.Check
           type="radio"
           label="Student"
           id="student"
           name="userType"
           value="student"
           checked={userType === 'student'}
           onChange={e => setUserType(e.target.value)}
           required
        />
        <Form.Check
           type="radio"
           label="Tutor"
           id="tutor"
           name="userType"
           value="tutor"
           checked={userType === 'tutor'}
           onChange={e => setUserType(e.target.value)}
        />
        </Form.Group><br />

        <div>
      {/* Category Dropdown */}
      <label>Institution:</label>
      <select onChange={handleInstitutionChanges} value={selectedInstitution} disabled={userType=="tutor"}>
        <option value="">Select Institution</option>
        {Object.keys(institutions).map((institution) => (
          <option key={institution} value={institution}>
            {institution}
          </option>
        ))}
      </select><br /><br />

      {/* Options Dropdown */}
      <label>Program:</label>
      <select
        value={selectedProgram}
        onChange={(event) => setSelectedProgram(event.target.value)}
        disabled={!selectedInstitution} // Disable if no category is selected
      >
        <option value="">Select Program</option>
        {selectedInstitution &&
          institutions[selectedInstitution].map((program) => (
            <option key={program} value={program}>
              {program}
            </option>
          ))}
      </select>
    </div>

        { warning && ( <><br /><Alert variant="danger">{warning}</Alert></> )}
        <br />
        <Button variant="primary" className="pull-right" type="submit">Register</Button>
        
      </Form>
    </>
  );
}