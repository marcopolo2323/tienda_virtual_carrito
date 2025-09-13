import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';

const MinimalistButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-outline-primary';
      case 'ghost':
        return 'btn-ghost';
      case 'danger':
        return 'btn-danger';
      case 'success':
        return 'btn-success';
      default:
        return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      default:
        return '';
    }
  };

  return (
    <BootstrapButton
      variant={variant}
      size={size}
      className={`${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    >
      {children}
    </BootstrapButton>
  );
};

export default MinimalistButton;
