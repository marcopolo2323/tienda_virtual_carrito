import React, { useState } from 'react';
import { Card, Button, Alert, Modal, Row, Col } from 'react-bootstrap';
import { QrCode, Download, CheckCircle } from 'lucide-react';

const YapePayment = ({ orderData, onPaymentComplete }) => {
  const [showQR, setShowQR] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

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
      
      // Notificar al componente padre
      if (onPaymentComplete) {
        onPaymentComplete({
          method: 'yape',
          reference: yapeData.reference,
          amount: yapeData.amount
        });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Generar y descargar boleta PDF
    const receiptData = {
      orderId: orderData?.id,
      reference: yapeData.reference,
      amount: yapeData.amount,
      method: 'Yape',
      date: new Date().toLocaleString('es-PE')
    };
    
    // Aquí se generaría el PDF real
    console.log('Generating receipt:', receiptData);
    alert('Boleta PDF generada (funcionalidad en desarrollo)');
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

      {/* Botón de descarga de boleta */}
      {paymentConfirmed && (
        <div className="text-center mt-3">
          <Button 
            variant="outline-primary" 
            onClick={handleDownloadReceipt}
            className="me-2"
          >
            <Download className="me-2" />
            Descargar Boleta PDF
          </Button>
        </div>
      )}
    </>
  );
};

export default YapePayment;
