#!/bin/bash

echo "🔍 Debugging My Orders page..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de logging para My Orders..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Debug: Agregar logging detallado para My Orders

- Agregar logging en frontend para verificar autenticación
- Agregar logging en backend para verificar consulta de órdenes
- Mostrar user_id, condiciones de búsqueda y resultados
- Facilitar debugging del problema de órdenes no visibles

Esto ayudará a identificar por qué no aparecen las órdenes en My Orders."

  echo "📤 Haciendo push..."
  git push origin main
fi

echo ""
echo "⏳ 2. Esperando que se procesen los deploys..."

# Función para verificar el estado del backend
check_backend() {
  curl -s -o /dev/null -w "%{http_code}" https://tienda-diego-qkm5.onrender.com/api/health 2>/dev/null || echo "FAIL"
}

# Función para verificar el estado del frontend
check_frontend() {
  curl -s -o /dev/null -w "%{http_code}" https://tiendadiego.vercel.app 2>/dev/null || echo "FAIL"
}

# Esperar hasta 3 minutos para que ambos servicios se actualicen
max_attempts=18  # 18 * 10 segundos = 3 minutos
attempt=1

while [ $attempt -le $max_attempts ]; do
  backend_status=$(check_backend)
  frontend_status=$(check_frontend)
  
  if [ "$backend_status" = "200" ] && [ "$frontend_status" = "200" ]; then
    echo "✅ Backend y Frontend actualizados correctamente!"
    break
  else
    echo "⏳ Intento $attempt/$max_attempts - Backend: $backend_status, Frontend: $frontend_status"
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo "⚠️ Los deploys están tomando más tiempo del esperado"
    echo "   Backend: https://dashboard.render.com/"
    echo "   Frontend: https://vercel.com/dashboard"
  fi
  
  sleep 10
  ((attempt++))
done

echo ""
echo "🧪 3. Verificando endpoints..."

# Verificar que el endpoint de órdenes responda
orders_status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" https://tienda-diego-qkm5.onrender.com/api/orders/my-orders 2>/dev/null || echo "FAIL")

if [ "$orders_status" = "401" ] || [ "$orders_status" = "200" ]; then
  echo "✅ Endpoint de órdenes funcionando"
else
  echo "⚠️ Endpoint de órdenes: $orders_status"
fi

echo ""
echo "🔍 Debugging de My Orders completado!"
echo ""
echo "🔧 Logging agregado:"
echo "   ✅ Frontend: Verificación de autenticación y respuesta"
echo "   ✅ Backend: Verificación de user_id y consulta de órdenes"
echo "   ✅ Mostrar condiciones de búsqueda y resultados"
echo "   ✅ Facilitar debugging del problema"
echo ""
echo "🧪 Para probar y debuggear:"
echo "   1. Ve a 'My Orders' en la aplicación"
echo "   2. Abre la consola del navegador (F12)"
echo "   3. Revisa los logs del frontend:"
echo "      - '=== FETCHING ORDERS ==='"
echo "      - 'isAuthenticated: true/false'"
echo "      - 'currentUser: {...}'"
echo "      - 'user_id from token: X'"
echo "      - '=== ORDERS RESPONSE ==='"
echo "      - 'Orders count: X'"
echo "   4. Revisa los logs de Render para ver:"
echo "      - '=== GET USER ORDERS ==='"
echo "      - 'User ID: X'"
echo "      - '=== ORDERS FOUND ==='"
echo "      - 'Total count: X'"
echo "      - 'Orders found: X'"
echo ""
echo "📋 Posibles problemas a verificar:"
echo "   - ¿El user_id coincide entre frontend y backend?"
echo "   - ¿La consulta de órdenes encuentra resultados?"
echo "   - ¿Hay algún problema de autenticación?"
echo "   - ¿Las órdenes se están creando con el user_id correcto?"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Prueba acceder a My Orders"
echo "   2. Revisa los logs en consola y Render"
echo "   3. Identifica exactamente dónde está el problema"
echo "   4. Reporta los logs específicos para la siguiente corrección"
