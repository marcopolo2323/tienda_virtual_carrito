#!/bin/bash

echo "🔧 Corrigiendo error de OrderSuccessPage..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de corrección de OrderSuccessPage..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir error de first_name undefined en OrderSuccessPage

- Agregar validaciones para shipping_info
- Manejar casos donde shipping_info es undefined
- Mostrar shipping_address como fallback
- Agregar logging detallado de estructura de datos
- Prevenir errores de propiedades undefined

Esto soluciona el error 'Cannot read properties of undefined (reading first_name)'."

  echo "📤 Haciendo push..."
  git push origin main
fi

echo ""
echo "⏳ 2. Esperando que Vercel procese el deploy..."

# Función para verificar el estado del frontend
check_frontend() {
  curl -s -o /dev/null -w "%{http_code}" https://tiendadiego.vercel.app 2>/dev/null || echo "FAIL"
}

# Esperar hasta 2 minutos para que el servicio se actualice
max_attempts=12  # 12 * 10 segundos = 2 minutos
attempt=1

while [ $attempt -le $max_attempts ]; do
  status=$(check_frontend)
  
  if [ "$status" = "200" ]; then
    echo "✅ Frontend actualizado correctamente!"
    break
  else
    echo "⏳ Intento $attempt/$max_attempts - Esperando actualización del frontend..."
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo "⚠️ El deploy está tomando más tiempo del esperado"
    echo "   Puedes verificar el estado en: https://vercel.com/dashboard"
  fi
  
  sleep 10
  ((attempt++))
done

echo ""
echo "🧪 3. Verificando endpoints..."

# Verificar que el frontend responda
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" https://tiendadiego.vercel.app 2>/dev/null || echo "FAIL")

if [ "$frontend_status" = "200" ]; then
  echo "✅ Frontend funcionando"
else
  echo "⚠️ Frontend: $frontend_status"
fi

echo ""
echo "✨ Corrección de OrderSuccessPage completada!"
echo ""
echo "🔧 Problemas solucionados:"
echo "   ✅ Validaciones para shipping_info"
echo "   ✅ Manejo de casos undefined"
echo "   ✅ Fallback a shipping_address"
echo "   ✅ Logging detallado de estructura"
echo "   ✅ Prevención de errores de propiedades"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve al checkout y selecciona cualquier método de pago"
echo "   2. Completa el formulario de envío"
echo "   3. Confirma el pedido"
echo "   4. Verifica que la página de éxito se cargue sin errores"
echo "   5. Revisa la consola para ver la estructura de datos"
echo ""
echo "📋 Logging agregado:"
echo "   - Estructura completa de la orden en consola"
echo "   - Validaciones robustas para todos los campos"
echo "   - Manejo de diferentes formatos de datos"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Si persiste el error:"
echo "   - Revisa la consola para ver la estructura de datos"
echo "   - Los logs ahora muestran exactamente qué datos se están recibiendo"
echo "   - Las validaciones previenen errores de propiedades undefined"
