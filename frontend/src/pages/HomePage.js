import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Carousel } from 'react-bootstrap';
import CategoryList from '../components/CategoryList';
import FeaturedProducts from '../components/FeaturedProducts';

const HomePage = () => {

  // Hero carousel items
  const carouselItems = [
    {
      id: 1,
      image: 'https://picsum.photos/1200/400',
      title: 'Welcome to Carrito Shop',
      description: 'Your one-stop shop for all your needs',
      link: '/products'
    },
    {
      id: 2,
      image: 'https://picsum.photos/1200/400',
      title: 'New Arrivals',
      description: 'Check out our latest products',
      link: '/products?sort=newest'
    },
    {
      id: 3,
      image: 'https://picsum.photos/1200/400',
      title: 'Special Offers',
      description: 'Limited time discounts on selected items',
      link: '/products?discount=true'
    }
  ];

  return (
    <Container>
      {/* Hero Carousel */}
      <Carousel className="mb-5">
        {carouselItems.map(item => (
          <Carousel.Item key={item.id}>
            <img
              className="d-block w-100"
              src={item.image}
              alt={item.title}
            />
            <Carousel.Caption>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <Link to={item.link}>
                <Button variant="primary">Shop Now</Button>
              </Link>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
 
      {/* Featured Categories */}
      <section className="mb-5">
        <h2 className="text-center mb-4">Shop by Category</h2>
        <CategoryList limit={4} />
        <div className="text-center mt-3">
          <Link to="/products">
            <Button variant="secondary">View All Categories</Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-5">
        <h2 className="text-center mb-4">Featured Products</h2>
        <FeaturedProducts limit={8} />
        <div className="text-center mt-3">
          <Link to="/products">
            <Button variant="secondary">View All Products</Button>
          </Link>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="mb-5">
        <div className="bg-light p-4 rounded">
          <Row className="align-items-center">
            <Col md={8}>
              <h3>Subscribe to Our Newsletter</h3>
              <p>Stay updated with our latest products and special offers.</p>
            </Col>
            <Col md={4} className="text-md-end">
              <Button variant="primary">Subscribe Now</Button>
            </Col>
          </Row>
        </div>
      </section>
    </Container>
  );
};

export default HomePage;