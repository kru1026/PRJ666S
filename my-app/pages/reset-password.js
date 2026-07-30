// my-app/pages/reset-password.js

import { Card, Form, Alert, Button } from "react-bootstrap";
import { use, useState } from 'react';
import { resetPassword } from '@/lib/authenticate';
import { useRouter } from 'next/router';


export default function Register(props){

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [certificate, setCertificate] = useState("");
  const [warning, setWarning] = useState("");

  const router = useRouter();

  async function handleSubmit(e) {
  e.preventDefault();
  try {
    await resetPassword(user, email, newPassword);
    
    router.push("/login" );
  } catch (err) {
    setWarning(err.message);
  }
  }

  return (
    <>
      <Card bg="light">
        <Card.Body><h2>Reset Password</h2>Reset the password:</Card.Body>
      </Card>
      <br />
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>User:</Form.Label><Form.Control type="text" value={user} id="userName" name="userName" onChange={e => setUser(e.target.value)} />
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>Email:</Form.Label><Form.Control type="email" value={email} id="email" name="email" onChange={e => setEmail(e.target.value)} />
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>New Password:</Form.Label><Form.Control type="password" value={newPassword} id="newPassword" name="newPassword" onChange={e => setNewPassword(e.target.value)} />
        </Form.Group>
        { warning && ( <><br /><Alert variant="danger">{warning}</Alert></> )}
        <br />
        <Button variant="primary" className="pull-right" type="submit">Reset Password</Button>
        
      </Form>
    </>
  );
}