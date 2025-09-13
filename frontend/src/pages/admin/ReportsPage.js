import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import AdminLayout from '../../components/layouts/AdminLayout';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report filters
  const [reportType, setReportType] = useState('sales');
  const [timeRange, setTimeRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Report data
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // Fetch categories for filter dropdown
    const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      console.log('Categories response:', response.data); // Para debug
    console.log('Type:', typeof response.data); // Para debug
    console.log('Is Array:', Array.isArray(response.data));
      // Asegurarse de que siempre sea un array
      const categoriesData = Array.isArray(response.data) 
        ? response.data 
        : response.data.categories || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Mantener array vacío en caso de error
    }
  };
    
    fetchCategories();
    
    // Set default dates if not set
    if (!startDate || !endDate) {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      setEndDate(formatDate(today));
      setStartDate(formatDate(lastMonth));
    }
  }, []);
  
  useEffect(() => {
    fetchReportData();
  }, [reportType, timeRange, startDate, endDate, categoryFilter]);
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  const fetchReportData = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let url = `/admin/reports/${reportType}?`;
      url += `start_date=${startDate}&end_date=${endDate}`;
      
      if (timeRange !== 'custom') {
        url += `&time_range=${timeRange}`;
      }
      
      if (categoryFilter) {
        url += `&category_id=${categoryFilter}`;
      }
      
      const response = await axios.get(url);
      
      switch (reportType) {
        case 'sales':
          setSalesData(response.data);
          break;
        case 'products':
          setProductData(response.data);
          break;
        case 'categories':
          setCategoryData(response.data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeRangeChange = (e) => {
    const range = e.target.value;
    setTimeRange(range);
    
    const today = new Date();
    let startDateValue = new Date();
    
    switch (range) {
      case 'week':
        startDateValue.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDateValue.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDateValue.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDateValue.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        // Don't change dates for custom range
        return;
      default:
        break;
    }
    
    setStartDate(formatDate(startDateValue));
    setEndDate(formatDate(today));
  };
  
  const renderSalesReport = () => {
    if (!salesData) return null;
    
    const { daily_sales, total_revenue, order_count, average_order_value, revenue_by_payment_method } = salesData;
    
    // Ensure all values have defaults
    const safeTotalRevenue = total_revenue || 0;
    const safeOrderCount = order_count || 0;
    const safeAverageOrderValue = average_order_value || 0;
    const safeDailySales = daily_sales || [];
    
    // Prepare data for line chart
    const lineChartData = {
      labels: safeDailySales.map(item => item.date),
      datasets: [
        {
          label: 'Revenue',
          data: safeDailySales.map(item => item.revenue || 0),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Orders',
          data: safeDailySales.map(item => item.order_count || 0),
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.1,
          yAxisID: 'y1',
        },
      ],
    };
    
    const lineChartOptions = {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Revenue ($)',
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Order Count',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
    
    // Prepare data for payment methods pie chart
    const paymentMethodsData = {
      labels: revenue_by_payment_method.map(item => item.payment_method),
      datasets: [
        {
          data: revenue_by_payment_method.map(item => item.revenue),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    return (
      <>
        <Row className="mb-4">
          <Col md={4}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted">Total Revenue</h6>
                <h3 className="mb-0">${safeTotalRevenue.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted">Total Orders</h6>
                <h3 className="mb-0">{safeOrderCount}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted">Average Order Value</h6>
                <h3 className="mb-0">${safeAverageOrderValue.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>Revenue & Orders Over Time</Card.Header>
              <Card.Body>
                <Line data={lineChartData} options={lineChartOptions} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>Revenue by Payment Method</Card.Header>
              <Card.Body>
                <Pie data={paymentMethodsData} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };
  
  const renderProductsReport = () => {
    if (!productData) return null;
    
    const { top_selling_products, low_stock_products } = productData;
    
    // Prepare data for bar chart
    const barChartData = {
      labels: top_selling_products.map(product => product.name),
      datasets: [
        {
          label: 'Units Sold',
          data: top_selling_products.map(product => product.units_sold),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Revenue',
          data: top_selling_products.map(product => product.revenue),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        },
      ],
    };
    
    const barChartOptions = {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Units Sold',
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Revenue ($)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
    
    return (
      <>
        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>Top Selling Products</Card.Header>
              <Card.Body>
                <Bar data={barChartData} options={barChartOptions} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>Low Stock Products</Card.Header>
              <Card.Body>
                {low_stock_products.length === 0 ? (
                  <Alert variant="success">All products have sufficient stock.</Alert>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {low_stock_products.map(product => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>
                              <span className={`badge bg-${product.stock <= 5 ? 'danger' : 'warning'}`}>
                                {product.stock}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };
  
  const renderCategoriesReport = () => {
    if (!categoryData) return null;
    
    const { sales_by_category } = categoryData;
    
    // Prepare data for pie chart
    const pieChartData = {
      labels: sales_by_category.map(category => category.name),
      datasets: [
        {
          data: sales_by_category.map(category => category.revenue),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Prepare data for bar chart
    const barChartData = {
      labels: sales_by_category.map(category => category.name),
      datasets: [
        {
          label: 'Units Sold',
          data: sales_by_category.map(category => category.units_sold),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Revenue',
          data: sales_by_category.map(category => category.revenue),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        },
      ],
    };
    
    const barChartOptions = {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Units Sold',
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Revenue ($)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
    
    return (
      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>Revenue by Category</Card.Header>
            <Card.Body>
              <Pie data={pieChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>Category Performance</Card.Header>
            <Card.Body>
              <Bar data={barChartData} options={barChartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Reports</h2>
        </div>
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="sales">Sales Report</option>
                    <option value="products">Product Performance</option>
                    <option value="categories">Category Analysis</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Time Range</Form.Label>
                  <Form.Select 
                    value={timeRange} 
                    onChange={handleTimeRangeChange}
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last 12 Months</option>
                    <option value="custom">Custom Range</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {timeRange === 'custom' && (
                <>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
              
              {reportType !== 'categories' && (
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category Filter</Form.Label>
                    <Form.Select 
                      value={categoryFilter} 
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                        {Array.isArray(categories) && categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                onClick={fetchReportData}
              >
                Generate Report
              </Button>
            </div>
          </Card.Body>
        </Card>
        
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
        ) : (
          <div className="report-content">
            {reportType === 'sales' && renderSalesReport()}
            {reportType === 'products' && renderProductsReport()}
            {reportType === 'categories' && renderCategoriesReport()}
          </div>
        )}
      </Container>
    </AdminLayout>
  );
};

export default ReportsPage;