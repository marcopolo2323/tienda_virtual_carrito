import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">
              <i className="bi bi-cart4 me-2"></i>
              Carrito
            </h5>
            <p className="text-muted">
              Tu tienda online de confianza para encontrar los mejores productos al mejor precio.
            </p>
            <div className="social-links">
              <a href="#" className="text-light me-3">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </Col>
          
          <Col md={2} sm={6} className="mb-4 mb-md-0">
            <h6 className="mb-3">Navegación</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  Inicio
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-muted text-decoration-none">
                  Productos
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-muted text-decoration-none">
                  Carrito
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-muted text-decoration-none">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col md={2} sm={6} className="mb-4 mb-md-0">
            <h6 className="mb-3">Información</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">
                  Sobre Nosotros
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">
                  Contacto
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">
                  Términos y Condiciones
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">
                  Política de Privacidad
                </a>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h6 className="mb-3">Suscríbete a nuestro boletín</h6>
            <p className="text-muted mb-3">
              Recibe las últimas ofertas y novedades directamente en tu correo.
            </p>
            <div className="input-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Tu correo electrónico" 
                aria-label="Email" 
              />
              <button className="btn btn-primary" type="button">
                Suscribirse
              </button>
            </div>
            <p className="small text-muted">
              Al suscribirte, aceptas nuestra política de privacidad.
            </p>
          </Col>
        </Row>
        
        <hr className="my-4 bg-secondary" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="text-muted mb-3 mb-md-0">
            &copy; {currentYear} Carrito. Todos los derechos reservados.
          </p>
          <div className="payment-methods">
            <i className="bi bi-credit-card me-3 text-muted"></i>
            <i className="bi bi-paypal me-3 text-muted"></i>
            <i className="bi bi-wallet2 me-3 text-muted"></i>
            <i className="bi bi-bank text-muted"></i>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;