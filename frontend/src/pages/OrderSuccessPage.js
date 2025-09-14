import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import axios from '../utils/axios';

const OrderSuccessPage = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      console.log('=== ORDER SUCCESS PAGE ===');
      console.log('Order ID from params:', orderId);
      console.log('Order ID type:', typeof orderId);
      
      if (!orderId || orderId === 'undefined') {
        console.error('❌ No se encontró ID de orden válido');
        setError('No se encontró el ID de la orden. Verifica tu historial de pedidos.');
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Buscando detalles de orden:', orderId);
        const response = await axios.get(`/orders/${orderId}`);
        console.log('✅ Respuesta de orden:', response.data);
        console.log('📋 Estructura de order:', JSON.stringify(response.data.order || response.data, null, 2));
        setOrder(response.data.order || response.data);
      } catch (err) {
        console.error('❌ Error fetching order details:', err);
        setError('Error al cargar los detalles de la orden. Verifica tu historial de pedidos.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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
          <Link to="/orders">
            <Button variant="primary">View My Orders</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
        </div>
        <h1 className="mb-3">Thank You for Your Order!</h1>
        <p className="lead">Your order has been placed successfully.</p>
        <p>Order Number: <strong>#{order?.id}</strong></p>
        <p>We've sent a confirmation email to <strong>{order?.shipping_info?.email}</strong></p>
      </div>

      {order && (
        <Card className="mb-4">
          <Card.Header>
            <h4 className="mb-0">Order Summary</h4>
          </Card.Header>
          <Card.Body>
            <div className="row mb-4">
              <div className="col-md-6">
                <h5>Información de Envío</h5>
                {order.shipping_info ? (
                  <>
                    <p className="mb-1">
                      {order.shipping_info.first_name || ''} {order.shipping_info.last_name || ''}
                    </p>
                    <p className="mb-1">{order.shipping_info.address || ''}</p>
                    <p className="mb-1">
                      {order.shipping_info.city || ''}, {order.shipping_info.state || ''} {order.shipping_info.zip_code || ''}
                    </p>
                    <p className="mb-1">{order.shipping_info.country || ''}</p>
                    <p className="mb-1">{order.shipping_info.phone || ''}</p>
                  </>
                ) : order.shipping_address ? (
                  <p className="mb-1">{order.shipping_address}</p>
                ) : (
                  <p className="mb-1 text-muted">Información de envío no disponible</p>
                )}
              </div>
              <div className="col-md-6">
                <h5>Información de Pago</h5>
                <p className="mb-1">
                  <strong>Payment Method:</strong> {order.payment_method === 'card' ? 'Credit Card' : order.payment_method === 'cash' ? 'Cash on Delivery' : order.payment_method}
                </p>
                <p className="mb-1">
                  <strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="mb-1">
                  <strong>Order Status:</strong> {order.status}
                </p>
              </div>
            </div>

            <h5>Artículos del Pedido</h5>
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
                  {(order.OrderItems || order.items || []).map(item => (
                    <tr key={item.id}>
                      <td>{item.Product?.name || item.product_name || 'Producto'}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end">${parseFloat(item.price).toFixed(2)}</td>
                      <td className="text-end">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Subtotal</strong></td>
                    <td className="text-end">${parseFloat(order.subtotal || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Shipping</strong></td>
                    <td className="text-end">${parseFloat(order.shipping_cost || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Total</strong></td>
                    <td className="text-end"><strong>${parseFloat(order.total || 0).toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="text-center mt-4">
        <Link to="/orders">
          <Button variant="primary" className="me-3">View My Orders</Button>
        </Link>
        <Link to="/products">
          <Button variant="outline-primary">Continue Shopping</Button>
        </Link>
      </div>
    </Container>
  );
};

export default OrderSuccessPage;