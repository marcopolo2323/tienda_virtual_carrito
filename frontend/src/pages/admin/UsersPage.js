import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Form, Alert, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import AdminLayout from '../../components/layouts/AdminLayout';
import useAuthStore from '../../store/authStore';
import useAdminStore from '../../store/adminStore';

const UsersPage = () => {
  const { currentUser } = useAuthStore();
  const { 
    users,
    loading,
    errors,
    pagination,
    fetchUsers,
    updateUser,
    deleteUser
  } = useAdminStore();

  const isLoading = loading.users;
  const error = errors.users;
  const usersPagination = pagination.users;

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // User edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState(null);
  const [Error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_admin: false
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers(1, { search: searchTerm, role: filterRole });
  }, [fetchUsers, filterRole]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, { search: searchTerm, role: filterRole });
  };

  const handleEditClick = (user) => {
    setCurrentEditUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      is_admin: user.is_admin
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    
    try {
      await updateUser(currentEditUser.id, formData);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setFormError(err.response?.data?.message || 'Failed to update user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(userToDelete.id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      // El error se manejará en el store
      setShowDeleteModal(false);
    }
  };

  const handlePageChange = (page) => {
    fetchUsers(page, { search: searchTerm, role: filterRole });
  };

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Users</h2>
        </div>

        {/* Search and Filter */}
        <div className="mb-4">
          <Row>
            <Col md={6} lg={4}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="outline-primary">
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={6} lg={3}>
              <Form.Select 
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                }}
              >
                <option value="">All Users</option>
                <option value="admin">Administrators</option>
                <option value="customer">Customers</option>
              </Form.Select>
            </Col>
          </Row>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : !users || users.length === 0 ? (
          <Alert variant="info">
            No users found. {searchTerm || filterRole ? 'Try adjusting your search filters.' : ''}
          </Alert>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.first_name || user.last_name ? 
                          `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                          '-'}
                      </td>
                      <td>
                        {user.is_admin ? 
                          <Badge bg="primary">Administrator</Badge> : 
                          <Badge bg="secondary">Customer</Badge>}
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>{user.order_count || 0}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEditClick(user)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {usersPagination.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                  <li className={`page-item ${usersPagination.currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(usersPagination.currentPage - 1)}
                      disabled={usersPagination.currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {[...Array(usersPagination.totalPages).keys()].map(page => (
                    <li 
                      key={page + 1} 
                      className={`page-item ${usersPagination.currentPage === page + 1 ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${usersPagination.currentPage === usersPagination.totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(usersPagination.currentPage + 1)}
                      disabled={usersPagination.currentPage === usersPagination.totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}

        {/* Edit User Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEditSubmit}>
            <Modal.Body>
              {formError && <Alert variant="danger">{formError}</Alert>}
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="is-admin-checkbox"
                  label="Administrator"
                  name="is_admin"
                  checked={formData.is_admin}
                  onChange={handleInputChange}
                  disabled={currentEditUser?.id === currentUser?.id}
                />
                {currentEditUser?.id === currentUser?.id && (
                  <Form.Text className="text-muted">
                    You cannot change your own administrator status.
                  </Form.Text>
                )}
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete the user <strong>{userToDelete?.username}</strong>?</p>
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              This action cannot be undone. If this user has placed orders, they will be preserved but will no longer be associated with an active account.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default UsersPage;