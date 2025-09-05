import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import useCategoryStore from '../store/categoryStore';

const CategoryList = ({ limit, displayAsList = false }) => {
  const { categories, loading, fetchCategories } = useCategoryStore();
  const location = useLocation();
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Extract current category from URL if present
  const currentCategoryId = new URLSearchParams(location.search).get('category');
  
  if (loading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // SOLUCIÓN: Asegurar que categories sea siempre un array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Display as a list (for sidebar)
  if (displayAsList) {
    return (
      <div className="mb-4">
        <h5 className="mb-3">Categories</h5>
        <div className="list-group">
          <Link 
            to="/products"
            className={`list-group-item list-group-item-action ${!currentCategoryId ? 'active' : ''}`}
          >
            All Categories
            <span className="badge bg-secondary float-end">
              {safeCategories.reduce((total, cat) => total + (cat.product_count || 0), 0)}
            </span>
          </Link>
          
          {safeCategories.map(category => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.id}`}
              className={`list-group-item list-group-item-action ${currentCategoryId === category.id.toString() ? 'active' : ''}`}
            >
              {category.name}
              <span className="badge bg-secondary float-end">
                {category.product_count || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  // Display as a grid (for homepage)
  // LÍNEA 61 CORREGIDA: Usar safeCategories en lugar de categories
  const displayCategories = limit ? safeCategories.slice(0, limit) : safeCategories;
  
  return (
    <Row>
      {displayCategories.map(category => (
        <Col key={category.id} xs={6} md={3} className="mb-4">
          <Card className="h-100 text-center category-card">
            <Card.Img 
              variant="top" 
              src={category.image_url || 'https://picsum.photos/1200/400'} 
              alt={category.name} 
            />
            <Card.Body className="d-flex flex-column">
              <Card.Title>{category.name}</Card.Title>
              <div className="mt-auto">
                <Link to={`/products?category=${category.id}`}>
                  <Button variant="outline-primary">View Products</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CategoryList;