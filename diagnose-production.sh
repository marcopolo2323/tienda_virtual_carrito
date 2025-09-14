#!/bin/bash

echo "🔍 Diagnosticando problema del backend en producción..."
echo ""

# Verificar estado del backend
echo "📋 1. Verificando estado del backend de Render..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://tienda-diego-qkm5.onrender.com/ || echo "FAIL")

if [ "$BACKEND_STATUS" = "200" ]; then
  echo "✅ Backend responde correctamente"
elif [ "$BACKEND_STATUS" = "502" ]; then
  echo "❌ Backend devuelve 502 Bad Gateway - Servicio caído"
elif [ "$BACKEND_STATUS" = "FAIL" ]; then
  echo "❌ Backend no responde - Posible problema de red o servicio"
else
  echo "⚠️ Backend devuelve código: $BACKEND_STATUS"
fi

echo ""
echo "📋 2. Verificando endpoints específicos..."

# Probar endpoints uno por uno
endpoints=(
  "/api/health"
  "/api/products"
  "/api/categories"
  "/api/banners/active"
  "/api/seed"
)

for endpoint in "${endpoints[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://tienda-diego-qkm5.onrender.com$endpoint" 2>/dev/null || echo "FAIL")
  if [ "$status" = "200" ]; then
    echo "✅ $endpoint - OK"
  else
    echo "❌ $endpoint - $status"
  fi
done

echo ""
echo "📋 3. Posibles causas del problema 502:"
echo "   🔸 El servicio se está reiniciando (espera 2-3 minutos)"
echo "   🔸 Error en el código que impide que el servidor inicie"
echo "   🔸 Problemas de memoria o recursos en Render"
echo "   🔸 Error en variables de entorno o conexión a BD"
echo "   🔸 Falta hacer deploy de los últimos cambios"
echo ""

echo "📋 4. Soluciones recomendadas:"
echo ""
echo "🚀 A. Hacer deploy de los últimos cambios:"
echo "   git add ."
echo "   git commit -m 'Fix: Axios configuration and production issues'"
echo "   git push origin main"
echo ""
echo "🔄 B. Esperar 2-3 minutos para que Render reinicie el servicio"
echo ""
echo "🔧 C. Si el problema persiste, revisar:"
echo "   - Variables de entorno en Render Dashboard"
echo "   - Logs del servicio en Render Dashboard"
echo "   - Configuración de la base de datos"
echo ""
echo "📊 D. Una vez que el backend esté funcionando, poblar la BD:"
echo "   curl -X GET https://tienda-diego-qkm5.onrender.com/api/seed"
echo ""
echo "🌐 URLs importantes:"
echo "   - Render Dashboard: https://dashboard.render.com/"
echo "   - Backend: https://tienda-diego-qkm5.onrender.com"
echo "   - Frontend: https://tiendadiego.vercel.app"
