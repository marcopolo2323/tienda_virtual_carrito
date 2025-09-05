import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'danger',
        text: 'Passwords do not match.'
      });
      setLoading(false);
      return;
    }

    try {
      await axios.post('/auth/reset-password', {
        token,
        password: formData.password
      });
      
      setMessage({
        type: 'success',
        text: 'Your password has been reset successfully!'
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.'
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
                <h2 className="mb-1">Reset Password</h2>
                <p className="text-muted">Create a new password for your account</p>
              </div>

              {message.text && (
                <Alert variant={message.type} dismissible={message.type !== 'success'} onClose={() => setMessage({ type: '', text: '' })}>
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                    minLength="8"
                    disabled={message.type === 'success'}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 8 characters long.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                    minLength="8"
                    disabled={message.type === 'success'}
                  />
                </Form.Group>

                <div className="d-grid mb-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading || message.type === 'success'}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordPage;