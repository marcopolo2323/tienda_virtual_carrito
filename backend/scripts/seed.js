/**
 * Database seeder script
 * Run with: node scripts/seed.js
 * Run in production: npm run seed:prod
 */

require('dotenv').config();
const seedDatabase = require('../src/utils/seedDatabase');

const isProduction = process.env.NODE_ENV === 'production';

console.log('🌱 Iniciando seeding de la base de datos...');
console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);

if (isProduction) {
  console.log('⚠️  ADVERTENCIA: Ejecutando en modo producción');
  console.log('⚠️  Esto eliminará y recreará todos los datos');
}

seedDatabase()
  .then(() => {
    console.log('✅ Seeding completado exitosamente');
    console.log('📋 Datos creados:');
    console.log('   👤 Usuario admin: admin@gmail.com / admin123');
    console.log('   📂 Categorías: 5 categorías de ejemplo');
    console.log('   🛍️  Productos: 8 productos de ejemplo');
    console.log('   🖼️  Banners: 3 banners de ejemplo');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error durante el seeding:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  });