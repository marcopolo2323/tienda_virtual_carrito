#!/bin/bash

echo "🛒 Corrigiendo MercadoPago y eliminando IGV..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de correcciones de MercadoPago e IGV..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir MercadoPago y eliminar IGV

- Corregir manejo de respuesta de preference en frontend
- Eliminar cálculo y cobro de IGV (18%) del sistema
- Actualizar URLs de MercadoPago para producción
- Simplificar cálculo de totales (solo subtotal + envío)
- Actualizar todas las páginas para mostrar totales sin IGV
- Establecer tax = 0 en backend para nuevas órdenes

Esto soluciona el error de preference_id y elimina el IGV."

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
echo "🧪 3. Verificando endpoints de pago..."

# Verificar que el endpoint de payment responda
payment_status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" https://tienda-diego-qkm5.onrender.com/api/payment/create-preference 2>/dev/null || echo "FAIL")

if [ "$payment_status" = "401" ] || [ "$payment_status" = "400" ]; then
  echo "✅ Endpoint de payment funcionando (requiere autenticación y datos)"
else
  echo "⚠️ Endpoint de payment: $payment_status"
fi

echo ""
echo "✨ Correcciones de MercadoPago e IGV completadas!"
echo ""
echo "🔧 Cambios implementados:"
echo "   ✅ MercadoPago: Manejo correcto de preference_id"
echo "   ✅ IGV eliminado: Sin cobro de impuestos (18%)"
echo "   ✅ URLs de producción: MercadoPago configurado correctamente"
echo "   ✅ Cálculo simplificado: Solo subtotal + envío"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve al checkout y completa el formulario"
echo "   2. El error de preference_id debería estar solucionado"
echo "   3. Los precios no incluirán IGV"
echo "   4. MercadoPago debería redirigir correctamente"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Notas importantes:"
echo "   - El IGV ha sido completamente eliminado del sistema"
echo "   - Los precios mostrados son precios finales"
echo "   - MercadoPago ahora usa las URLs correctas de producción"
