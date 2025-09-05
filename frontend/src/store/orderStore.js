import { create } from 'zustand';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import useCartStore from './cartStore';

const useOrderStore = create((set) => ({
  // Estado
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  
  // Acciones
  createOrder: async (orderData) => {
    set({ loading: true });
    try {
      const response = await axios.post('/orders', orderData);
      toast.success('Order placed successfully!');
      // Llamar a clearCart del cartStore
      useCartStore.getState().clearCart();
      set({
        loading: false,
        currentOrder: response.data,
        error: null
      });
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to place order'
      });
      throw err;
    }
  },
  
  fetchOrders: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/orders');
      set({
        loading: false,
        orders: response.data,
        error: null
      });
      return response.data;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to fetch orders'
      });
      throw err;
    }
  },
  
  fetchOrderById: async (orderId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/orders/${orderId}`);
      set({
        loading: false,
        currentOrder: response.data,
        error: null
      });
      return response.data;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to fetch order'
      });
      throw err;
    }
  },
  
  clearOrderError: () => set({ error: null }),
  
  clearCurrentOrder: () => set({ currentOrder: null }),
}));

export default useOrderStore;