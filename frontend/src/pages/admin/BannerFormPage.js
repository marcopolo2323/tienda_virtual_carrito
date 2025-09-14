// pages/admin/BannerFormPage.js - Formulario corregido para crear/editar banners
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Spinner 
} from 'react-bootstrap';
import AdminLayout from '../../components/layouts/AdminLayout';
import useBannerStore from '../../store/bannerStore';
import { toast } from 'react-toastify';

const BannerFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const {
    createBanner,
    updateBanner,
    getBannerById,
    loading,
    errors
  } = useBannerStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    button_text: 'Shop Now',  // Agregar button_text
    active: true,
    display_order: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const banner = getBannerById(parseInt(id));
      if (banner) {
        setFormData({
          title: banner.title || '',
          description: banner.description || '',
          link_url: banner.link_url || '',
          button_text: banner.button_text || 'Shop Now',  // Incluir button_text
          active: banner.active !== undefined ? banner.active : true,
          display_order: banner.display_order || 1
        });
        setImagePreview(banner.image_url);
      }
    }
  }, [id, isEditing, getBannerById]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file'
        }));
        return;
      }
      
      // Validar tamaño (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          image: 'File size must be less than 10MB'
        }));
        return;
      }
      
      setImageFile(file);
      
      // Limpiar error de imagen
      setFormErrors(prev => ({
        ...prev,
        image: null
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validar título
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length > 255) {
      errors.title = 'Title must be less than 255 characters';
    }
    
    // Validar descripción
    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    // Validar imagen para banners nuevos
    if (!isEditing && !imageFile) {
      errors.image = 'Image is required for new banners';
    }
    
    // Validar URL del enlace si está presente
    if (formData.link_url && formData.link_url.trim() && !isValidUrl(formData.link_url)) {
      errors.link_url = 'Please enter a valid URL';
    }
    
    // Validar button_text si está presente
    if (formData.button_text && formData.button_text.length > 100) {
      errors.button_text = 'Button text must be less than 100 characters';
    }
    
    // Validar display_order
    if (formData.display_order < 0) {
      errors.display_order = 'Display order must be 0 or greater';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Validar que los campos requeridos existan
      if (!formData.title || !formData.description) {
        toast.error('Título y descripción son requeridos');
        return;
      }
      
      // Agregar campos requeridos
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      
      // Campos opcionales - solo agregar si tienen valor
      if (formData.link_url && formData.link_url.trim()) {
        formDataToSend.append('link_url', formData.link_url.trim());
      }
      
      if (formData.button_text && formData.button_text.trim()) {
        formDataToSend.append('button_text', formData.button_text.trim());
      } else {
        formDataToSend.append('button_text', 'Shop Now'); // Valor por defecto
      }
      
      // Convertir boolean a string para FormData
      formDataToSend.append('active', formData.active.toString());
      formDataToSend.append('display_order', formData.display_order.toString());
      
      // Agregar imagen si existe
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let result;
      if (isEditing) {
        result = await updateBanner(parseInt(id), formDataToSend);
      } else {
        result = await createBanner(formDataToSend);
      }
      
      if (result) {
        navigate('/admin/banners');
      }
    } catch (error) {
      console.error('Error guardando banner:', error);
      // El error ya se maneja en el store, no necesitamos hacer nada más aquí
    }
  };

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-0">
                  {isEditing ? 'Edit Banner' : 'Create Banner'}
                </h1>
                <p className="text-muted">
                  {isEditing ? 'Update banner information' : 'Add a new banner to your website'}
                </p>
              </div>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/admin/banners')}
              >
                Back to Banners
              </Button>
            </div>
          </Col>
        </Row>

        {/* Error Display */}
        {errors.create && (
          <Alert variant="danger" className="mb-4">
            <strong>Error creando banner:</strong> {errors.create}
          </Alert>
        )}
        
        {errors.update && (
          <Alert variant="danger" className="mb-4">
            <strong>Error actualizando banner:</strong> {errors.update}
          </Alert>
        )}

        {/* Form */}
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title *</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          isInvalid={!!formErrors.title}
                          placeholder="Enter banner title"
                          maxLength={255}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.title}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Display Order</Form.Label>
                        <Form.Control
                          type="number"
                          name="display_order"
                          value={formData.display_order}
                          onChange={handleInputChange}
                          min="0"
                          isInvalid={!!formErrors.display_order}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.display_order}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.description}
                      placeholder="Enter banner description"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Link URL (optional)</Form.Label>
                    <Form.Control
                      type="url"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.link_url}
                      placeholder="https://example.com"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.link_url}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Leave empty if banner shouldn't be clickable
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Button Text (optional)</Form.Label>
                    <Form.Control
                      type="text"
                      name="button_text"
                      value={formData.button_text}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.button_text}
                      placeholder="Shop Now"
                      maxLength={100}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.button_text}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Text to display on the button (if link URL is provided)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Banner Image *</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      isInvalid={!!formErrors.image}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.image}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Recommended size: 1920x600px. Max file size: 10MB. Formats: JPG, PNG, GIF, WebP
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      label="Active (visible on website)"
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading.create || loading.update}
                    >
                      {loading.create || loading.update ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        isEditing ? 'Update Banner' : 'Create Banner'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/admin/banners')}
                      disabled={loading.create || loading.update}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Image Preview */}
          <Col lg={4}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Image Preview</h6>
              </Card.Header>
              <Card.Body>
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="img-fluid rounded"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    <div className="mt-2">
                      <small className="text-muted">
                        This is how your banner will appear
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-image" style={{ fontSize: '48px' }}></i>
                    <p className="mt-2 mb-0">Select an image to preview</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="mt-3">
                <Card.Header>
                  <h6 className="mb-0">Debug Info</h6>
                </Card.Header>
                <Card.Body>
                  <small>
                    <strong>Form Data:</strong>
                    <pre className="mt-1" style={{ fontSize: '10px' }}>
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                    <strong>Has Image:</strong> {imageFile ? 'Yes' : 'No'}
                    <br />
                    <strong>Form Errors:</strong>
                    <pre className="mt-1" style={{ fontSize: '10px' }}>
                      {JSON.stringify(formErrors, null, 2)}
                    </pre>
                  </small>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default BannerFormPage;