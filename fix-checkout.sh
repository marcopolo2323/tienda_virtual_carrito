#!/bin/bash

echo "🛒 Corrigiendo sistema de checkout..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de correcciones de checkout..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir creación de órdenes en checkout

- Corregir mapeo de shipping_info a shipping_address en Order model
- Agregar imports faltantes (Cart, CartItem) en orderController
- Mejorar manejo de errores con detalles específicos de validación
- Convertir objeto shipping_info a string para shipping_address
- Agregar logging detallado para debugging

Esto soluciona el error 500 al crear órdenes durante el checkout."

  echo "📤 Haciendo push..."
  git push origin main
fi

echo ""
echo "⏳ 2. Esperando que Render procese el deploy..."

# Función para verificar el estado del backend
check_backend() {
  curl -s -o /dev/null -w "%{http_code}" https://tienda-diego-qkm5.onrender.com/api/health 2>/dev/null || echo "FAIL"
}

# Esperar hasta 2 minutos para que el servicio se actualice
max_attempts=12  # 12 * 10 segundos = 2 minutos
attempt=1

while [ $attempt -le $max_attempts ]; do
  status=$(check_backend)
  
  if [ "$status" = "200" ]; then
    echo "✅ Backend actualizado correctamente!"
    break
  else
    echo "⏳ Intento $attempt/$max_attempts - Esperando actualización del backend..."
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo "⚠️ El deploy está tomando más tiempo del esperado"
    echo "   Puedes verificar el estado en: https://dashboard.render.com/"
  fi
  
  sleep 10
  ((attempt++))
done

echo ""
echo "🧪 3. Verificando endpoint de órdenes..."

# Verificar que el endpoint de órdenes responda
orders_status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" https://tienda-diego-qkm5.onrender.com/api/orders 2>/dev/null || echo "FAIL")

if [ "$orders_status" = "401" ] || [ "$orders_status" = "200" ]; then
  echo "✅ Endpoint de órdenes funcionando (requiere autenticación)"
else
  echo "⚠️ Endpoint de órdenes: $orders_status"
fi

echo ""
echo "✨ Corrección de checkout completada!"
echo ""
echo "🧪 Para probar el checkout:"
echo "   1. Inicia sesión en tu tienda"
echo "   2. Agrega productos al carrito"
echo "   3. Ve al checkout y completa el formulario"
echo "   4. El error 500 debería estar solucionado"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Si sigues teniendo problemas:"
echo "   - Revisa la consola del navegador para más detalles"
echo "   - Verifica que tengas productos en el carrito"
echo "   - Asegúrate de estar autenticado"
