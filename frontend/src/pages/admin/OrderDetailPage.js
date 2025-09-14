import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaBox, FaTruck, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import axios from '../../utils/axios';
import { formatDate, formatCurrency } from '../../utils/formatters';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/admin/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      setUpdateError(null);
      
      await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state
      setOrder(prev => ({
        ...prev,
        status: newStatus,
        [`${newStatus}_at`]: new Date().toISOString()
      }));
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setUpdateError('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  
  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { variant: 'warning', label: 'Pending' },
      'processing': { variant: 'info', label: 'Processing' },
      'shipped': { variant: 'primary', label: 'Shipped' },
      'delivered': { variant: 'success', label: 'Delivered' },
      'cancelled': { variant: 'danger', label: 'Cancelled' }
    };
    
    const statusInfo = statusMap[status] || { variant: 'secondary', label: status };
    
    return <Badge bg={statusInfo.variant}>{statusInfo.label}</Badge>;
  };
  
  return (
    <Container className="py-4">
      {updateError && <Alert variant="danger">{updateError}</Alert>}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <Link to="/admin/orders" className="me-3">
            <FaArrowLeft />
          </Link>
          Order #{order.order_number}
        </h1>
        <div>{getStatusBadge(order.status)}</div>
      </div>
      
      <Row>
        <Col md={8}>
          {/* Order Items */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.product_image || 'https://picsum.photos/1200/400'} 
                            alt={item.product_name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                          />
                          <div>
                            <Link to={`/admin/products/edit/${item.product_id}`}>
                              {item.product_name}
                            </Link>
                            {item.variant && <div className="text-muted small">{item.variant}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          {/* Customer Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Customer Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Contact Information</h6>
                  <p>
                    <strong>Name:</strong> {order.customer.name}<br />
                    <strong>Email:</strong> {order.customer.email}<br />
                    <strong>Phone:</strong> {order.customer.phone || 'N/A'}
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Shipping Address</h6>
                  <p>
                    {order.shipping_address.street}<br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}<br />
                    {order.shipping_address.country}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {/* Order Timeline */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Timeline</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                <div className={`timeline-item ${order.created_at ? 'completed' : ''}`}>
                  <div className="timeline-icon">
                    <FaClock />
                  </div>
                  <div className="timeline-content">
                    <h6>Order Placed</h6>
                    <p>{order.created_at ? formatDate(order.created_at) : 'Pending'}</p>
                  </div>
                </div>
                
                <div className={`timeline-item ${order.processing_at ? 'completed' : ''}`}>
                  <div className="timeline-icon">
                    <FaBox />
                  </div>
                  <div className="timeline-content">
                    <h6>Processing</h6>
                    <p>{order.processing_at ? formatDate(order.processing_at) : 'Pending'}</p>
                  </div>
                </div>
                
                <div className={`timeline-item ${order.shipped_at ? 'completed' : ''}`}>
                  <div className="timeline-icon">
                    <FaTruck />
                  </div>
                  <div className="timeline-content">
                    <h6>Shipped</h6>
                    <p>{order.shipped_at ? formatDate(order.shipped_at) : 'Pending'}</p>
                    {order.tracking_number && (
                      <p><strong>Tracking:</strong> {order.tracking_number}</p>
                    )}
                  </div>
                </div>
                
                <div className={`timeline-item ${order.delivered_at ? 'completed' : ''}`}>
                  <div className="timeline-icon">
                    <FaCheck />
                  </div>
                  <div className="timeline-content">
                    <h6>Delivered</h6>
                    <p>{order.delivered_at ? formatDate(order.delivered_at) : 'Pending'}</p>
                  </div>
                </div>
                
                {order.cancelled_at && (
                  <div className="timeline-item completed cancelled">
                    <div className="timeline-icon">
                      <FaTimes />
                    </div>
                    <div className="timeline-content">
                      <h6>Cancelado</h6>
                      <p>{formatDate(order.cancelled_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          {/* Order Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Order Date:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Method:</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Status:</span>
                <span>
                  <Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discount || 0)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2 fw-bold">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </Card.Body>
          </Card>
          
          {/* Admin Actions */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {order.status === 'pending' && (
                  <Button 
                    variant="primary" 
                    onClick={() => handleStatusUpdate('processing')}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Mark as Processing'}
                  </Button>
                )}
                
                {order.status === 'processing' && (
                  <Button 
                    variant="primary" 
                    onClick={() => handleStatusUpdate('shipped')}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Mark as Shipped'}
                  </Button>
                )}
                
                {order.status === 'shipped' && (
                  <Button 
                    variant="success" 
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Mark as Delivered'}
                  </Button>
                )}
                
                {(order.status === 'pending' || order.status === 'processing') && (
                  <Button 
                    variant="danger" 
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Cancel Order'}
                  </Button>
                )}
                
                <Button variant="outline-secondary">
                  Print Invoice
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetailPage;