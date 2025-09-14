import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import axios from '../../utils/axios';

const ProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!productId;
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: null
  });
  
  // Image preview
  const [imagePreview, setImagePreview] = useState(null);
  
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
    return `${baseUrl}/uploads/${imageUrl}`;
  };
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        const categoriesData = response.data.categories || response.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Error al cargar categorías. Por favor intenta de nuevo.');
        setCategories([]);
      }
    };
    
    fetchCategories();
    
    if (isEditMode) {
      fetchProductDetails();
    } else {
      setLoading(false);
    }
  }, [productId, isEditMode]);
  
  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/products/${productId}`);
      const product = response.data;
      
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
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Error al cargar detalles del producto. Por favor intenta de nuevo.');
      setLoading(false);
    }
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
    setError(null);
    setSuccess(false);
    setSaving(true);
    
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
      if (isEditMode) {
        await axios.put(`/products/${productId}`, productFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('¡Producto actualizado exitosamente!');
      } else {
        await axios.post('/products', productFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('¡Producto creado exitosamente!');
        
        // Reset form in create mode
        if (!isEditMode) {
          setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category_id: '',
            image: null
          });
          setImagePreview(null);
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Error al guardar producto. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
      
      // Scroll to top to show success/error message
      window.scrollTo(0, 0);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/products');
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </Container>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
          <Button variant="outline-secondary" onClick={handleCancel}>
            <i className="bi bi-arrow-left me-2"></i> Back to Products
          </Button>
        </div>
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
            {success}
          </Alert>
        )}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
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
                      rows={6}
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
                  <Card className="mb-3">
                    <Card.Header>Product Image</Card.Header>
                    <Card.Body>
                      <Form.Group>
                        <Form.Control
                          type="file"
                          name="image"
                          onChange={handleInputChange}
                          accept="image/*"
                        />
                        <Form.Text className="text-muted">
                          {isEditMode ? 'Upload a new image to replace the existing one.' : 'Upload a product image (optional).'}
                        </Form.Text>
                      </Form.Group>
                      
                      <div className="mt-3 text-center">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Product preview" 
                            className="img-thumbnail" 
                            style={{ maxHeight: '250px' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center" 
                          style={{ 
                            height: '250px',
                            display: imagePreview ? 'none' : 'flex'
                          }}
                        >
                          <div className="text-muted">
                            <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                            <p className="mt-2">No image</p>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Product' : 'Create Product'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default ProductFormPage;