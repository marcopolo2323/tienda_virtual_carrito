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
    <Navbar bg="white" expand="lg" className="minimalist-navbar" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="minimalist-brand">
          Tienda
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
          
          <Form className="d-flex mx-auto minimalist-search" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Buscar..."
              className="me-2"
              aria-label="Search"
              name="search"
            />
            <Button variant="ghost" type="submit" className="btn-search">
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
                <div className="ms-2 d-flex gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
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