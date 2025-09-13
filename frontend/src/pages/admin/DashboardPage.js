import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import useAdminStore from '../../store/adminStore';
import useAuthStore from '../../store/authStore';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    dashboardData,
    loading,
    errors,
    fetchDashboardData
  } = useAdminStore();
  
  const { isAuthenticated, currentUser } = useAuthStore();
  const role = currentUser?.role;

  const isLoading = loading.dashboard;
  const error = errors.dashboard;

  useEffect(() => {
    // Verificar autenticación y rol de admin
    if (!isAuthenticated) {
      console.log('🔍 Dashboard - User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (role !== 'admin') {
      console.log('🔍 Dashboard - User is not admin, redirecting to home');
      navigate('/');
      return;
    }
    
    console.log('🔍 Dashboard useEffect - Calling fetchDashboardData');
    fetchDashboardData();
  }, [isAuthenticated, role, navigate, fetchDashboardData]);

  // Debug logs para ver el estado actual
  console.log('🔍 Dashboard Render - Current state:', {
    isAuthenticated,
    currentUser,
    role,
    isLoading,
    error,
    dashboardData,
    hasData: !!dashboardData,
    dataKeys: dashboardData ? Object.keys(dashboardData) : 'No data'
  });

  // Mostrar loading mientras se verifica la autenticación
  if (!isAuthenticated || !currentUser || role !== 'admin') {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <div className="text-center">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Verifying access...</span>
            </Spinner>
            <p className="mt-3">Verifying access...</p>
            <small className="text-muted">
              Auth: {isAuthenticated ? 'Yes' : 'No'} | 
              User: {currentUser ? 'Yes' : 'No'} | 
              Role: {role || 'undefined'}
            </small>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-warning text-dark';
      case 'processing': return 'bg-info text-white';
      case 'shipped': return 'bg-primary text-white';
      case 'delivered': return 'bg-success text-white';
      case 'completed': return 'bg-success text-white';
      case 'cancelled': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  if (isLoading) {
    console.log('🔍 Dashboard - Showing loading state');
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <div className="text-center">
            <h2 className="mb-4">Dashboard</h2>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading dashboard data...</span>
            </Spinner>
            <p className="mt-3">Loading dashboard data...</p>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  if (error) {
    console.log('🔍 Dashboard - Showing error state:', error);
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <h2 className="mb-4">Dashboard</h2>
          <Alert variant="danger">
            <Alert.Heading>Error Loading Dashboard</Alert.Heading>
            <p>{error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  console.log('🔍 Dashboard - Retrying fetch');
                  fetchDashboardData();
                }}
              >
                Try Again
              </button>
            </div>
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  // Si no hay datos después de cargar
  if (!dashboardData) {
    console.log('🔍 Dashboard - No data available');
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <h2 className="mb-4">Dashboard</h2>
          <Alert variant="warning">
            <Alert.Heading>No Data Available</Alert.Heading>
            <p>Dashboard data is not available. This could be due to:</p>
            <ul>
              <li>Network connectivity issues</li>
              <li>Server not responding</li>
              <li>No data in the database yet</li>
            </ul>
            <hr />
            <div className="d-flex justify-content-end">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  console.log('🔍 Dashboard - Manual refresh');
                  fetchDashboardData();
                }}
              >
                Refresh Data
              </button>
            </div>
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  console.log('🔍 Dashboard - Rendering with data:', dashboardData);

  return (
    <AdminLayout>
      <Container fluid className="py-4" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <div className="mb-4">
          <h1 className="h2 text-dark">Dashboard</h1>
          <p className="text-muted">Welcome back! Here's what's happening with your store.</p>
        </div>
        
        {/* Debug Info - Solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <Alert variant="info" className="mb-4">
            <details>
              <summary><strong>Debug Info</strong> (Click to expand)</summary>
              <pre className="mt-3" style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify({
                  loading: isLoading,
                  error: error,
                  dataAvailable: !!dashboardData,
                  keys: dashboardData ? Object.keys(dashboardData) : null,
                  fullData: dashboardData
                }, null, 2)}
              </pre>
            </details>
          </Alert>
        )}
        
        {/* Stats Cards Row */}
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-people text-primary" style={{ fontSize: '24px' }}></i>
                </div>
                <h3 className="mb-1 text-dark fw-bold">
                  {dashboardData?.user_count ?? 'N/A'}
                </h3>
                <p className="text-muted mb-0 small">Total Users</p>
                <Link to="/admin/users" className="stretched-link text-decoration-none">
                  <small>View Details <i className="bi bi-arrow-right"></i></small>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} sm={6} md={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-box-seam text-success" style={{ fontSize: '24px' }}></i>
                </div>
                <h3 className="mb-1 text-dark fw-bold">
                  {dashboardData?.product_count ?? 'N/A'}
                </h3>
                <p className="text-muted mb-0 small">Total Products</p>
                <Link to="/admin/products" className="stretched-link text-decoration-none">
                  <small>View Details <i className="bi bi-arrow-right"></i></small>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} sm={6} md={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-bag text-info" style={{ fontSize: '24px' }}></i>
                </div>
                <h3 className="mb-1 text-dark fw-bold">
                  {dashboardData?.order_count ?? 'N/A'}
                </h3>
                <p className="text-muted mb-0 small">Total Orders</p>
                <Link to="/admin/orders" className="stretched-link text-decoration-none">
                  <small>View Details <i className="bi bi-arrow-right"></i></small>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} sm={6} md={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="rounded-circle bg-warning bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-currency-dollar text-warning" style={{ fontSize: '24px' }}></i>
                </div>
                <h3 className="mb-1 text-dark fw-bold">
                  ${dashboardData?.total_revenue != null ? Number(dashboardData.total_revenue).toFixed(2) : '0.00'}
                </h3>
                <p className="text-muted mb-0 small">Total Revenue</p>
                <Link to="/admin/reports" className="stretched-link text-decoration-none">
                  <small>View Reports <i className="bi bi-arrow-right"></i></small>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Main Content Row */}
        <Row className="g-4">
          {/* Recent Orders - Left Column */}
          <Col lg={8}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-dark">Recent Orders</h5>
                  <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
                    View All Orders
                  </Link>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {dashboardData?.recent_orders && Array.isArray(dashboardData.recent_orders) && dashboardData.recent_orders.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="mb-0" hover>
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">Order #</th>
                          <th className="border-0">Customer</th>
                          <th className="border-0">Date</th>
                          <th className="border-0">Amount</th>
                          <th className="border-0">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recent_orders.map(order => (
                          <tr key={order.id}>
                            <td className="fw-semibold">
                              <Link to={`/admin/orders/${order.id}`} className="text-decoration-none">
                                #{order.id}
                              </Link>
                            </td>
                            <td>{order.user_name || 'Guest User'}</td>
                            <td className="text-muted">
                              {new Date(order.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="fw-semibold">${Number(order.total || 0).toFixed(2)}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(order.status || 'pending')} rounded-pill px-2 py-1`}>
                                {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '48px' }}></i>
                    <h6 className="text-muted mt-3">No Recent Orders</h6>
                    <p className="text-muted small mb-0">Orders will appear here once customers start purchasing.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            {/* Low Stock Products */}
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-dark">Low Stock Alert</h5>
                  <Link to="/admin/products" className="btn btn-sm btn-outline-primary">
                    Manage Inventory
                  </Link>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {dashboardData?.low_stock_products && Array.isArray(dashboardData.low_stock_products) && dashboardData.low_stock_products.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="mb-0" hover>
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">Product</th>
                          <th className="border-0">Category</th>
                          <th className="border-0">Price</th>
                          <th className="border-0">Stock</th>
                          <th className="border-0">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.low_stock_products.map(product => (
                          <tr key={product.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className="me-3 rounded" 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                  />
                                ) : (
                                  <div className="bg-light d-flex align-items-center justify-content-center me-3 rounded" 
                                       style={{ width: '40px', height: '40px' }}>
                                    <i className="bi bi-image text-muted"></i>
                                  </div>
                                )}
                                <span className="fw-semibold">{product.name}</span>
                              </div>
                            </td>
                            <td className="text-muted">{product.category_name || 'Uncategorized'}</td>
                            <td className="fw-semibold">${Number(product.price || 0).toFixed(2)}</td>
                            <td>
                              <span className="badge bg-danger text-white rounded-pill">
                                {product.stock || 0} units
                              </span>
                            </td>
                            <td>
                              <Link 
                                to={`/admin/products/edit/${product.id}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="bi bi-pencil me-1"></i>Update
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '48px' }}></i>
                    <h6 className="text-success mt-3">All Stock Levels Good!</h6>
                    <p className="text-muted small mb-0">All products have sufficient inventory.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          {/* Right Column - Charts & Stats */}
          <Col lg={4}>
            {/* Order Status Distribution */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 text-dark">Orders by Status</h5>
              </Card.Header>
              <Card.Body>
                {dashboardData?.orders_by_status && Object.keys(dashboardData.orders_by_status).length > 0 ? (
                  <div>
                    {Object.entries(dashboardData.orders_by_status).map(([status, count]) => (
                      <div key={status} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-capitalize fw-semibold text-dark">{status}</span>
                          <span className="fw-bold text-dark">{count}</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar ${getStatusBadgeClass(status).replace('text-white', '').replace('text-dark', '')}`}
                            role="progressbar" 
                            style={{ 
                              width: `${Math.max((count / Math.max(dashboardData.order_count || 1, 1)) * 100, 5)}%` 
                            }} 
                            aria-valuenow={(count / Math.max(dashboardData.order_count || 1, 1)) * 100} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-graph-up text-muted" style={{ fontSize: '36px' }}></i>
                    <p className="text-muted mt-2 mb-0">No order status data</p>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            {/* Top Selling Products */}
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 text-dark">Top Selling Products</h5>
              </Card.Header>
              <Card.Body>
                {dashboardData?.top_products && Array.isArray(dashboardData.top_products) && dashboardData.top_products.length > 0 ? (
                  <div>
                    {dashboardData.top_products.map((product, index) => (
                      <div key={product.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <div className="me-3">
                          <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                                style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="d-flex align-items-center flex-grow-1">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="me-3 rounded" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                            />
                          ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center me-3 rounded" 
                                 style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                          <div className="flex-grow-1">
                            <h6 className="mb-0 fw-semibold text-dark" style={{ fontSize: '14px' }}>
                              {product.name}
                            </h6>
                            <small className="text-muted">
                              ${Number(product.price || 0).toFixed(2)} • {product.units_sold || 0} sold
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-trophy text-muted" style={{ fontSize: '36px' }}></i>
                    <p className="text-muted mt-2 mb-0">No sales data yet</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default DashboardPage;