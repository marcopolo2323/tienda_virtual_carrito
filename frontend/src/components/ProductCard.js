import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';

const ProductCard = ({ product }) => {
  const { loading, addToCart } = useCartStore();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const handleImageError = () => {
    console.log('Error loading image for product:', product.id, 'URL:', product.image_url);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Función para obtener la URL de imagen correcta (Cloudinary)
  const getImageUrl = () => {
    if (imageError || !product.image_url) {
      return '/placeholder-product.jpg';
    }
    
    // Si la URL ya es una URL completa de Cloudinary, usarla tal como está
    if (product.image_url.startsWith('http')) {
      return product.image_url;
    }
    
    // Si es solo el public_id de Cloudinary, construir la URL
    if (product.image_url.includes('tienda-productos/') || product.image_url.startsWith('product-')) {
      // Construir URL de Cloudinary con transformaciones
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill,f_auto,q_auto/${product.image_url}`;
    }
    
    // Fallback: intentar como URL local si no es de Cloudinary
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/src/uploads/${product.image_url}`;
  };

  return (
    <Card className="h-100 product-card">
      {product.discount_percent > 0 && (
        <div className="product-badge">
          <Badge bg="danger">-{product.discount_percent}%</Badge>
        </div>
      )}
      
      <Link to={`/products/${product.id}`} className="text-decoration-none">
        <div className="product-image-container position-relative">
          {imageLoading && !imageError && (
            <div className="position-absolute top-50 start-50 translate-middle">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading image...</span>
              </div>
            </div>
          )}
          
          <Card.Img 
            variant="top" 
            src={getImageUrl()}
            alt={product.name}
            className={`product-image ${imageLoading && !imageError ? 'opacity-25' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{
              height: '200px',
              objectFit: 'cover',
              backgroundColor: '#f8f9fa'
            }}
          />
        </div>
      </Link>
      
      <Card.Body className="d-flex flex-column">
        <Link to={`/products/${product.id}`} className="text-decoration-none">
          <Card.Title className="product-title">{product.name}</Card.Title>
        </Link>
        
        <Card.Text className="text-muted small mb-2">
          {product.category?.name || 'Sin categoría'}
        </Card.Text>
        
        {/* Debug info en desarrollo */}
        {/* {process.env.NODE_ENV === 'development' && (
          <small className="text-muted mb-2">
            <div>Original: {product.image_url}</div>
            <div>Final URL: {getImageUrl()}</div>
          </small>
        )}
         */}
        <div className="mt-auto">
          <div className="d-flex align-items-center mb-2">
            {product.discount_percent > 0 ? (
              <>
                <span className="text-danger fw-bold me-2">
                  ${(parseFloat(product.price || 0) * (1 - (product.discount_percent || 0) / 100)).toFixed(2)}
                </span>
                <span className="text-muted text-decoration-line-through">
                  ${parseFloat(product.price || 0).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="fw-bold">${parseFloat(product.price || 0).toFixed(2)}</span>
            )}
          </div>
          
          <Button 
            variant="primary" 
            className="w-100"
            onClick={handleAddToCart}
            disabled={loading || product.stock <= 0}
          >
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;