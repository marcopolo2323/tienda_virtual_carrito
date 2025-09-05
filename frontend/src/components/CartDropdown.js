import React from 'react';
import { Dropdown, Badge, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const CartDropdown = () => {
  const { items, total, itemCount, loading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  // Helper function para normalizar URLs de imágenes de Cloudinary
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    
    // Si ya es una URL completa, usarla tal como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Si parece ser un public_id de Cloudinary, construir la URL
    if (imageUrl.includes('tienda-productos/') || imageUrl.startsWith('product-')) {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      if (cloudName) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_100,h_100,c_fill,f_auto,q_auto/${imageUrl}`;
      }
    }
    
    // Fallback para imágenes locales
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/src/uploads/${imageUrl}`;
  };
  
  // No mostrar el carrito si el usuario no está autenticado
  if (!isAuthenticated) {
    return (
      <Link to="/login" className="btn btn-outline-primary">
        <i className="bi bi-person"></i> Login
      </Link>
    );
  }
  
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="light" id="dropdown-cart" className="position-relative">
        <i className="bi bi-cart"></i>
        {itemCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute top-0 start-100 translate-middle"
          >
            {itemCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-menu-cart" style={{ minWidth: '300px' }}>
        <div className="px-3 py-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Mi Carrito</h6>
            {loading && (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            )}
          </div>
          
          {items.length > 0 ? (
            <>
              <div className="cart-items-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {items.slice(0, 3).map(item => (
                  <div key={item.product?.id || item.id} className="cart-item d-flex align-items-center mb-2">
                    <div className="cart-item-img me-2">
                      <Image 
                        src={getImageUrl(item.product?.image_url)} 
                        alt={item.product?.name || 'Product'} 
                        width={50} 
                        height={50} 
                        className="object-fit-cover rounded"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="cart-item-details flex-grow-1">
                      <div className="cart-item-title small text-truncate fw-medium">
                        {item.product?.name || 'Producto'}
                      </div>
                      <div className="cart-item-price small text-muted">
                        {item.quantity} x ${parseFloat(item.product?.price || 0).toFixed(2)}
                      </div>
                      <div className="cart-item-subtotal small fw-bold">
                        ${(parseFloat(item.product?.price || 0) * parseInt(item.quantity || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {items.length > 3 && (
                  <div className="text-center small text-muted mb-2">
                    +{items.length - 3} más items
                  </div>
                )}
              </div>
              
              <hr className="my-2" />
              
              <div className="d-flex justify-content-between fw-bold mb-3">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="d-grid gap-2">
                <Link to="/cart">
                  <Button variant="outline-primary" className="w-100">
                    Ver Carrito ({itemCount})
                  </Button>
                </Link>
                <Link to="/checkout">
                  <Button variant="primary" className="w-100">
                    Ir al Checkout
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-cart-x text-muted" style={{ fontSize: '2.5rem' }}></i>
              <p className="mt-2 mb-3 text-muted">Tu carrito está vacío</p>
              <Link to="/products">
                <Button variant="outline-primary" size="sm">
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CartDropdown;