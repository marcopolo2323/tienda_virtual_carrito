import React, { useState } from 'react';
import { Row, Col, Image, Button, Form, Badge, Alert } from 'react-bootstrap';
import useCartStore from '../store/cartStore';
import StarRating from './StarRating';

const ProductDetail = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { loading, addToCart } = useCartStore();
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };
  
  if (!product) return null;
  
  const discountedPrice = product.discount_percent > 0 
    ? product.price * (1 - product.discount_percent / 100) 
    : product.price;
  
  return (
    <Row className="product-detail">
      <Col md={6} className="mb-4 mb-md-0">
        <div className="product-image-container">
          <Image 
            src={product.image_url || '/placeholder-product.jpg'} 
            alt={product.name} 
            fluid 
            className="product-detail-image"
          />
          
          {product.discount_percent > 0 && (
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-0 m-3 p-2"
            >
              {product.discount_percent}% OFF
            </Badge>
          )}
        </div>
        
        {product.gallery && product.gallery.length > 0 && (
          <Row className="mt-3 product-thumbnails">
            {product.gallery.map((image, index) => (
              <Col xs={3} key={index}>
                <Image 
                  src={image} 
                  alt={`${product.name} - ${index + 1}`} 
                  thumbnail 
                  className="cursor-pointer"
                />
              </Col>
            ))}
          </Row>
        )}
      </Col>
      
      <Col md={6}>
        <h2 className="mb-2">{product.name}</h2>
        
        <div className="d-flex align-items-center mb-3">
          <StarRating rating={product.rating || 0} />
          <span className="ms-2 text-muted">
            ({product.review_count || 0} reseñas)
          </span>
        </div>
        
        <div className="mb-3">
          {product.discount_percent > 0 ? (
            <div>
              <span className="text-danger h3 me-2">
                ${discountedPrice.toFixed(2)}
              </span>
              <span className="text-muted text-decoration-line-through">
                ${product.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="h3">${product.price.toFixed(2)}</span>
          )}
        </div>
        
        <div className="mb-4">
          <Badge 
            bg={product.stock > 0 ? 'success' : 'danger'}
            className="me-2"
          >
            {product.stock > 0 ? 'En Stock' : 'Agotado'}
          </Badge>
          
          {product.stock > 0 && (
            <span className="text-muted">
              {product.stock} unidades disponibles
            </span>
          )}
        </div>
        
        <p className="mb-4">{product.description}</p>
        
        {product.stock > 0 ? (
          <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3 mb-4">
            <Form.Group className="w-100" style={{ maxWidth: '150px' }}>
              <Form.Label>Cantidad</Form.Label>
              <Form.Control 
                type="number" 
                min="1" 
                max={product.stock} 
                value={quantity} 
                onChange={handleQuantityChange}
              />
            </Form.Group>
            
            <div className="d-grid flex-grow-1">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading ? 'Agregando...' : 'Añadir al Carrito'}
              </Button>
            </div>
          </div>
        ) : (
          <Alert variant="warning">
            Este producto está actualmente agotado. Por favor, vuelve más tarde.
          </Alert>
        )}
        
        <div className="product-meta">
          <p className="mb-1">
            <strong>SKU:</strong> {product.sku}
          </p>
          <p className="mb-1">
            <strong>Categoría:</strong> {product.category?.name}
          </p>
          {product.tags && product.tags.length > 0 && (
            <p className="mb-1">
              <strong>Etiquetas:</strong>{' '}
              {product.tags.map(tag => (
                <Badge bg="secondary" className="me-1" key={tag}>
                  {tag}
                </Badge>
              ))}
            </p>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default ProductDetail;