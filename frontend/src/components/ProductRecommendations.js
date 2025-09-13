/**
 * Product Recommendations Component
 * Sistema inteligente de recomendaciones para aumentar ventas
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { trackUserEngagement } from '../utils/analytics';

const ProductRecommendations = ({ 
  currentProduct = null, 
  userId = null, 
  type = 'related', // 'related', 'trending', 'personalized', 'cross-sell'
  limit = 4,
  title = 'Productos Recomendados'
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [currentProduct, userId, type]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Simular API call - aquí conectarías con tu endpoint de recomendaciones
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentProduct: currentProduct?.id,
          userId,
          type,
          limit
        })
      });

      if (!response.ok) {
        throw new Error('Error fetching recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      
      // Track recommendation view
      trackUserEngagement('recommendations_viewed', {
        type,
        productCount: data.recommendations?.length || 0
      });
      
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
      // Fallback to trending products
      await fetchTrendingProducts();
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=4');
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching trending products:', err);
    }
  };

  const handleProductClick = (product) => {
    trackUserEngagement('recommendation_clicked', {
      type,
      productId: product.id,
      productName: product.name
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2 text-muted">Cargando recomendaciones...</p>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't show anything if no recommendations
  }

  return (
    <div className="recommendations-section">
      <div className="text-center mb-4">
        <h3 className="recommendations-title">{title}</h3>
        <p className="text-muted">Basado en tus preferencias y productos similares</p>
      </div>
      
      <Row className="g-4">
        {recommendations.map((product, index) => (
          <Col key={product.id} md={6} lg={3}>
            <Card 
              className="product-recommendation-card h-100 border-0 shadow-sm"
              style={{ 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onClick={() => handleProductClick(product)}
            >
              <Link 
                to={`/products/${product.id}`} 
                className="text-decoration-none"
                style={{ color: 'inherit' }}
              >
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={product.image_url || '/placeholder-product.jpg'}
                    alt={product.name}
                    style={{
                      height: '200px',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Recommendation badge */}
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-warning text-dark">
                      {type === 'trending' ? '🔥' : type === 'personalized' ? '⭐' : '💡'}
                    </span>
                  </div>
                  
                  {/* Discount badge if applicable */}
                  {product.discount && (
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-danger">
                        -{product.discount}%
                      </span>
                    </div>
                  )}
                </div>
                
                <Card.Body className="d-flex flex-column">
                  <Card.Title 
                    className="h6 mb-2 text-dark"
                    style={{ 
                      fontSize: '1rem',
                      lineHeight: '1.3',
                      height: '2.6rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {product.name}
                  </Card.Title>
                  
                  <Card.Text 
                    className="text-muted small mb-2 flex-grow-1"
                    style={{
                      fontSize: '0.85rem',
                      height: '2.5rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {product.description || 'Sin descripción disponible'}
                  </Card.Text>
                  
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div className="price-section">
                      {product.discount ? (
                        <div>
                          <span className="price text-warning fw-bold">
                            ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                          <span className="price-original text-muted small ms-2">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="price text-warning fw-bold">
                          ${product.price?.toFixed(2) || '0.00'}
                        </span>
                      )}
                    </div>
                    
                    <div className="rating-section">
                      {product.average_rating && (
                        <div className="d-flex align-items-center">
                          <span className="text-warning me-1">⭐</span>
                          <small className="text-muted">
                            {product.average_rating.toFixed(1)}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
      
      <style jsx>{`
        .recommendations-title {
          font-family: 'Playfair Display', serif;
          color: #1B263B;
          position: relative;
          margin-bottom: 1rem;
        }
        
        .recommendations-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #D4AF37, #F4E4BC);
          border-radius: 2px;
        }
        
        .product-recommendation-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
        }
        
        .product-recommendation-card:hover .card-img-top {
          transform: scale(1.05);
        }
        
        .price {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
        }
        
        .price-original {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default ProductRecommendations;
