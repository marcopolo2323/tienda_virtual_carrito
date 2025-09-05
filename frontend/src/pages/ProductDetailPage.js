import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Breadcrumb } from 'react-bootstrap';
import axios from '../utils/axios';
import useCartStore from '../store/cartStore';

const ProductDetailPage = () => {
  const { id: productId } = useParams();
  const { addToCart, loading: cartLoading } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/products/${productId}`);
        
        // CORRECCIÓN: Acceder al producto correctamente
        const productData = response.data.product || response.data;
        setProduct(productData);
        
        // Fetch related products
        if (productData.category_id) {
          const relatedResponse = await axios.get(
            `/products?category_id=${productData.category_id}&limit=4&exclude=${productId}`
          );
          // CORRECCIÓN: Verificar la estructura de respuesta
          const relatedData = relatedResponse.data.products || relatedResponse.data || [];
          setRelatedProducts(relatedData);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && (!product || value <= product.stock)) {
      setQuantity(value); 
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Función helper para formatear precio de manera segura
  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '0.00';
    }
    return parseFloat(price).toFixed(2);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center mt-3">
          <Link to="/products">
            <Button variant="primary">Back to Products</Button>
          </Link>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Product not found</Alert>
        <div className="text-center mt-3">
          <Link to="/products">
            <Button variant="primary">Back to Products</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/products' }}>Products</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mb-5">
        {/* Product Image */}
        <Col md={6} className="mb-4">
          <img 
            src={product.image_url || 'https://picsum.photos/1200/400'} 
            alt={product.name} 
            className="img-fluid rounded product-detail-image"
          />
        </Col>

        {/* Product Details */}
        <Col md={6}>
          <h1 className="mb-3">{product.name}</h1>
          
          <div className="mb-3">
            {/* CORRECCIÓN: Usar función helper para formatear precio */}
            <h3 className="text-primary">${formatPrice(product.price)}</h3>
          </div>

          {product.stock > 0 ? (
            <div className="mb-3 text-success">
              <i className="bi bi-check-circle-fill me-2"></i>
              In Stock ({product.stock} available)
            </div>
          ) : (
            <div className="mb-3 text-danger">
              <i className="bi bi-x-circle-fill me-2"></i>
              Out of Stock
            </div>
          )}

          {product.category && (
            <div className="mb-3">
              <strong>Category:</strong> 
              <Link to={`/products?category=${product.category_id}`} className="ms-2">
                {product.category.name}
              </Link>
            </div>
          )}

          <div className="mb-4">
            <p>{product.description}</p>
          </div>

          <div className="d-flex align-items-center mb-4">
            <Form.Group controlId="quantity" className="me-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control 
                type="number" 
                min="1" 
                max={product.stock} 
                value={quantity} 
                onChange={handleQuantityChange}
                disabled={product.stock <= 0}
                style={{ width: '80px' }}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || cartLoading}
              className="flex-grow-1"
            >
              <i className="bi bi-cart-plus me-2"></i>
              {cartLoading ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>

          {/* Additional Info */}
          <Card className="mt-4">
            <Card.Header>Product Details</Card.Header>
            <Card.Body>
              <Row>
                <Col xs={4}><strong>SKU:</strong></Col>
                <Col xs={8}>{product.sku || 'N/A'}</Col>
              </Row>
              <hr />
              <Row>
                <Col xs={4}><strong>Weight:</strong></Col>
                <Col xs={8}>{product.weight ? `${product.weight} kg` : 'N/A'}</Col>
              </Row>
              <hr />
              <Row>
                <Col xs={4}><strong>Dimensions:</strong></Col>
                <Col xs={8}>{product.dimensions || 'N/A'}</Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-4">Related Products</h3>
          <Row>
            {relatedProducts.map(relatedProduct => (
              <Col key={relatedProduct.id} sm={6} md={3} className="mb-4">
                <Card className="h-100 product-card">
                  <Card.Img 
                    variant="top" 
                    src={relatedProduct.image_url || 'https://picsum.photos/1200/400'} 
                    alt={relatedProduct.name} 
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{relatedProduct.name}</Card.Title>
                    <Card.Text className="text-muted">
                      {/* CORRECCIÓN: Usar función helper para productos relacionados */}
                      ${formatPrice(relatedProduct.price)}
                    </Card.Text>
                    <div className="mt-auto">
                      <Link to={`/products/${relatedProduct.id}`}>
                        <Button variant="outline-primary" className="w-100">View Details</Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      )}
    </Container>
  );
};

export default ProductDetailPage;