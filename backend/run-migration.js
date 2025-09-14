const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function runMigration() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    console.log('🔄 Ejecutando migración: Agregar payment_reference a orders...');
    
    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'payment_reference'
    `);

    if (results.length > 0) {
      console.log('✅ La columna payment_reference ya existe en la tabla orders');
    } else {
      // Agregar la columna
      await sequelize.query(`
        ALTER TABLE orders 
        ADD COLUMN payment_reference VARCHAR(100) NULL
      `);
      console.log('✅ Columna payment_reference agregada exitosamente');
    }

    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();
