import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Form, Alert, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import axios from 'axios';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Update status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/admin/orders?page=${currentPage}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (dateRange.start) url += `&start_date=${dateRange.start}`;
      if (dateRange.end) url += `&end_date=${dateRange.end}`;
      
      const response = await axios.get(url);

      const ordersData = response.data.orders || response.data || [];
    setOrders(Array.isArray(ordersData) ? ordersData : []);

      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchOrders();
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (order) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setStatusError('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    setStatusLoading(true);
    setStatusError('');
    
    try {
      await axios.put(`/orders/${currentOrder.id}`, { status: newStatus });
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === currentOrder.id ? { ...order, status: newStatus } : order
      ));
      
      setShowStatusModal(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setStatusError(err.response?.data?.message || 'Failed to update order status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Orders</h2>
        </div>

        {/* Search and Filter */}
        <div className="mb-4">
          <Row>
            <Col md={4}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by order # or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="outline-primary">
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={2}>
              <Form.Select 
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                placeholder="Start Date"
              />
            </Col>
            <Col md={3}>
              <div className="d-flex">
                <Form.Control
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateChange}
                  placeholder="End Date"
                  className="me-2"
                />
                <Button 
                  variant="outline-primary" 
                  onClick={handleSearch}
                >
                  Filter
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : !orders || orders.length === 0 ? (
          <Alert variant="info">
            No orders found. {searchTerm || filterStatus || dateRange.start || dateRange.end ? 'Try adjusting your search filters.' : ''}
          </Alert>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        {order.user_id ? (
                          <Link to={`/admin/users/${order.user_id}`}>
                            {order.user_name || 'User'}
                          </Link>
                        ) : (
                          <span>{order.shipping_info?.email || 'Guest'}</span>
                        )}
                      </td>
                      <td>{order.item_count}</td>
                      <td>${parseFloat(order.total).toFixed(2)}</td>
                      <td>{order.payment_method === 'card' ? 'Credit Card' : order.payment_method}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="btn btn-sm btn-outline-primary me-2">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleStatusChange(order)}
                        >
                          <i className="bi bi-arrow-repeat"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {[...Array(totalPages).keys()].map(page => (
                    <li 
                      key={page + 1} 
                      className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}

        {/* Update Status Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Order Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {statusError && <Alert variant="danger">{statusError}</Alert>}
            
            <p>Order #{currentOrder?.id}</p>
            <p>Current Status: {currentOrder && getStatusBadge(currentOrder.status)}</p>
            
            <Form.Group className="mb-3">
              <Form.Label>New Status</Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleStatusUpdate}
              disabled={statusLoading || newStatus === currentOrder?.status}
            >
              {statusLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default OrdersPage;