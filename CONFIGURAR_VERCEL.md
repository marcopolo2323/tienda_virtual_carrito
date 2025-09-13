# 🔧 Configuración de Variables de Entorno en Vercel

## 🚨 Problema Actual

El frontend está haciendo peticiones a URLs incorrectas porque las variables de entorno no están configuradas en Vercel.

**Errores que ves:**
- `tienda-diego-qkm5.onrender.com/products/featured` (sin `/api/`)
- `tienda-diego-qkm5.onrender.com/categories` (sin `/api/`)
- `tienda-diego-qkm5.onrender.com/banners/active` (sin `/api/`)

## ✅ Solución

### 1. Configurar Variables de Entorno en Vercel

1. **Ve a tu dashboard de Vercel:**
   - https://vercel.com/dashboard

2. **Selecciona tu proyecto de la tienda virtual**

3. **Ve a Settings → Environment Variables**

4. **Agrega estas variables:**

   | Variable | Valor | Entorno |
   |----------|-------|---------|
   | `REACT_APP_API_BASE_URL` | `https://tienda-diego-qkm5.onrender.com` | Production, Preview, Development |
   | `REACT_APP_NAME` | `Tienda Virtual` | Production, Preview, Development |
   | `REACT_APP_VERSION` | `1.0.0` | Production, Preview, Development |

### 2. Hacer un Nuevo Deployment

Después de configurar las variables:

1. **Opción A: Deploy automático**
   ```bash
   git add .
   git commit -m "Fix API URLs configuration"
   git push origin main
   ```

2. **Opción B: Deploy manual**
   ```bash
   cd frontend
   vercel --prod
   ```

### 3. Verificar la Configuración

Después del deployment, verifica que:

1. **Las variables estén configuradas:**
   ```bash
   ./scripts/check-vercel-config.sh
   ```

2. **El frontend haga las peticiones correctas:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña Network
   - Recarga la página
   - Verifica que las peticiones vayan a URLs con `/api/`

## 🔍 Debug

### Verificar en el Navegador

1. Abre las herramientas de desarrollador (F12)
2. Ve a la consola
3. Deberías ver estos logs:
   ```
   🔧 Axios baseURL configurada: https://tienda-diego-qkm5.onrender.com/api
   🔧 NODE_ENV: production
   🔧 REACT_APP_API_BASE_URL: https://tienda-diego-qkm5.onrender.com
   ```

### Si no ves los logs correctos:

1. **Verifica que las variables estén configuradas en Vercel**
2. **Haz un nuevo deployment**
3. **Limpia la caché del navegador**

## 📋 Checklist

- [ ] Variables de entorno configuradas en Vercel
- [ ] Nuevo deployment realizado
- [ ] URLs de API incluyen `/api/`
- [ ] No hay errores 404 en la consola
- [ ] Categorías se cargan correctamente
- [ ] Banners se muestran
- [ ] Productos destacados se cargan

## 🆘 Si el Problema Persiste

1. **Verifica que el backend esté funcionando:**
   ```bash
   curl https://tienda-diego-qkm5.onrender.com/api/health
   ```

2. **Verifica las variables de entorno:**
   ```bash
   ./scripts/check-vercel-config.sh
   ```

3. **Revisa los logs de Vercel:**
   - Ve a tu proyecto en Vercel
   - Click en el deployment más reciente
   - Revisa los logs de build y runtime

## 🎯 Resultado Esperado

Después de configurar correctamente:

- ✅ Las peticiones van a `https://tienda-diego-qkm5.onrender.com/api/categories`
- ✅ Las peticiones van a `https://tienda-diego-qkm5.onrender.com/api/banners/active`
- ✅ Las peticiones van a `https://tienda-diego-qkm5.onrender.com/api/products/featured`
- ✅ No hay errores 404
- ✅ La aplicación funciona correctamente

---

**¡Configura las variables de entorno en Vercel y haz un nuevo deployment!** 🚀
