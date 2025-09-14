import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from '../utils/axios';

const OrdersPage = () => {
  const { currentUser, isAuthenticated, loading: authLoading, checkUserLoggedIn } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to view your orders.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching orders...', { isAuthenticated, currentUser, token: !!token });
      setLoading(true);
      const response = await axios.get('/orders/my-orders');
      console.log('Orders fetched successfully:', response.data);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Your session has expired. Please log in again.');
        // Re-verificar autenticación
        await checkUserLoggedIn();
      } else {
        setError(`Failed to load orders: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, currentUser, checkUserLoggedIn]);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      // Esperar a que la autenticación esté completa
      if (authLoading) return;
      
      // Si no está autenticado, no hacer fetch
      if (!isAuthenticated) {
        if (isMounted) {
          setError('You must be logged in to view your orders.');
          setLoading(false);
        }
        return;
      }

      // Solo hacer fetch si está montado el componente
      if (isMounted) {
        await fetchOrders();
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading, fetchOrders]);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'processing':
        return <Badge bg="info">Procesando</Badge>;
      case 'shipped':
        return <Badge bg="primary">Enviado</Badge>;
      case 'delivered':
        return <Badge bg="success">Entregado</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading your orders...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          {error.includes('log in') && (
            <div className="mt-3">
              <Link to="/login">
                <Button variant="primary">Go to Login</Button>
              </Link>
            </div>
          )}
        </Alert>
      </Container>
    );
  }

  if (orders.length === 0) {
    return ( 
      <Container className="py-5">
        <div className="text-center">
          <h2 className="mb-4">
            {currentUser ? `${currentUser.username}'s Orders`: "My Orders"}
          </h2>
          <div className="mb-4">
            <i className="bi bi-bag text-muted" style={{ fontSize: '4rem' }}></i>
          </div>
          <p className="lead mb-4">You haven't placed any orders yet.</p>
          <Link to="/products">
            <Button variant="primary">Start Shopping</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">My Orders</h2>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders && Array.isArray(orders) && orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <Link to={`/order/${order.id}`}>
                    <Button variant="outline-primary" size="sm">Ver Detalles</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default OrdersPage;