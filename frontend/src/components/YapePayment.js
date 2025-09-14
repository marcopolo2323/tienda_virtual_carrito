import React, { useState } from 'react';
import { Card, Button, Alert, Modal, Row, Col, Form } from 'react-bootstrap';
import { QrCode, Download, CheckCircle, Camera, MessageCircle } from 'lucide-react';

const YapePayment = ({ orderData, onPaymentComplete }) => {
  const [showQR, setShowQR] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [whatsappSent, setWhatsappSent] = useState(false);

  // Datos del Yape (en producción esto vendría del backend)
  const yapeData = {
    qrCode: '/images/yape-qr.png', // Imagen del QR de Yape
    phone: '+51 987 654 321', // Número de Yape
    amount: orderData?.total || 0,
    reference: `ORD-${Date.now()}`
  };

  const handlePayWithYape = () => {
    setShowQR(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    
    try {
      // Simular confirmación de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentConfirmed(true);
      setLoading(false);
      setShowPaymentProof(true);
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      setLoading(false);
    }
  };

  const handlePaymentProofUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPaymentProof(file);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!paymentProof) {
      alert('Por favor, selecciona una imagen de la captura de pago');
      return;
    }

    const whatsappNumber = '51934819598';
    const message = `Hola! Realicé un pago con Yape para la orden ${yapeData.reference} por S/ ${yapeData.amount.toFixed(2)}. Adjunto la captura de pantalla.`;
    
    // Crear URL de WhatsApp con mensaje
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    setWhatsappSent(true);
  };

  const handleCompletePayment = async () => {
    if (!whatsappSent) {
      alert('Por favor, envía la captura por WhatsApp antes de continuar');
      return;
    }

    try {
      // Notificar al componente padre
      if (onPaymentComplete) {
        onPaymentComplete({
          method: 'yape',
          reference: yapeData.reference,
          amount: yapeData.amount,
          payment_proof: paymentProof
        });
      }
    } catch (error) {
      console.error('Error completing payment:', error);
    }
  };

  const handleDownloadReceipt = () => {
    // Generar y descargar boleta PDF
    const receiptData = {
      orderId: orderData?.id,
      reference: yapeData.reference,
      amount: yapeData.amount,
      method: 'Yape',
      date: new Date().toLocaleString('es-PE'),
      items: orderData?.items || [],
      subtotal: orderData?.subtotal || 0,
      shipping: orderData?.shipping || 0,
      total: orderData?.total || 0
    };
    
    // Crear contenido HTML para la boleta
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Boleta de Pago - ${receiptData.reference}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .details { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 18px; border-top: 1px solid #333; padding-top: 10px; }
          .method { background: #e8f5e8; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BOLETA DE PAGO</h1>
          <p>Referencia: ${receiptData.reference}</p>
          <p>Fecha: ${receiptData.date}</p>
        </div>
        
        <div class="details">
          <h3>Detalles del Pago</h3>
          <div class="method">
            <strong>Método de Pago:</strong> ${receiptData.method}<br>
            <strong>Referencia:</strong> ${receiptData.reference}<br>
            <strong>Monto:</strong> S/ ${receiptData.amount.toFixed(2)}
          </div>
          
          <h3>Resumen de la Orden</h3>
          <div class="item">
            <span>Subtotal:</span>
            <span>S/ ${receiptData.subtotal.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Envío:</span>
            <span>S/ ${receiptData.shipping.toFixed(2)}</span>
          </div>
          <div class="item total">
            <span>Total:</span>
            <span>S/ ${receiptData.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="details">
          <p><strong>Estado:</strong> Pago pendiente de validación</p>
          <p><strong>Nota:</strong> Envía la captura de pantalla del pago por WhatsApp para validar tu orden.</p>
        </div>
      </body>
      </html>
    `;
    
    // Crear blob y descargar
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boleta-${receiptData.reference}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0">
            <QrCode className="me-2" />
            Pago con Yape
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center mb-3">
            <img 
              src="/images/yape-logo.png" 
              alt="Yape" 
              style={{ height: '60px' }}
              className="mb-3"
            />
            <p className="text-muted">
              Paga de forma rápida y segura con Yape
            </p>
          </div>
          
          <div className="d-grid">
            <Button 
              variant="success" 
              size="lg"
              onClick={handlePayWithYape}
              disabled={paymentConfirmed}
            >
              {paymentConfirmed ? (
                <>
                  <CheckCircle className="me-2" />
                  Pago Confirmado
                </>
              ) : (
                'Pagar con Yape'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Modal con QR */}
      <Modal show={showQR} onHide={() => setShowQR(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <QrCode className="me-2" />
            Pago con Yape
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6} className="text-center">
              <h5 className="mb-3">Escanea el código QR</h5>
              <div className="border rounded p-3 mb-3">
                <img 
                  src={yapeData.qrCode} 
                  alt="QR Code Yape" 
                  style={{ width: '200px', height: '200px' }}
                  className="img-fluid"
                />
              </div>
              <p className="text-muted small">
                Abre Yape y escanea este código
              </p>
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Detalles del pago</h5>
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Monto:</span>
                  <strong>S/ {yapeData.amount.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Referencia:</span>
                  <span className="text-muted">{yapeData.reference}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Teléfono:</span>
                  <span className="text-muted">{yapeData.phone}</span>
                </div>
              </div>
              
              <Alert variant="info" className="small">
                <strong>Instrucciones:</strong>
                <ol className="mb-0 mt-2">
                  <li>Abre la app de Yape</li>
                  <li>Selecciona "Escanear QR"</li>
                  <li>Apunta la cámara al código</li>
                  <li>Confirma el pago</li>
                  <li>Regresa aquí y confirma</li>
                </ol>
              </Alert>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQR(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleConfirmPayment}
            disabled={loading || paymentConfirmed}
          >
            {loading ? 'Confirmando...' : 'Confirmar Pago'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para captura de pago */}
      <Modal show={showPaymentProof} onHide={() => setShowPaymentProof(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Camera className="me-2" />
            Validar Pago con Yape
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Instrucciones:</strong>
            <ol className="mb-0 mt-2">
              <li>Realiza el pago con Yape usando el QR</li>
              <li>Toma una captura de pantalla del comprobante</li>
              <li>Sube la imagen aquí</li>
              <li>Envía la captura por WhatsApp para validación</li>
            </ol>
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label>Captura de Pantalla del Pago</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handlePaymentProofUpload}
              placeholder="Selecciona la captura de pantalla"
            />
            {paymentProof && (
              <div className="mt-2">
                <small className="text-success">
                  ✓ Archivo seleccionado: {paymentProof.name}
                </small>
              </div>
            )}
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button 
              variant="success" 
              onClick={handleSendToWhatsApp}
              disabled={!paymentProof}
            >
              <MessageCircle className="me-2" />
              Enviar por WhatsApp
            </Button>
            
            {whatsappSent && (
              <Button 
                variant="primary" 
                onClick={handleCompletePayment}
              >
                <CheckCircle className="me-2" />
                Completar Pago
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Botón de descarga de boleta */}
      {paymentConfirmed && (
        <div className="text-center mt-3">
          <Button 
            variant="outline-primary" 
            onClick={handleDownloadReceipt}
            className="me-2"
          >
            <Download className="me-2" />
            Descargar Boleta
          </Button>
        </div>
      )}
    </>
  );
};

export default YapePayment;
