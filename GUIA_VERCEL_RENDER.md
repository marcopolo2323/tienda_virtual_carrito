# 🚀 Guía de Deployment - Vercel + Render

Esta guía está específicamente diseñada para tu setup actual con **Vercel** (frontend) y **Render** (backend).

## 📋 Configuración Actual

### ✅ Lo que ya tienes funcionando
- **Frontend**: React desplegado en Vercel
- **Backend**: Node.js/Express desplegado en Render
- **Base de datos**: PostgreSQL en Render

### 🎯 Optimizaciones específicas para tu setup

## 🔧 Configuración del Frontend (Vercel)

### 1. Variables de Entorno en Vercel
Ve a tu dashboard de Vercel y configura estas variables:

```env
REACT_APP_API_BASE_URL=https://tu-backend-en-render.onrender.com/api
REACT_APP_NAME=Tienda Virtual
REACT_APP_VERSION=1.0.0
```

### 2. Configuración de Build
El archivo `vercel.json` ya está configurado con:
- ✅ Headers de seguridad
- ✅ Caché optimizado para archivos estáticos
- ✅ Redirección SPA para React Router
- ✅ Compresión automática

### 3. Dominio Personalizado (Opcional)
Si tienes un dominio personalizado:
1. Ve a Settings → Domains en Vercel
2. Agrega tu dominio
3. Configura los DNS según las instrucciones

## 🔧 Configuración del Backend (Render)

### 1. Variables de Entorno en Render
Ve a tu servicio en Render y configura estas variables:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo
CORS_ORIGIN=https://tu-frontend-en-vercel.vercel.app
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token
```

### 2. Configuración de Base de Datos
- ✅ PostgreSQL ya configurada en Render
- ✅ Variables de conexión automáticas
- ✅ SSL habilitado por defecto

### 3. Health Check
El endpoint `/api/health` ya está configurado para el health check de Render.

## 🚀 Proceso de Deployment

### Opción 1: Automático (Recomendado)
```bash
# Ejecutar script de deployment
./scripts/deploy-vercel-render.sh
```

### Opción 2: Manual

#### Frontend (Vercel)
```bash
cd frontend
npm install
npm run build
vercel --prod
```

#### Backend (Render)
```bash
cd backend
npm install --production
# Push a tu repositorio (Render se actualiza automáticamente)
git add .
git commit -m "Deploy to production"
git push origin main
```

## 🔒 Seguridad Específica para tu Setup

### CORS Configuration
Asegúrate de que `CORS_ORIGIN` en Render apunte exactamente a tu URL de Vercel:
```env
CORS_ORIGIN=https://tu-app.vercel.app
```

### Headers de Seguridad
- ✅ Vercel maneja automáticamente HTTPS
- ✅ Headers de seguridad configurados en `vercel.json`
- ✅ Render maneja HTTPS automáticamente

### Variables Sensibles
- ✅ Nunca commitees archivos `.env` al repositorio
- ✅ Usa las variables de entorno de Vercel y Render
- ✅ Rotar `JWT_SECRET` regularmente

## 📊 Monitoreo y Logs

### Vercel
- **Logs**: Dashboard de Vercel → Functions → Logs
- **Analytics**: Dashboard de Vercel → Analytics
- **Performance**: Dashboard de Vercel → Speed Insights

### Render
- **Logs**: Dashboard de Render → Tu servicio → Logs
- **Métricas**: Dashboard de Render → Tu servicio → Metrics
- **Health Check**: Automático cada 30 segundos

## 🔄 Actualizaciones

### Frontend (Vercel)
```bash
cd frontend
# Hacer cambios
git add .
git commit -m "Update frontend"
git push origin main
# Vercel se actualiza automáticamente
```

### Backend (Render)
```bash
cd backend
# Hacer cambios
git add .
git commit -m "Update backend"
git push origin main
# Render se actualiza automáticamente
```

## 🧪 Testing en Producción

### Health Checks
- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-backend.onrender.com/api/health`

### Pruebas Funcionales
1. ✅ Registro de usuario
2. ✅ Login de usuario
3. ✅ Navegación de productos
4. ✅ Carrito de compras
5. ✅ Proceso de checkout
6. ✅ Pagos
7. ✅ Panel de administración

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de CORS
- Verificar que `CORS_ORIGIN` en Render sea exactamente la URL de Vercel
- Incluir protocolo `https://` en la URL

#### 2. Error de Conexión a Base de Datos
- Verificar variables de entorno en Render
- Verificar que la base de datos esté activa

#### 3. Error de Build en Vercel
- Verificar que `REACT_APP_API_BASE_URL` esté configurado
- Revisar logs de build en Vercel

#### 4. Error de Build en Render
- Verificar que todas las dependencias estén en `package.json`
- Revisar logs de build en Render

### Comandos de Debug
```bash
# Ver logs de Vercel
vercel logs

# Ver logs de Render
# (Desde el dashboard de Render)

# Verificar variables de entorno
vercel env ls
```

## 📈 Optimizaciones Específicas

### Vercel
- ✅ Build automático optimizado
- ✅ CDN global
- ✅ Compresión automática
- ✅ Caché inteligente

### Render
- ✅ Auto-scaling
- ✅ Health checks automáticos
- ✅ Logs centralizados
- ✅ Métricas en tiempo real

## 🔄 Backup y Recuperación

### Base de Datos
Render maneja automáticamente:
- ✅ Backups automáticos
- ✅ Punto de restauración
- ✅ Replicación de datos

### Código
- ✅ Git como backup del código
- ✅ Vercel y Render mantienen versiones
- ✅ Rollback automático disponible

## 📞 Soporte

### Vercel
- Documentación: https://vercel.com/docs
- Soporte: https://vercel.com/support

### Render
- Documentación: https://render.com/docs
- Soporte: https://render.com/support

---

## 🎉 ¡Tu setup está optimizado!

Con esta configuración, tu aplicación tiene:
- ✅ Deployment automático
- ✅ Escalado automático
- ✅ Monitoreo integrado
- ✅ Seguridad robusta
- ✅ Alto rendimiento
- ✅ Cero mantenimiento de infraestructura

**¡Tu tienda virtual está lista para recibir clientes! 🛒✨**
