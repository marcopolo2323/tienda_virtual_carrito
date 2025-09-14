// pages/admin/BannersPage.js - Página de administración de banners
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Badge, 
  Dropdown,
  Alert,
  Spinner 
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import useBannerStore from '../../store/bannerStore';

const BannersPage = () => {
  const {
    banners,
    loading,
    errors,
    pagination,
    fetchBanners,
    deleteBanner,
    toggleBannerStatus
  } = useBannerStore();

  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    fetchBanners(1, 10, activeFilter);
  }, [fetchBanners, activeFilter]);


  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este banner?')) {
      try {
        await deleteBanner(id);
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleBannerStatus(id, !currentStatus);
    } catch (error) {
      console.error('Error toggling banner status:', error);
    }
  };

  const handlePageChange = (page) => {
    fetchBanners(page, pagination.per_page, activeFilter);
  };

  if (loading.banners) {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando banners...</span>
            </Spinner>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-0">Banner Management</h1>
                <p className="text-muted">Manage your website banners and carousel content</p>
              </div>
              <Link to="/admin/banners/new" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Create Banner
              </Link>
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <div className="d-flex gap-2">
                  <Button 
                    variant={activeFilter === null ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveFilter(null)}
                  >
                    All Banners
                  </Button>
                  <Button 
                    variant={activeFilter === true ? 'success' : 'outline-success'}
                    onClick={() => setActiveFilter(true)}
                  >
                    Active Only
                  </Button>
                  <Button 
                    variant={activeFilter === false ? 'secondary' : 'outline-secondary'}
                    onClick={() => setActiveFilter(false)}
                  >
                    Inactive Only
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Error Display */}
        {errors.banners && (
          <Alert variant="danger" className="mb-4">
            {errors.banners}
          </Alert>
        )}

        {/* Banners Table */}
        <Row>
          <Col>
            <Card>
              <Card.Body className="p-0">
                {banners && banners.length > 0 ? (
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Order</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.filter(banner => banner && banner.id).map(banner => (
                        <tr key={banner?.id || Math.random()}>
                          <td>
                            {banner?.image_url ? (
                              <img 
                                src={banner.image_url} 
                                alt={banner.title || 'Banner'}
                                style={{ width: '80px', height: '50px', objectFit: 'cover' }}
                                className="rounded"
                              />
                            ) : (
                              <div 
                                style={{ 
                                  width: '80px', 
                                  height: '50px', 
                                  backgroundColor: '#f8f9fa',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px'
                                }}
                              >
                                <small className="text-muted">No image</small>
                              </div>
                            )}
                          </td>
                          <td>
                            <div>
                              <strong>{banner?.title || 'Sin título'}</strong>
                              {banner?.link_url && (
                                <div>
                                  <small className="text-muted">
                                    Links to: {banner.link_url}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px' }}>
                              {banner?.description ? (
                                banner.description.length > 100 
                                  ? banner.description.substring(0, 100) + '...'
                                  : banner.description
                              ) : 'Sin descripción'}
                            </div>
                          </td>
                          <td>
                            <Badge 
                              bg={banner?.active ? 'success' : 'secondary'}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleToggleStatus(banner?.id, banner?.active)}
                            >
                              {banner?.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="info">{banner?.display_order || 0}</Badge>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="outline-secondary" 
                                size="sm"
                                id={`dropdown-${banner?.id || 'unknown'}`}
                              >
                                <i className="bi bi-three-dots"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item 
                                  as={Link} 
                                  to={`/admin/banners/edit/${banner?.id}`}
                                  disabled={!banner?.id}
                                >
                                  <i className="bi bi-pencil me-2"></i>
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleToggleStatus(banner?.id, banner?.active)}
                                  disabled={!banner?.id}
                                >
                                  <i className={`bi bi-${banner?.active ? 'pause' : 'play'} me-2`}></i>
                                  {banner?.active ? 'Deactivate' : 'Activate'}
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  className="text-danger"
                                  onClick={() => handleDelete(banner?.id)}
                                  disabled={!banner?.id}
                                >
                                  <i className="bi bi-trash me-2"></i>
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-images text-muted" style={{ fontSize: '48px' }}></i>
                    <h5 className="text-muted mt-3">No Banners Found</h5>
                    <p className="text-muted">Crea tu primer banner para comenzar.</p>
                    <Link to="/admin/banners/new" className="btn btn-primary">
                      <i className="bi bi-plus-circle me-2"></i>
                      Create Banner
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <Row className="mt-4">
            <Col>
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {[...Array(pagination.total_pages)].map((_, index) => (
                    <li 
                      key={index + 1} 
                      className={`page-item ${pagination.current_page === index + 1 ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </Col>
          </Row>
        )}
      </Container>
    </AdminLayout>
  );
};

export default BannersPage;
