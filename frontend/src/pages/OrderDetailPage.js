import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import axios from '../utils/axios';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'processing':
        return <Badge bg="info">Processing</Badge>;
      case 'shipped':
        return <Badge bg="primary">Shipped</Badge>;
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
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
        <div className="text-center mt-3">
          <Link to="/orders">
            <Button variant="primary">Back to Orders</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Order #{order?.id}</h2>
        <Link to="/orders">
          <Button variant="outline-primary">Back to Orders</Button>
        </Link>
      </div>

      {order && (
        <>
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Order Summary</h5>
                <div>{getStatusBadge(order.status)}</div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <p className="mb-1"><strong>Order Date:</strong></p>
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>Payment Method:</strong></p>
                  <p>{order.payment_method === 'card' ? 'Credit Card' : order.payment_method === 'cash' ? 'Cash on Delivery' : order.payment_method}</p>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>Total Amount:</strong></p>
                  <p>${order.total.toFixed(2)}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Shipping Information</h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-1">
                    {order.shipping_info.first_name} {order.shipping_info.last_name}
                  </p>
                  <p className="mb-1">{order.shipping_info.address}</p>
                  <p className="mb-1">
                    {order.shipping_info.city}, {order.shipping_info.state} {order.shipping_info.zip_code}
                  </p>
                  <p className="mb-1">{order.shipping_info.country}</p>
                  <p className="mb-1">Phone: {order.shipping_info.phone}</p>
                  <p className="mb-1">Email: {order.shipping_info.email}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Order Timeline</h5>
                </Card.Header>
                <Card.Body>
                  <ul className="timeline">
                    <li className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h6 className="mb-0">Order Placed</h6>
                        <p className="text-muted small">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </li>
                    {order.status !== 'pending' && (
                      <li className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h6 className="mb-0">Processing</h6>
                          <p className="text-muted small">{order.updated_at ? new Date(order.updated_at).toLocaleString() : 'In progress'}</p>
                        </div>
                      </li>
                    )}
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <li className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h6 className="mb-0">Shipped</h6>
                          <p className="text-muted small">{order.shipped_at ? new Date(order.shipped_at).toLocaleString() : 'In progress'}</p>
                        </div>
                      </li>
                    )}
                    {order.status === 'delivered' && (
                      <li className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h6 className="mb-0">Delivered</h6>
                          <p className="text-muted small">{order.delivered_at ? new Date(order.delivered_at).toLocaleString() : 'Completed'}</p>
                        </div>
                      </li>
                    )}
                    {order.status === 'cancelled' && (
                      <li className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h6 className="mb-0">Cancelled</h6>
                          <p className="text-muted small">{order.cancelled_at ? new Date(order.cancelled_at).toLocaleString() : 'Cancelled'}</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.product_image && (
                              <img 
                                src={item.product_image} 
                                alt={item.product_name} 
                                className="me-3" 
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                              />
                            )}
                            <div>
                              <p className="mb-0">{item.product_name}</p>
                              {item.product_id && (
                                <Link to={`/products/${item.product_id}`} className="small text-muted">
                                  View Product
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td className="text-end">${item.price.toFixed(2)}</td>
                        <td className="text-end">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Subtotal</strong></td>
                      <td className="text-end">${order.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Shipping</strong></td>
                      <td className="text-end">${order.shipping_cost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Tax</strong></td>
                      <td className="text-end">${order.tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Total</strong></td>
                      <td className="text-end"><strong>${order.total.toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card.Body>
          </Card>

          {order.status === 'pending' && (
            <div className="text-end">
              <Button 
                variant="outline-danger" 
                onClick={async () => {
                  try {
                    await axios.put(`/orders/${order.id}`, { status: 'cancelled' });
                    setOrder({ ...order, status: 'cancelled' });
                  } catch (err) {
                    console.error('Error cancelling order:', err);
                    alert('Failed to cancel order. Please try again later.');
                  }
                }}
              >
                Cancel Order
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default OrderDetailPage;