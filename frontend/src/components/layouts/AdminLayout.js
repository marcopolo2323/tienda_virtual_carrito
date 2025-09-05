import React from 'react';
import { Link} from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';

const AdminLayout = ({ children }) => {

  return (
    <>
      <Container fluid className="py-4 min-vh-100">
        <Row>
          <Col md={3} lg={2} className="d-md-block bg-light sidebar">
            <div className="position-sticky pt-3">
              <Nav className="flex-column">
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/dashboard" className="text-dark">
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/banners" className="text-dark">
                    Banners
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/products" className="text-dark">
                    Products
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/categories" className="text-dark">
                    Categories
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/orders" className="text-dark">
                    Orders
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/users" className="text-dark">
                    Users
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/reports" className="text-dark">
                    Reports
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </Col>
          <Col md={9} lg={10}>
            {children}
          </Col>
        </Row>
      </Container>

      <footer className="bg-dark text-white py-3 mt-5">
        <Container>
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Carrito Shop Admin. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </>
  );
};

export default AdminLayout;