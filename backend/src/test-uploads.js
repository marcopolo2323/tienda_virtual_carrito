// test-uploads.js
// Ejecutar con: node test-uploads.js

const fs = require('fs');
const path = require('path');

console.log('=== DIAGNÓSTICO DE UPLOADS ===');

const uploadsPath = path.join(__dirname, 'uploads');
console.log('1. Ruta de uploads:', uploadsPath);
console.log('2. ¿Existe la carpeta?:', fs.existsSync(uploadsPath));

if (fs.existsSync(uploadsPath)) {
  try {
    const files = fs.readdirSync(uploadsPath);
    console.log('3. Archivos encontrados:', files.length);
    
    files.forEach((file, index) => {
      const filePath = path.join(uploadsPath, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${index + 1}. ${file} (${stats.size} bytes)`);
    });
    
    // Probar acceso a un archivo específico
    if (files.length > 0) {
      const testFile = files[0];
      const testPath = path.join(uploadsPath, testFile);
      console.log('4. Probando acceso al archivo:', testFile);
      console.log('   - Ruta completa:', testPath);
      console.log('   - ¿Es archivo?:', fs.statSync(testPath).isFile());
      console.log('   - Permisos:', fs.accessSync(testPath, fs.constants.R_OK) === undefined ? 'OK' : 'ERROR');
    }
  } catch (error) {
    console.error('3. Error accediendo a uploads:', error.message);
  }
} else {
  console.log('3. La carpeta uploads no existe');
}

console.log('=== FIN DIAGNÓSTICO ===');