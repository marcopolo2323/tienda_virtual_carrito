import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import CategoryList from '../components/CategoryList';
import FeaturedProducts from '../components/FeaturedProducts';
import MinimalistBanner from '../components/MinimalistBanner';

const HomePage = () => {

  return (
    <div className="minimalist-homepage">
      {/* Minimalist Hero Banner */}
      <MinimalistBanner />
 
      {/* Featured Categories */}
      <section className="mb-minimal-lg">
        <div className="text-center mb-minimal">
          <h2>Categorías</h2>
          <p className="text-muted">Encuentra lo que necesitas</p>
        </div>
        <CategoryList limit={4} />
        <div className="text-center mt-4">
          <Link to="/products">
            <Button variant="ghost">Ver todas las categorías</Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-minimal-lg">
        <div className="text-center mb-minimal">
          <h2>Productos Destacados</h2>
          <p className="text-muted">Los más populares</p>
        </div>
        <FeaturedProducts limit={8} />
        <div className="text-center mt-4">
          <Link to="/products">
            <Button variant="primary">Ver todos los productos</Button>
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mb-minimal-lg">
        <div className="minimalist-newsletter">
          <Row className="align-items-center">
            <Col md={8}>
              <h3 className="mb-2">Mantente informado</h3>
              <p className="text-muted mb-0">Recibe las últimas novedades y ofertas especiales.</p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button variant="outline-primary">Suscribirse</Button>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default HomePage;