/**
 * Database seeder utility
 * Run this script to populate the database with initial data
 */

require('dotenv').config();
const sequelize = require('../config/database');
const { User, Category, Product, Banner } = require('../models');
const logger = require('./logger'); 

/**
 * Seed admin user
 */
const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ where: { email: adminEmail } });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: adminEmail,
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'User',
        phone: null,
        role: 'admin',
        is_active: true
      });
      
      logger.info('Admin user created successfully');
    } else {
      logger.info('Admin user already exists');
    }
  } catch (error) {
    logger.error('Error seeding admin user', { error: error.message, stack: error.stack });
  }
};

/**
 * Seed categories
 */
const seedCategories = async () => {
  try {
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Books', description: 'Books and publications' },
      { name: 'Home & Kitchen', description: 'Home and kitchen products' },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' }
    ];
    
    for (const category of categories) {
      const [categoryRecord, created] = await Category.findOrCreate({
        where: { name: category.name },
        defaults: category
      });
      
      if (created) {
        logger.info(`Category '${category.name}' created successfully`);
      } else {
        logger.info(`Category '${category.name}' already exists`);
      }
    }
  } catch (error) {
    logger.error('Error seeding categories', { error: error.message, stack: error.stack });
  }
};

/**
 * Seed products
 */
const seedProducts = async () => {
  try {
    // Get category IDs
    const electronics = await Category.findOne({ where: { name: 'Electronics' } });
    const clothing = await Category.findOne({ where: { name: 'Clothing' } });
    const books = await Category.findOne({ where: { name: 'Books' } });
    const homeKitchen = await Category.findOne({ where: { name: 'Home & Kitchen' } });
    const sportsOutdoors = await Category.findOne({ where: { name: 'Sports & Outdoors' } });
    
    if (!electronics || !clothing || !books || !homeKitchen || !sportsOutdoors) {
      logger.error('Categories not found. Please seed categories first.');
      return;
    }
    
    const products = [
      {
        name: 'Smartphone X',
        description: 'Latest smartphone with advanced features',
        price: 799.99,
        stock: 50,
        image_url: 'smartphone.jpg',
        featured: true,
        category_id: electronics.id,
        sku: 'SPHONE-001',
        weight: 0.18,
        dimensions: '15.5 x 7.5 x 0.8' // ✅ SIN "cm"
      },
      {
        name: 'Laptop Pro',
        description: 'High-performance laptop for professionals',
        price: 1299.99,
        stock: 30,
        image_url: 'laptop.jpg',
        featured: true,
        category_id: electronics.id,
        sku: 'LAPTOP-001',
        weight: 1.4,
        dimensions: '30.4 x 21.2 x 1.6' // ✅ SIN "cm"
      },
      {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones',
        price: 199.99,
        stock: 100,
        image_url: 'headphones.jpg',
        featured: false,
        category_id: electronics.id,
        sku: 'HEAD-001',
        weight: 0.25,
        dimensions: '19 x 16 x 8' // ✅ SIN "cm"
      },
      {
        name: 'Men\'s T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 24.99,
        stock: 200,
        image_url: 'tshirt.jpg',
        featured: false,
        category_id: clothing.id,
        sku: 'TSHIRT-M-001',
        weight: 0.15,
        dimensions: '70 x 50 x 1' // ✅ SIN "cm"
      },
      {
        name: 'Women\'s Jeans',
        description: 'Stylish and durable jeans',
        price: 49.99,
        stock: 150,
        image_url: 'jeans.jpg',
        featured: true,
        category_id: clothing.id,
        sku: 'JEANS-W-001',
        weight: 0.45,
        dimensions: '100 x 40 x 2' // ✅ SIN "cm"
      },
      {
        name: 'Programming Guide',
        description: 'Comprehensive programming guide for beginners',
        price: 39.99,
        stock: 75,
        image_url: 'programming-book.jpg',
        featured: false,
        category_id: books.id,
        sku: 'BOOK-PROG-001',
        weight: 0.8,
        dimensions: '24 x 17 x 3' // ✅ SIN "cm"
      },
      {
        name: 'Coffee Maker',
        description: 'Automatic coffee maker with timer',
        price: 89.99,
        stock: 40,
        image_url: 'coffee-maker.jpg',
        featured: true,
        category_id: homeKitchen.id,
        sku: 'COFFEE-001',
        weight: 2.5,
        dimensions: '25 x 20 x 30' // ✅ SIN "cm"
      },
      {
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat for exercise',
        price: 29.99,
        stock: 120,
        image_url: 'yoga-mat.jpg',
        featured: false,
        category_id: sportsOutdoors.id,
        sku: 'YOGA-MAT-001',
        weight: 1.2,
        dimensions: '183 x 61 x 0.6' // ✅ SIN "cm"
      }
    ];
    
    for (const product of products) {
      const [productRecord, created] = await Product.findOrCreate({
        where: { name: product.name },
        defaults: product
      });
      
      if (created) {
        logger.info(`Product '${product.name}' created successfully with SKU: ${product.sku}`);
      } else {
        logger.info(`Product '${product.name}' already exists`);
      }
    }
  } catch (error) {
    logger.error('Error seeding products', { error: error.message, stack: error.stack });
  }
};

/**
 * Seed banners ✅ NUEVO
 */
const seedBanners = async () => {
  try {
    const banners = [
      {
        title: 'Welcome to Our Store',
        description: 'Discover amazing products at unbeatable prices. Shop now and save big!',
        // ✅ URLs más simples y confiables
        image_url: 'https://picsum.photos/1200/400?random=1',
        link_url: '/products',
        button_text: 'Shop Now',
        active: true,
        display_order: 1
      },
      {
        title: 'Summer Sale',
        description: 'Up to 50% off on summer collection. Limited time offer!',
        image_url: 'https://picsum.photos/1200/400?random=2',
        link_url: '/products?sale=true',
        button_text: 'View Sale',
        active: true,
        display_order: 2
      },
      {
        title: 'New Electronics Collection',
        description: 'Latest gadgets and electronics now available. Technology at its finest!',
        image_url: 'https://picsum.photos/1200/400?random=3',
        link_url: '/products?category=electronics',
        button_text: 'Explore Tech',
        active: true,
        display_order: 3
      }
    ];
    
    for (const banner of banners) {
      const [bannerRecord, created] = await Banner.findOrCreate({
        where: { title: banner.title },
        defaults: banner
      });
      
      if (created) {
        logger.info(`Banner '${banner.title}' created successfully`);
      } else {
        logger.info(`Banner '${banner.title}' already exists`);
      }
    }
  } catch (error) {
    logger.error('Error seeding banners', { error: error.message, stack: error.stack });
  }
};

/**
 * Main seeder function
 */
const seedDatabase = async () => {
  try {
    // Sync database models
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized');
    
    // Seed data
    await seedAdminUser();
    await seedCategories();
    await seedProducts();
    await seedBanners(); // ✅ Agregar seeding de banners
    
    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;