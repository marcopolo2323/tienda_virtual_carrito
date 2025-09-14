import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/auth/forgot-password', { email });
      setMessage({
        type: 'success',
        text: 'Password reset instructions have been sent to your email.'
      });
      setEmail('');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to process your request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <Card>
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="mb-1">Forgot Password</h2>
                <p className="text-muted">Ingresa tu email para recibir instrucciones de restablecimiento de contraseña</p>
              </div>

              {message.text && (
                <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa tu email"
                    required
                  />
                </Form.Group>

                <div className="d-grid mb-4">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Sending...' : 'Reset Password'}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="mb-0">
                    Remember your password? <Link to="/login">Log In</Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ForgotPasswordPage;