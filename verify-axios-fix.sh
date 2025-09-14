#!/bin/bash

echo "🔍 Verificando corrección de imports de axios..."

# Verificar que solo utils/axios.js importe axios directamente
echo "📋 Verificando imports de axios..."
DIRECT_IMPORTS=$(grep -r "import axios from 'axios'" frontend/src --exclude-dir=node_modules | grep -v "frontend/src/utils/axios.js" | wc -l)

if [ $DIRECT_IMPORTS -eq 0 ]; then
  echo "✅ Todos los imports de axios están correctos"
else
  echo "❌ Aún hay imports directos de axios:"
  grep -r "import axios from 'axios'" frontend/src --exclude-dir=node_modules | grep -v "frontend/src/utils/axios.js"
  exit 1
fi

# Verificar que los archivos usen la configuración correcta
echo "📋 Verificando archivos corregidos..."
CORRECTED_FILES=(
  "frontend/src/pages/admin/ProductsPage.js"
  "frontend/src/pages/OrderSuccessPage.js" 
  "frontend/src/pages/admin/CategoriesPage.js"
  "frontend/src/components/ProductReviews.js"
)

for file in "${CORRECTED_FILES[@]}"; do
  if grep -q "import axios from.*utils/axios" "$file"; then
    echo "✅ $file - Usando configuración correcta"
  else
    echo "❌ $file - NO está usando la configuración correcta"
    exit 1
  fi
done

echo ""
echo "🎯 Verificación de configuración de axios:"
echo "✅ Todos los archivos usan import axios from '../utils/axios' o '../../utils/axios'"
echo "✅ Solo utils/axios.js importa axios directamente"
echo "✅ Las peticiones ahora deberían ir a http://localhost:5000/api/"
echo ""
echo "🚀 Para probar:"
echo "1. Asegúrate de que el backend esté corriendo en puerto 5000"
echo "2. Inicia el frontend en puerto 3000"
echo "3. Las peticiones deberían ir a localhost:5000/api/ en lugar de localhost:3000/"
echo ""
echo "🔧 Si sigues viendo errores 404, verifica:"
echo "- Backend corriendo: http://localhost:5000/api/health"
echo "- Variables de entorno: NODE_ENV=development"
echo "- Consola del navegador: URLs de peticiones"
