import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/stripe-js';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CheckoutForm = ({ cartTotal }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    try {
      setLoading(true);
      
      // Crear intento de pago en el backend
      const { data: { clientSecret } } = await axios.post('/create-payment-intent', {
        amount: cartTotal * 100 // Stripe usa centavos
      });

      // Confirmar el pago con Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('¡Pago realizado con éxito!');
        // Aquí puedes limpiar el carrito y redirigir a una página de confirmación
        navigate('/payment-success');
      }
    } catch (err) {
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group mb-4">
        <label className="mb-2">Información de la tarjeta</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={!stripe || loading}
      >
        {loading ? 'Procesando...' : `Pagar ${cartTotal.toFixed(2)} €`}
      </button>
    </form>
  );
};

export default CheckoutForm;