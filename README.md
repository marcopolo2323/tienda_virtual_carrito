# 🛒 Tienda Virtual - E-commerce Full Stack

Una aplicación de e-commerce completa construida con React, Node.js, Express y PostgreSQL, desplegada en Vercel y Render.

## 🚀 Características

### Frontend (React)
- ✅ Interfaz moderna y responsive
- ✅ Carrito de compras funcional
- ✅ Sistema de autenticación
- ✅ Panel de administración
- ✅ Gestión de productos y categorías
- ✅ Sistema de banners
- ✅ Proceso de checkout completo

### Backend (Node.js/Express)
- ✅ API RESTful completa
- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL
- ✅ Integración con Cloudinary
- ✅ Pagos con MercadoPago
- ✅ Middleware de seguridad
- ✅ Rate limiting
- ✅ Logging estructurado

## 🏗️ Arquitectura

```
Frontend (Vercel)     Backend (Render)      Database (Render)
     ↓                      ↓                      ↓
  React App          Node.js/Express         PostgreSQL
  - UI/UX            - API REST              - Users
  - State Management - Authentication        - Products
  - Routing          - File Upload           - Orders
  - Components       - Payment Processing    - Categories
```

## 🛠️ Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **React Router** - Enrutamiento
- **Zustand** - Gestión de estado
- **Bootstrap** - Framework CSS
- **Axios** - Cliente HTTP
- **React Toastify** - Notificaciones

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación
- **Cloudinary** - Gestión de imágenes
- **MercadoPago** - Procesamiento de pagos
- **Helmet** - Seguridad
- **Morgan** - Logging

### Base de Datos
- **PostgreSQL** - Base de datos relacional

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Git** - Control de versiones

## 🚀 Deployment

### Configuración Rápida

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd tienda_virtual_carrito
```

2. **Configurar variables de entorno**

**Frontend (Vercel):**
```env
REACT_APP_API_BASE_URL=https://tu-backend-en-render.onrender.com/api
REACT_APP_NAME=Tienda Virtual
```

**Backend (Render):**
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=tu_jwt_secret_muy_seguro
CORS_ORIGIN=https://tu-frontend-en-vercel.vercel.app
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token
```

3. **Deploy automático**
```bash
./scripts/deploy-vercel-render.sh
```

### URLs de Acceso
- **Frontend**: https://tu-app.vercel.app
- **Backend API**: https://tu-backend.onrender.com
- **Health Check**: https://tu-backend.onrender.com/api/health

## 🧪 Desarrollo Local

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- Git

### Instalación

1. **Backend**
```bash
cd backend
npm install
cp env.example .env
# Configurar variables en .env
npm run dev
```

2. **Frontend**
```bash
cd frontend
npm install
cp env.example .env.local
# Configurar variables en .env.local
npm start
```

### Scripts Disponibles

**Backend:**
```bash
npm run dev          # Desarrollo
npm start            # Producción
npm run seed         # Poblar base de datos
npm run health       # Health check
```

**Frontend:**
```bash
npm start            # Desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
```

## 📊 Base de Datos

### Seeding
```bash
# Desarrollo
npm run seed

# Producción
npm run seed:prod
```

### Datos de Ejemplo
- **Usuario admin**: admin@gmail.com / admin123
- **Categorías**: 5 categorías de ejemplo
- **Productos**: 8 productos de ejemplo
- **Banners**: 3 banners de ejemplo

## 🔒 Seguridad

### Implementado
- ✅ Headers de seguridad (Helmet)
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Protección contra XSS
- ✅ Protección contra SQL injection
- ✅ Validación de archivos
- ✅ Sanitización de entrada
- ✅ HTTPS automático

### Variables Sensibles
- `JWT_SECRET` - Debe ser único y seguro
- `CLOUDINARY_API_SECRET` - Mantener privado
- `MERCADOPAGO_ACCESS_TOKEN` - Token de producción

## 📈 Monitoreo

### Vercel
- Dashboard: https://vercel.com/dashboard
- Logs: Functions → Logs
- Analytics: Speed Insights

### Render
- Dashboard: https://dashboard.render.com
- Logs: Tu servicio → Logs
- Métricas: Tu servicio → Metrics

## 🔄 Actualizaciones

### Frontend
```bash
# Hacer cambios
git add .
git commit -m "Update frontend"
git push origin main
# Vercel se actualiza automáticamente
```

### Backend
```bash
# Hacer cambios
git add .
git commit -m "Update backend"
git push origin main
# Render se actualiza automáticamente
```

## 🧪 Testing

### Health Checks
- Frontend: https://tu-app.vercel.app
- Backend: https://tu-backend.onrender.com/api/health

### Pruebas Funcionales
1. ✅ Registro de usuario
2. ✅ Login de usuario
3. ✅ Navegación de productos
4. ✅ Carrito de compras
5. ✅ Proceso de checkout
6. ✅ Pagos
7. ✅ Panel de administración

## 📁 Estructura del Proyecto

```
tienda_virtual_carrito/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── models/         # Modelos de base de datos
│   │   ├── routes/         # Rutas de la API
│   │   ├── middlewares/    # Middlewares
│   │   ├── utils/          # Utilidades
│   │   └── index.js        # Punto de entrada
│   ├── scripts/            # Scripts de utilidad
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── store/         # Estado global
│   │   └── utils/         # Utilidades
│   └── package.json
├── scripts/               # Scripts de deployment
├── vercel.json           # Configuración de Vercel
├── render.yaml           # Configuración de Render
└── README.md
```

## 🆘 Soporte

### Documentación
- [Guía de Vercel + Render](GUIA_VERCEL_RENDER.md)
- [Resumen de configuración](RESUMEN_VERCEL_RENDER.md)

### Troubleshooting
1. Revisar logs en Vercel/Render
2. Verificar variables de entorno
3. Comprobar health checks
4. Consultar documentación

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---

## 🎉 ¡Tu tienda virtual está lista!

Con esta configuración, tienes una aplicación de e-commerce completa, segura y escalable desplegada en la nube.

**¡Es hora de lanzar tu tienda al mundo! 🚀🛒**
