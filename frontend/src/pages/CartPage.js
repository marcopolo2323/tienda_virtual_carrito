import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const CartPage = () => {
  const { items, itemCount, total, loading, updateCartItem, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Helper function para normalizar URLs de imágenes de Cloudinary
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    
    // Si ya es una URL completa, usarla tal como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Si parece ser un public_id de Cloudinary, construir la URL
    if (imageUrl.includes('tienda-productos/') || imageUrl.startsWith('product-')) {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      if (cloudName) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,f_auto,q_auto/${imageUrl}`;
      }
    }
    
    // Fallback para imágenes locales
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${imageUrl}`;
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    updateCartItem(productId, quantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // This would be replaced with an actual API call
    setTimeout(() => {
      if (couponCode.toUpperCase() === 'DISCOUNT10') {
        setCouponSuccess('Coupon applied successfully!');
        setCouponError('');
      } else {
        setCouponError('Invalid or expired coupon code');
        setCouponSuccess('');
      }
    }, 500);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
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

  return (
    <Container className="py-4">
      <h1 className="mb-4">Your Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-cart3 display-1 text-muted mb-3"></i>
          <h3>Your cart is empty</h3>
          <p className="mb-4">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products">
            <Button variant="primary" size="lg">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <Row>
          {/* Cart Items */}
          <Col lg={8} className="mb-4">
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Cart Items ({itemCount})</span>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {items.map(item => (
                  <div key={item.product_id} className="cart-item mb-3">
                    <Row className="align-items-center">
                      <Col xs={3} sm={2}>
                        <img 
                          src={getImageUrl(item.image_url)} 
                          alt={item.name} 
                          className="img-fluid rounded"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </Col>
                      <Col xs={9} sm={4}>
                        <h5 className="mb-1">
                          <Link to={`/products/${item.product_id}`} className="text-decoration-none">
                            {item.name}
                          </Link>
                        </h5>
                        <div className="text-muted small">
                          ${item.price.toFixed(2)} each
                        </div>
                      </Col>
                      <Col xs={6} sm={3} className="mt-3 mt-sm-0">
                        <div className="d-flex align-items-center">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <Form.Control 
                            type="number" 
                            min="1" 
                            value={item.quantity} 
                            onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value, 10))}
                            className="mx-2 text-center"
                            style={{ width: '60px' }}
                          />
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </Button>
                        </div>
                      </Col>
                      <Col xs={4} sm={2} className="text-end mt-3 mt-sm-0">
                        <div className="fw-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </Col>
                      <Col xs={2} sm={1} className="text-end mt-3 mt-sm-0">
                        <Button 
                          variant="link" 
                          className="text-danger p-0" 
                          onClick={() => handleRemoveItem(item.product_id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </Col>
                    </Row>
                    {item.quantity > item.stock && (
                      <div className="text-danger small mt-2">
                        Only {item.stock} items available
                      </div>
                    )}
                    <hr />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>Order Summary</Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>Calculated at checkout</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3 fw-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 mb-3"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>

                <div className="text-center">
                  <Link to="/products" className="text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i>
                    Continue Shopping
                  </Link>
                </div>
              </Card.Body>
            </Card>

            {/* Coupon Code */}
            <Card>
              <Card.Header>Apply Coupon</Card.Header>
              <Card.Body>
                {couponError && <Alert variant="danger">{couponError}</Alert>}
                {couponSuccess && <Alert variant="success">{couponSuccess}</Alert>}
                
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </Form.Group>
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={handleApplyCoupon}
                >
                  Apply Coupon
                </Button>
              </Card.Body>
            </Card> 
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;