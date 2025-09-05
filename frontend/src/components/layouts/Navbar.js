import React from 'react';
import { Navbar, Nav, Container, Form, Button, Dropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import CartDropdown from '../CartDropdown';

const MainNavbar = () => {
  const { currentUser, logout } = useAuthStore();
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value.trim();
    if (searchTerm) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-3" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="bi bi-cart4 me-2 text-primary"></i>
          Carrito
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="main-navbar" />
        
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/products">
              Productos
            </Nav.Link>
          </Nav>
          
          <Form className="d-flex mx-auto" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Buscar productos..."
              className="me-2"
              aria-label="Search"
              name="search"
            />
            <Button variant="outline-primary" type="submit">
              <i className="bi bi-search"></i>
            </Button>
          </Form>
          
          <Nav className="ms-auto">
            <div className="d-flex align-items-center">
              <CartDropdown />
              
              {isAuthenticated ? (
                <Dropdown align="end" className="ms-2">
                  <Dropdown.Toggle variant="light" id="dropdown-user">
                    <i className="bi bi-person-circle"></i>
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person me-2"></i>
                      Mi Perfil
                    </Dropdown.Item>
                    
                    <Dropdown.Item as={Link} to="/orders">
                      <i className="bi bi-box me-2"></i>
                      Mis Pedidos
                    </Dropdown.Item>
                    
                    {isAdmin && (
                      <Dropdown.Item as={Link} to="/admin/dashboard">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Panel de Administración
                      </Dropdown.Item>
                    )}
                    
                    <Dropdown.Divider />
                    
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className="ms-2">
                  <Link to="/login">
                    <Button variant="outline-primary" className="me-2">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;