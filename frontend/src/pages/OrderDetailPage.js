import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import axios from '../utils/axios';

const OrderDetailPage = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        console.log('=== FETCHING ORDER DETAILS ===');
        console.log('Order ID:', orderId);
        const response = await axios.get(`/orders/${orderId}`);
        console.log('=== ORDER DETAILS RESPONSE ===');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        console.log('Order data:', response.data.order || response.data);
        console.log('Order fields:', Object.keys(response.data.order || response.data));
        console.log('Created at (createdAt):', (response.data.order || response.data).createdAt);
        console.log('User object:', (response.data.order || response.data).User);
        console.log('Total type:', typeof (response.data.order || response.data).total);
        console.log('Total value:', (response.data.order || response.data).total);
        console.log('Subtotal:', (response.data.order || response.data).subtotal);
        console.log('Shipping cost:', (response.data.order || response.data).shipping_cost);
        console.log('Tax:', (response.data.order || response.data).tax);
        console.log('OrderItems array:', (response.data.order || response.data).OrderItems);
        setOrder(response.data.order || response.data);
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
    if (!status || typeof status !== 'string') {
      return <Badge bg="secondary">Unknown</Badge>;
    }
    
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
                  <p>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>Payment Method:</strong></p>
                  <p>{order.payment_method === 'card' ? 'Credit Card' : order.payment_method === 'cash' ? 'Cash on Delivery' : order.payment_method}</p>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>Total Amount:</strong></p>
                  <p>${order.total ? parseFloat(order.total).toFixed(2) : '0.00'}</p>
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
                    <strong>Address:</strong> {order.shipping_address || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Customer:</strong> {order.User ? `${order.User.first_name || ''} ${order.User.last_name || ''}`.trim() : 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {order.User ? order.User.email : 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Phone:</strong> {order.User ? order.User.phone : 'N/A'}
                  </p>
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
                        <p className="text-muted small">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                      </div>
                    </li>
                    {order.status !== 'pending' && (
                      <li className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h6 className="mb-0">Processing</h6>
                          <p className="text-muted small">{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'In progress'}</p>
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
                    {(order.OrderItems || []).map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.Product?.image_url && (
                              <img 
                                src={item.Product.image_url} 
                                alt={item.Product.name} 
                                className="me-3" 
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                              />
                            )}
                            <div>
                              <p className="mb-0">{item.Product?.name || 'N/A'}</p>
                              {item.product_id && (
                                <Link to={`/products/${item.product_id}`} className="small text-muted">
                                  View Product
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td className="text-end">${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</td>
                        <td className="text-end">${item.price && item.quantity ? (parseFloat(item.price) * item.quantity).toFixed(2) : '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Subtotal</strong></td>
                      <td className="text-end">${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Shipping</strong></td>
                      <td className="text-end">${order.shipping_cost ? parseFloat(order.shipping_cost).toFixed(2) : '0.00'}</td>
                    </tr>
                    {order.tax && parseFloat(order.tax) > 0 && (
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Tax</strong></td>
                        <td className="text-end">${parseFloat(order.tax).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Total</strong></td>
                      <td className="text-end"><strong>${order.total ? parseFloat(order.total).toFixed(2) : '0.00'}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card.Body>
          </Card>

          {/* Boleta Electrónica */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Boleta Electrónica</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <p className="text-muted mb-3">
                  Descarga tu boleta electrónica en formato PDF
                </p>
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={() => {
                    // Crear contenido HTML para la boleta
                    const boletaContent = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Boleta Electrónica - Orden #${order.id}</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                          .order-info { margin-bottom: 30px; }
                          .order-info h3 { color: #333; margin-bottom: 15px; }
                          .order-info p { margin: 5px 0; }
                          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                          .items-table th { background-color: #f2f2f2; font-weight: bold; }
                          .items-table .text-right { text-align: right; }
                          .totals { margin-top: 20px; }
                          .totals table { width: 100%; border-collapse: collapse; }
                          .totals td { padding: 8px; border: none; }
                          .totals .total-row { font-weight: bold; font-size: 1.1em; border-top: 2px solid #333; }
                          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>BOLETA ELECTRÓNICA</h1>
                          <p>Orden #${order.id}</p>
                          <p>Fecha: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        
                        <div class="order-info">
                          <h3>Información del Cliente</h3>
                          <p><strong>Nombre:</strong> ${order.User ? `${order.User.first_name || ''} ${order.User.last_name || ''}`.trim() : 'N/A'}</p>
                          <p><strong>Email:</strong> ${order.User ? order.User.email : 'N/A'}</p>
                          <p><strong>Teléfono Celular:</strong> ${order.User ? order.User.phone : 'N/A'}</p>
                          <p><strong>Dirección de Envío:</strong> ${order.shipping_address || 'N/A'}</p>
                        </div>
                        
                        <table class="items-table">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th class="text-right">Precio Unit.</th>
                              <th class="text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${(order.OrderItems || []).map(item => `
                              <tr>
                                <td>${item.Product?.name || 'N/A'}</td>
                                <td>${item.quantity}</td>
                                <td class="text-right">$${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</td>
                                <td class="text-right">$${item.price && item.quantity ? (parseFloat(item.price) * item.quantity).toFixed(2) : '0.00'}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                        
                        <div class="totals">
                          <table>
                            <tr>
                              <td><strong>Subtotal:</strong></td>
                              <td class="text-right">$${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</td>
                            </tr>
                            <tr>
                              <td><strong>Envío:</strong></td>
                              <td class="text-right">$${order.shipping_cost ? parseFloat(order.shipping_cost).toFixed(2) : '0.00'}</td>
                            </tr>
                            ${order.tax && parseFloat(order.tax) > 0 ? `
                            <tr>
                              <td><strong>Impuestos:</strong></td>
                              <td class="text-right">$${parseFloat(order.tax).toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            <tr class="total-row">
                              <td><strong>TOTAL:</strong></td>
                              <td class="text-right">$${order.total ? parseFloat(order.total).toFixed(2) : '0.00'}</td>
                            </tr>
                          </table>
                        </div>
                        
                        <div class="footer">
                          <p>Gracias por tu compra</p>
                          <p>Estado: ${order.status}</p>
                        </div>
                      </body>
                      </html>
                    `;
                    
                    // Crear ventana nueva para imprimir
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(boletaContent);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  }}
                >
                  📄 Descargar Boleta Electrónica (PDF)
                </Button>
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