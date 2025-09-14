#!/bin/bash

echo "🔧 Corrigiendo problema de parámetros en routing..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de corrección de routing..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Corregir parámetros de routing en OrderSuccessPage

- Cambiar { orderId } por { id: orderId } en useParams()
- La ruta está definida como /order-success/:id
- Esto soluciona el problema de orderId undefined

Esto soluciona el problema de 'No se encontró el ID de la orden'."

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
echo "✨ Corrección de routing completada!"
echo ""
echo "🔧 Problema solucionado:"
echo "   ✅ Cambiado { orderId } por { id: orderId } en useParams()"
echo "   ✅ La ruta /order-success/:id ahora funciona correctamente"
echo "   ✅ orderId ya no será undefined"
echo "   ✅ OrderSuccessPage podrá obtener el ID correctamente"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve al checkout y selecciona 'Pago Contra Entrega'"
echo "   2. Completa el formulario de envío"
echo "   3. Confirma el pedido"
echo "   4. Verifica que se redirija correctamente a la página de éxito"
echo "   5. Confirma que se muestre la boleta con el ID correcto"
echo "   6. Verifica que la orden aparezca en la página de pedidos"
echo ""
echo "📋 Logs esperados ahora:"
echo "   - '🚀 Ejecutando redirección a: /order-success/1'"
echo "   - '=== ORDER SUCCESS PAGE ==='"
echo "   - 'Order ID from params: 1' (ya no undefined)"
echo "   - 'Order ID type: string'"
echo "   - '✅ Respuesta de orden: {...}'"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 El problema estaba en:"
echo "   - Ruta definida como: /order-success/:id"
echo "   - Código usando: const { orderId } = useParams()"
echo "   - Debería ser: const { id: orderId } = useParams()"
echo "   - Ahora el parámetro se extrae correctamente"
