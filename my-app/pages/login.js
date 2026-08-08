// my-app/pages/login.js

import { Card, Form, Alert, Button } from "react-bootstrap";
import { useState } from 'react';
import { authenticateUser } from '@/lib/authenticate';
import { useRouter } from 'next/router';
import { useAtom } from "jotai";


export default function Login(props){

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState("");

  const router = useRouter();

  async function handleSubmit(e) {
  e.preventDefault();
  try {
    await authenticateUser(user, password);
    router.push('/');
  } catch (err) {
    setWarning(err.message);
  }
  }

  return (
    <>
      <Card bg="light">
        <Card.Body>
          <h2>Login</h2>
          <p>Enter your login information below:</p>
          <p style={{ color: "red" }}>
            Please wait 2-4 minutes for the backend to restart if clicking Login has no response.
          </p>
        </Card.Body>
      </Card>
      <br />
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>User:</Form.Label><Form.Control type="text" value={user} id="userName" name="userName" onChange={e => setUser(e.target.value)} />
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>Password:</Form.Label><Form.Control type="password" value={password} id="password" name="password" onChange={e => setPassword(e.target.value)} />
        </Form.Group>
        
        { warning && ( <><br /><Alert variant="danger">{warning}</Alert></> )}
        <br />
        <Button variant="primary" className="pull-right" type="submit">Login</Button>
      </Form>
      <br />
      <a href="/reset-password">Reset Password</a>
    </>
  );
}