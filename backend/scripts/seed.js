/**
 * Database seeder script
 * Run with: node scripts/seed.js
 */

const seedDatabase = require('../src/utils/seedDatabase');

seedDatabase()
  .then(() => {
    console.log('Database seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database seeding failed:', error.message);
    process.exit(1);
  });