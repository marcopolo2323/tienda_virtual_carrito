/**
 * Aplicación Express simplificada para depuración
 */

// Dependencias principales
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicialización de la aplicación
const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal - información de la API
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Tienda funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});