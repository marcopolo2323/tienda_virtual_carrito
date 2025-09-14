import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from '../utils/axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const CheckoutPage = () => {
  const { items, total, loading: cartLoading, clearCart } = useCartStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  // Helper function para normalizar URLs de imágenes de Cloudinary
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.includes('tienda-productos/') || imageUrl.startsWith('product-')) {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      if (cloudName) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_120,h_120,c_fill,f_auto,q_auto/${imageUrl}`;
      }
    }
    
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${imageUrl}`;
  };

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'PE'
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0
  });

  // MercadoPago state
  const [preferenceId, setPreferenceId] = useState('');
  const [preferenceLoading, setPreferenceLoading] = useState(false);

  // Form validation
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    // Redirect if cart is empty
    if (!cartLoading && items.length === 0) {
      navigate('/cart');
    }
  }, [items, cartLoading, navigate]);

  useEffect(() => {
    // Calculate order summary
    const subtotal = total;
    const shipping = subtotal > 100 ? 0 : 15;
    const totalWithShipping = subtotal + shipping;

    setOrderSummary({
      subtotal,
      shipping,
      total: totalWithShipping
    });
  }, [total]);

  // PROBLEMA IDENTIFICADO: Crear preference solo cuando se necesite
  const createMercadoPagoPreference = async () => {
    if (preferenceId || preferenceLoading || !shippingInfo.firstName || !shippingInfo.email) {
      return;
    }

    setPreferenceLoading(true);
    setError(null);

    try {
      // Validar que phone sea un número válido
      const phoneNumber = shippingInfo.phone?.replace(/\D/g, '');
      const validPhone = phoneNumber && phoneNumber.length >= 9 ? parseInt(phoneNumber) : 51987654321;

      const preferenceData = {
        items: items.map(item => ({
          title: item.name || 'Producto',
          quantity: item.quantity || 1,
          unit_price: parseFloat(item.price) || 0,
          currency_id: 'PEN'
        })),
        payer: {
          name: shippingInfo.firstName,
          surname: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: {
            number: validPhone
          },
          address: {
            street_name: shippingInfo.address || 'No especificada',
            zip_code: shippingInfo.zipCode || '15001'
          }
        },
        shipments: {
          cost: orderSummary.shipping,
          mode: 'not_specified'
        },
        back_urls: {
          success: `${window.location.origin}/order-success`,
          failure: `${window.location.origin}/checkout`,
          pending: `${window.location.origin}/order-pending`
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [], 
          installments: 12
        },
        notification_url: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/webhooks/mercadopago`
      };

      console.log('Creando preference con datos:', preferenceData); // Debug

      const response = await axios.post('/payment/create-preference', preferenceData);
      
      console.log('Response completa:', response.data); // Debug
      
      if (response.data && response.data.data && response.data.data.id) {
        setPreferenceId(response.data.data.id);
        console.log('Preference creada exitosamente:', response.data.data.id); // Debug
      } else if (response.data && response.data.id) {
        setPreferenceId(response.data.id);
        console.log('Preference creada exitosamente (formato alternativo):', response.data.id); // Debug
      } else {
        console.error('Response data structure:', response.data);
        throw new Error('No se recibió preference_id válido');
      }
    } catch (err) {
      console.error('Error creating preference:', err);
      console.error('Response data:', err.response?.data); // Debug
      setError(`Error al inicializar el pago: ${err.response?.data?.message || err.message}`);
    } finally {
      setPreferenceLoading(false);
    }
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '');
      if (phoneValue.length <= 9) {
        setShippingInfo(prevState => ({
          ...prevState,
          [name]: phoneValue
        }));
      }
      return;
    }

    setShippingInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    // Reset preference when payment method changes
    if (e.target.value !== 'mercadopago') {
      setPreferenceId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      if (paymentMethod === 'mercadopago') {
        // Crear preference si no existe
        if (!preferenceId) {
          await createMercadoPagoPreference();
          // Si después de crear la preference aún no tenemos ID, mostrar error
          if (!preferenceId) {
            throw new Error('No se pudo generar la preference de pago');
          }
        }

        // Crear orden antes de redirigir
        const orderData = {
          shipping_info: {
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip_code: shippingInfo.zipCode,
            country: shippingInfo.country
          },
          payment_method: 'mercadopago',
          preference_id: preferenceId,
          subtotal: orderSummary.subtotal,
          shipping_cost: orderSummary.shipping,
          total: orderSummary.total,
          status: 'pending'
        };

        console.log('Creando orden:', orderData); // Debug

        await axios.post('/orders', orderData);
        
        // Redirect to MercadoPago
        const mpUrl = `https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=${preferenceId}`;
        console.log('Redirigiendo a:', mpUrl); // Debug
        window.location.href = mpUrl;
        return;
      }

      // Para métodos de pago alternativos
      if (paymentMethod === 'cash' || paymentMethod === 'transfer') {
        const orderData = {
          shipping_info: {
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip_code: shippingInfo.zipCode,
            country: shippingInfo.country
          },
          payment_method: paymentMethod,
          subtotal: orderSummary.subtotal,
          shipping_cost: orderSummary.shipping,
          total: orderSummary.total,
          status: 'pending'
        };

        const response = await axios.post('/orders', orderData);
        
        // El carrito se limpia automáticamente en el backend
        // Solo limpiar el estado local si es necesario
        clearCart();
        navigate(`/order-success/${response.data.order.id}`);
      }
    } catch (err) {
      console.error('Error processing order:', err);
      console.error('Error response:', err.response?.data); // Debug
      setError(err.response?.data?.message || err.message || 'Error al procesar tu pedido. Por favor intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Finalizar Compra</h1>

      {error && (
        <Alert variant="danger" className="mb-4">{error}</Alert>
      )}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row>
          {/* Shipping Information */}
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>Información de Envío</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="firstName">
                      <Form.Label>Nombres</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingInfoChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa tus nombres.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="lastName">
                      <Form.Label>Apellidos</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingInfoChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa tus apellidos.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingInfoChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa un email válido.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="phone">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingInfoChange}
                        placeholder="999999999"
                        pattern='[0-9]{9}'
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa tu número de teléfono.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingInfoChange}
                    placeholder="Av. Ejemplo 123, Distrito"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu dirección.
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3" controlId="city">
                      <Form.Label>Ciudad</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingInfoChange}
                        placeholder="Lima"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa tu ciudad.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3" controlId="state">
                      <Form.Label>Departamento</Form.Label>
                      <Form.Select
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingInfoChange}
                        required
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Lima">Lima</option>
                        <option value="Arequipa">Arequipa</option>
                        <option value="Cusco">Cusco</option>
                        <option value="La Libertad">La Libertad</option>
                        <option value="Piura">Piura</option>
                        <option value="Lambayeque">Lambayeque</option>
                        <option value="Callao">Callao</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Por favor selecciona tu departamento.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="zipCode">
                      <Form.Label>Código Postal</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingInfoChange}
                        placeholder="15001"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa tu código postal.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="country">
                  <Form.Label>País</Form.Label>
                  <Form.Select
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingInfoChange}
                    required
                  >
                    <option value="PE">Perú</option>
                    <option value="CO">Colombia</option>
                    <option value="EC">Ecuador</option>
                    <option value="BO">Bolivia</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Payment Information */}
            <Card className="mb-4">
              <Card.Header>Método de Pago</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    id="mercadopago-payment"
                    label={
                      <div className="d-flex align-items-center">
                        <span className="me-2">MercadoPago</span>
                        <small className="text-muted">(Tarjetas, Yape, Plin, BCP, etc.)</small>
                      </div>
                    }
                    name="paymentMethod"
                    value="mercadopago"
                    checked={paymentMethod === 'mercadopago'}
                    onChange={handlePaymentMethodChange}
                  />
                  
                  {paymentMethod === 'mercadopago' && (
                    <div className="mt-3 p-3 border rounded bg-light">
                      <small className="text-muted">
                        Serás redirigido a MercadoPago para completar tu pago de forma segura.
                        Acepta tarjetas de crédito, débito, Yape, Plin y más métodos de pago.
                      </small>
                      {preferenceLoading && (
                        <div className="mt-2">
                          <small className="text-info">
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Preparando método de pago...
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    id="transfer-payment"
                    label="Transferencia Bancaria"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={handlePaymentMethodChange}
                  />
                  
                  {paymentMethod === 'transfer' && (
                    <div className="mt-3 p-3 border rounded bg-light">
                      <small className="text-muted">
                        Recibirás los datos bancarios por email para realizar la transferencia.
                        Tu pedido se procesará una vez confirmado el pago.
                      </small>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    id="cash-payment"
                    label="Pago Contra Entrega"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={handlePaymentMethodChange}
                  />
                  
                  {paymentMethod === 'cash' && (
                    <div className="mt-3 p-3 border rounded bg-light">
                      <small className="text-muted">
                        Disponible solo en Lima Metropolitana. 
                        Pago en efectivo al momento de la entrega.
                      </small>
                    </div>
                  )}
                </Form.Group>

                {paymentMethod === 'mercadopago' && (
                  <div className="mt-3">
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={createMercadoPagoPreference}
                      disabled={preferenceLoading || !!preferenceId}
                    >
                      {preferenceLoading ? 'Preparando...' : preferenceId ? 'Listo para pagar' : 'Preparar pago'}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>Resumen del Pedido</Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>S/ {orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>
                    {orderSummary.shipping === 0 ? (
                      'Gratis'
                    ) : (
                      `S/ ${orderSummary.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3 fw-bold">
                  <span>Total:</span>
                  <span>S/ {orderSummary.total.toFixed(2)}</span>
                </div>

                {orderSummary.subtotal >= 100 && (
                  <div className="alert alert-success p-2 mb-3">
                    <small>¡Envío gratuito!</small>
                  </div>
                )}

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    type="submit"
                    disabled={processing || (paymentMethod === 'mercadopago' && !preferenceId)}
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : paymentMethod === 'mercadopago' ? (
                      'Pagar con MercadoPago'
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Order Items */}
            <Card>
              <Card.Header>Productos en tu Pedido</Card.Header>
              <Card.Body>
                {items.map(item => (
                  <div key={item.product_id} className="d-flex mb-3">
                    <div className="me-3" style={{ width: '60px', height: '60px' }}>
                      <img 
                        src={getImageUrl(item.image_url)} 
                        alt={item.name} 
                        className="img-fluid rounded"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-0">{item.name}</h6>
                          <small className="text-muted">Cant: {item.quantity}</small>
                        </div>
                        <div className="text-end">
                          <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CheckoutPage;