import axios from 'axios';
import { toast } from 'react-toastify';

// Configurar la URL base de la API
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Interceptor para agregar el token a las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Ha ocurrido un error';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default axios;