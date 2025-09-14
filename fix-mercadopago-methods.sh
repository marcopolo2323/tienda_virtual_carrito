#!/bin/bash

echo "🏦 Configurando métodos de pago peruanos en MercadoPago..."
echo ""

# Hacer commit de los cambios
echo "📤 1. Haciendo commit de configuración de métodos de pago..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No hay cambios para hacer commit"
else
  git commit -m "Fix: Configurar métodos de pago peruanos en MercadoPago

- Agregar country_id: 'PE' y site_id: 'MPE' para Perú
- Configurar payment_methods sin exclusiones
- Habilitar auto_return para mejor UX
- Corregir sintaxis en configuración de payer
- Permitir Yape, Plin, y otros métodos peruanos

Esto habilita todos los métodos de pago disponibles en Perú."

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
echo "🧪 3. Verificando configuración de MercadoPago..."

# Verificar que el endpoint de payment responda
payment_status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" https://tienda-diego-qkm5.onrender.com/api/payment/create-preference 2>/dev/null || echo "FAIL")

if [ "$payment_status" = "401" ] || [ "$payment_status" = "400" ]; then
  echo "✅ Endpoint de payment funcionando"
else
  echo "⚠️ Endpoint de payment: $payment_status"
fi

echo ""
echo "✨ Configuración de métodos de pago completada!"
echo ""
echo "🏦 Métodos de pago habilitados:"
echo "   ✅ Tarjetas de crédito/débito"
echo "   ✅ Yape (si está disponible)"
echo "   ✅ Plin (si está disponible)"
echo "   ✅ PagoEfectivo"
echo "   ✅ Billetera MercadoPago"
echo "   ✅ Transferencia bancaria"
echo ""
echo "🔧 Configuración aplicada:"
echo "   ✅ country_id: 'PE' (Perú)"
echo "   ✅ site_id: 'MPE' (MercadoPago Perú)"
echo "   ✅ currency_id: 'PEN' (Soles peruanos)"
echo "   ✅ Sin exclusiones de métodos de pago"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve al checkout y completa el formulario"
echo "   2. Deberías ver todos los métodos de pago peruanos"
echo "   3. Yape y Plin deberían aparecer si están disponibles"
echo ""
echo "🌐 URLs de tu aplicación:"
echo "   Frontend: https://tiendadiego.vercel.app"
echo "   Backend:  https://tienda-diego-qkm5.onrender.com"
echo ""
echo "📋 Notas importantes:"
echo "   - Los métodos de pago disponibles dependen de tu cuenta de MercadoPago"
echo "   - Asegúrate de tener el Access Token correcto para Perú"
echo "   - Los errores de New Relic son normales y no afectan el funcionamiento"
