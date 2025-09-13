import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="minimalist-footer">
      <Container>
        <Row className="py-4">
          <Col md={6} className="mb-3">
            <div className="footer-brand">
              <h6 className="mb-2 fw-medium">Tienda</h6>
              <p className="text-muted small mb-0">
                Productos de calidad, experiencia premium.
              </p>
            </div>
          </Col>
          
          <Col md={6} className="mb-3">
            <div className="footer-links text-md-end">
              <Link to="/" className="footer-link me-3">
                Inicio
              </Link>
              <Link to="/products" className="footer-link me-3">
                Productos
              </Link>
              <Link to="/contact" className="footer-link">
                Contacto
              </Link>
            </div>
          </Col>
        </Row>
        
        <hr className="footer-divider" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center py-3">
          <p className="footer-copyright mb-2 mb-md-0">
            &copy; {currentYear} Tienda. Todos los derechos reservados.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link me-3" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#" className="social-link me-3" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <i className="bi bi-twitter"></i>
            </a>
          </div>
        </div>
      </Container>
      
    </footer>
  );
};

export default Footer;