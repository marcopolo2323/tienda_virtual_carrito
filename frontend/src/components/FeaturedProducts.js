import React, { useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import useProductStore from '../store/productStore';
import ProductCard from './ProductCard';

const FeaturedProducts = ({ limit = 4 }) => {
  const { featuredProducts: products = [], loading, error, fetchFeaturedProducts } = useProductStore();
  
  useEffect(() => {
    // Agregar manejo de errores
    const loadFeaturedProducts = async () => {
      try {
        await fetchFeaturedProducts(limit);
      } catch (error) {
        console.error('Failed to load featured products:', error);
        // El error ya está manejado en el store
      }
    };
    
    loadFeaturedProducts();
  }, [fetchFeaturedProducts, limit]);
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  // Validación adicional para asegurar que products sea un array
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }
  
  return (
    <div className="my-5">
      <h2 className="mb-4">Featured Products</h2>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map(product => (
          <Col key={product.id || product._id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FeaturedProducts;