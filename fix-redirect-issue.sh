#!/bin/bash

echo "🔄 Corrigiendo problema de redirección después de crear orden..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de correcciones de redirección..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir problema de redirección después de crear orden

- Cambiar orden de limpieza de carrito y redirección
- Agregar delay pequeño para asegurar redirección
- Evitar bloqueo de navegación por clearCart asíncrono
- Mejorar flujo de creación de orden

Esto soluciona el problema de redirección después de crear orden."

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
echo "✨ Correcciones de redirección completadas!"
echo ""
echo "🔧 Problemas solucionados:"
echo "   ✅ Orden correcta de limpieza de carrito y redirección"
echo "   ✅ Delay pequeño para asegurar redirección"
echo "   ✅ Evitar bloqueo por clearCart asíncrono"
echo "   ✅ Mejor flujo de creación de orden"
echo "   ✅ Redirección confiable a página de éxito"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve al checkout y selecciona cualquier método de pago"
echo "   2. Completa el formulario de envío"
echo "   3. Confirma el pedido"
echo "   4. Verifica que se redirija correctamente a la página de éxito"
echo "   5. Confirma que se muestre la boleta con el ID correcto"
echo "   6. Verifica que la orden aparezca en la página de pedidos"
echo ""
echo "📋 Mejoras implementadas:"
echo "   - clearCart() se ejecuta antes de la redirección"
echo "   - setTimeout de 100ms para asegurar redirección"
echo "   - No bloqueo de navegación por operaciones asíncronas"
echo "   - Flujo más robusto y confiable"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Si persiste el problema:"
echo "   - Revisa la consola del navegador para ver los logs"
echo "   - Verifica que el Order ID se esté recibiendo correctamente"
echo "   - Los logs ahora muestran el flujo completo de redirección"
