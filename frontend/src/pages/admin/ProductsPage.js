import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import AdminLayout from '../../components/layouts/AdminLayout';
import axios from '../../utils/axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: null
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  // Image preview
  const [imagePreview, setImagePreview] = useState(null);
  
  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Helper function para normalizar URLs de imágenes de Cloudinary
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Si ya es una URL completa, usarla tal como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Si parece ser un public_id de Cloudinary, construir la URL
    if (imageUrl.includes('tienda-productos/') || imageUrl.startsWith('product-')) {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      if (cloudName) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill,f_auto,q_auto/${imageUrl}`;
      }
    }
    
    // Fallback para imágenes locales
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/src/uploads/${imageUrl}`;
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      const categoriesData = response.data.categories || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/products?page=${currentPage}`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterCategory) url += `&category=${filterCategory}`;
      
      const response = await axios.get(url);
      
      const productsData = response.data.products || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (mode, product = null) => {
    setModalMode(mode);
    setCurrentProduct(product);
    setImagePreview(null);
    
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id || '',
        image: null
      });
      if (product.image_url) {
        // ACTUALIZADO: Usar la función helper para obtener la URL correcta
        setImagePreview(getImageUrl(product.image_url));
      }
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null
      });
    }
    
    setFormError('');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFormError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] || null }));
      
      // Create image preview
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    
    // Create form data for file upload
    const productFormData = new FormData();
    productFormData.append('name', formData.name);
    productFormData.append('description', formData.description);
    productFormData.append('price', formData.price);
    productFormData.append('stock', formData.stock);
    if (formData.category_id) {
      productFormData.append('category_id', formData.category_id);
    }
    if (formData.image) {
      productFormData.append('image', formData.image);
    }
    
    try {
      if (modalMode === 'add') {
        await axios.post('/products', productFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.put(`/products/${currentProduct.id}`, productFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      fetchProducts();
      handleModalClose();
    } catch (err) {
      console.error('Error saving product:', err);
      setFormError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/products/${productToDelete.id}`);
      fetchProducts();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product.');
      setShowDeleteModal(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchProducts();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Products</h2>
          <Button variant="primary" onClick={() => handleModalOpen('add')}>
            <i className="bi bi-plus-circle me-2"></i> Add Product
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-4">
          <Row>
            <Col md={6} lg={4}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
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
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
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
        ) : !Array.isArray(products) || products.length === 0 ? (
          <Alert variant="info">
            No products found. {searchTerm || filterCategory ? 'Try adjusting your search filters.' : 'Create your first product to get started.'}
          </Alert>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        {product.image_url ? (
                          <img 
                            src={getImageUrl(product.image_url)} 
                            alt={product.name} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '50px', 
                            height: '50px',
                            display: product.image_url ? 'none' : 'flex'
                          }}
                        >
                          <i className="bi bi-image text-muted"></i>
                        </div>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category_name || '-'}</td>
                      <td>${parseFloat(product.price).toFixed(2)}</td>
                      <td>
                        <span className={product.stock <= 5 ? 'text-danger' : ''}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleModalOpen('edit', product)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <i className="bi bi-trash"></i>
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

        {/* Add/Edit Product Modal */}
        <Modal show={showModal} onHide={handleModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {formError && <Alert variant="danger">{formError}</Alert>}
              
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter product name"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price ($)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          placeholder="0.00"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                          type="number"
                          step="1"
                          min="0"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          required
                          placeholder="0"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a category (optional)</option>
                      {Array.isArray(categories) && categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Image</Form.Label>
                    <Form.Control
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                    />
                    <Form.Text className="text-muted">
                      {modalMode === 'edit' ? 'Upload a new image to replace the existing one.' : 'Upload a product image (optional).'}
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="mt-3 text-center">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '200px' }} 
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                        <div className="text-muted">
                          <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                          <p className="mt-2">No image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : 'Save Product'}
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
            <p>Are you sure you want to delete the product <strong>{productToDelete?.name}</strong>?</p>
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              This action cannot be undone. The product will be permanently removed from the system.
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

export default ProductsPage;