import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import useAuthStore from '../store/authStore';
import useCategoryStore from '../store/categoryStore';
import useProductStore from '../store/productStore';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { error: authError } = useAuthStore();
  const { error: categoryError } = useCategoryStore();
  const { error: productError } = useProductStore();

  // Detectar cambios en el estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(false);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detectar errores de conexión
  useEffect(() => {
    const hasConnectionError = 
      authError?.includes('conectar al servidor') ||
      categoryError?.includes('conectar al servidor') ||
      productError?.includes('conectar al servidor');

    if (hasConnectionError && isOnline) {
      setShowAlert(true);
      setRetryCount(prev => prev + 1);
    }
  }, [authError, categoryError, productError, isOnline]);

  const handleRetry = () => {
    setShowAlert(false);
    setRetryCount(0);
    // Recargar la página para reintentar todas las conexiones
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowAlert(false);
  };

  if (!showAlert) return null;

  return (
    <Alert 
      variant={isOnline ? "warning" : "danger"} 
      className="mb-0 rounded-0"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 9999,
        borderRadius: 0
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className={`bi ${isOnline ? 'bi-wifi-off' : 'bi-wifi'} me-2`}></i>
          <div>
            <strong>
              {isOnline ? 'Problema de Conexión' : 'Sin Conexión a Internet'}
            </strong>
            <div className="small">
              {isOnline 
                ? 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en el puerto 5000.'
                : 'Verifica tu conexión a internet e intenta nuevamente.'
              }
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          {isOnline && (
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={handleRetry}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Reintentar
            </Button>
          )}
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={handleDismiss}
          >
            <i className="bi bi-x"></i>
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default ConnectionStatus;
