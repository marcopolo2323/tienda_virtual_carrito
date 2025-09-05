import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProfilePage = () => {
  // CORREGIDO: Extraer todas las funciones necesarias del store
  const { currentUser, updateProfile, changePassword, loading: authLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // Cargar datos del usuario cuando currentUser cambie
  useEffect(() => {
    console.log('currentUser updated:', currentUser);
    if (currentUser) {
      console.log('Setting form data with user:', currentUser);
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        phone: currentUser.phone || ''
      });
    }
  }, [currentUser]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileMessage({ type: '', text: '' });
    
    try {
      await updateProfile(formData);
      setProfileMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordMessage({ type: '', text: '' });
    
    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage({ 
        type: 'danger', 
        text: 'New passwords do not match.' 
      });
      setLoading(false);
      return;
    }
    
    // Validate password length
    if (passwordData.new_password.length < 8) {
      setPasswordMessage({ 
        type: 'danger', 
        text: 'New password must be at least 8 characters long.' 
      });
      setLoading(false);
      return;
    }
    
    try {
      // CORREGIDO: Usar la función extraída directamente del store
      await changePassword({ 
        current_password: passwordData.current_password,
        new_password: passwordData.new_password 
      });
      
      setPasswordMessage({ 
        type: 'success', 
        text: 'Password updated successfully! You will be logged out in a few seconds.' 
      });
      
      // Reset password fields
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
    } catch (error) {
      console.error('Error updating password:', error);
      let errorMessage = 'Failed to update password. Please try again.';
      
      // Manejar diferentes tipos de error
      if (error.response?.status === 401) {
        errorMessage = 'Current password is incorrect.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid password data.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setPasswordMessage({ 
        type: 'danger', 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se cargan los datos de autenticación
  if (authLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </Container>
    );
  }
  
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="info">Please log in to view your profile.</Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <h2 className="mb-4">My Profile</h2>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Profile Information</h5>
            </Card.Header>
            <Card.Body>
              {profileMessage.text && (
                <Alert variant={profileMessage.type} dismissible onClose={() => setProfileMessage({ type: '', text: '' })}>
                  {profileMessage.text}
                </Alert>
              )}
              
              <Form onSubmit={handleProfileSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleProfileChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleProfileChange}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleProfileChange}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    disabled={loading}
                  />
                </Form.Group>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : 'Update Profile'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Change Password</h5>
            </Card.Header>
            <Card.Body>
              {passwordMessage.text && (
                <Alert variant={passwordMessage.type} dismissible onClose={() => setPasswordMessage({ type: '', text: '' })}>
                  {passwordMessage.text}
                </Alert>
              )}
              
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        required
                        minLength="8"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      <Form.Text className="text-muted">
                        Password must be at least 8 characters long.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        required
                        minLength="8"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Changing...
                      </>
                    ) : 'Change Password'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Account Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div className="avatar-placeholder mb-3">
                  <i className="bi bi-person-circle" style={{ fontSize: '4rem' }}></i>
                </div>
                <h5>{currentUser.first_name} {currentUser.last_name}</h5>
                <p className="text-muted mb-0">{currentUser.email}</p>
                {currentUser.role === 'admin' && (
                  <Badge bg="primary" className="mt-2">Administrator</Badge>
                )}
              </div>
              
              <div className="d-grid gap-2">
                <Link to="/orders">
                  <Button variant="outline-primary" className="w-100">
                    <i className="bi bi-box me-2"></i> My Orders
                  </Button>
                </Link>
                {currentUser.role === 'admin' && (
                  <Link to="/admin/dashboard">
                    <Button variant="outline-secondary" className="w-100">
                      <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Account Security</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Password</span>
                  <Badge bg="success">Set</Badge>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Email Verification</span>
                  <Badge bg={currentUser.isActive ? "success" : "warning"}>
                    {currentUser.isActive ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className={`progress-bar ${currentUser.isActive ? "bg-success" : "bg-warning"}`} 
                    style={{ width: currentUser.isActive ? '100%' : '50%' }}
                  ></div>
                </div>
              </div>
              
              {!currentUser.isActive && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="w-100"
                  disabled={loading}
                  onClick={() => {
                    // Implement resend verification email functionality
                    alert('Verification email sent!');
                  }}
                >
                  Resend Verification Email
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;