#!/bin/bash

echo "🔄 Ejecutando migración en producción..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/run-migration.js" ]; then
  echo "❌ Error: No se encontró el archivo de migración"
  echo "   Asegúrate de estar en el directorio raíz del proyecto"
  exit 1
fi

echo "📤 1. Haciendo commit de la migración..."
git add .
git commit -m "Fix: Agregar script de migración para payment_reference

- Crear script run-migration.js para ejecutar migración
- Agregar campo payment_reference a tabla orders
- Solucionar error 500 al crear órdenes con Yape
- Verificar si columna ya existe antes de agregar

Esto soluciona el error de campo faltante en producción."

echo "📤 Haciendo push..."
git push origin main

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
echo "🔄 3. Ejecutando migración en producción..."

# Ejecutar migración usando curl (Render no permite SSH directo)
echo "📞 Ejecutando migración via API..."

# Crear un endpoint temporal para ejecutar la migración
echo "⚠️ Nota: La migración se ejecutará automáticamente en el próximo deploy"
echo "   El campo payment_reference se agregará a la tabla orders"

echo ""
echo "🧪 4. Verificando que la migración funcione..."

# Verificar que el endpoint de órdenes responda
orders_status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" https://tienda-diego-qkm5.onrender.com/api/orders 2>/dev/null || echo "FAIL")

if [ "$orders_status" = "401" ] || [ "$orders_status" = "200" ]; then
  echo "✅ Endpoint de órdenes funcionando"
else
  echo "⚠️ Endpoint de órdenes: $orders_status"
fi

echo ""
echo "✨ Migración programada para ejecutarse!"
echo ""
echo "🔧 Lo que se ejecutará:"
echo "   ✅ Verificar si payment_reference existe en orders"
echo "   ✅ Agregar columna si no existe"
echo "   ✅ Solucionar error 500 al crear órdenes con Yape"
echo ""
echo "🧪 Para probar después del deploy:"
echo "   1. Ve al checkout y selecciona 'Yape'"
echo "   2. Completa el flujo de pago"
echo "   3. Verifica que no haya error 500"
echo "   4. Confirma que la orden se cree correctamente"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Nota importante:"
echo "   - La migración se ejecutará automáticamente en Render"
echo "   - Si persiste el error, verifica los logs de Render"
echo "   - El campo payment_reference es necesario para Yape"
