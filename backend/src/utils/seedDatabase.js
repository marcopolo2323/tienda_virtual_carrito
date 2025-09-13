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
        password: 'admin123',👤 Usuario autenticado, sincronizando carrito...
App.js:64 ✅ Usuario autenticado: admin@gmail.com
App.js:70 🛒 Inicializando carrito...
cartStore.js:660 🚀 Inicializando carrito...
cartStore.js:664 👤 Usuario autenticado, sincronizando carrito...
App.js:72 ✅ Carrito inicializado exitosamente
App.js:78 ✅ Aplicación inicializada completamente
BannerFormPage.js:192 Adding image file to FormData: {name: '8FfhjZ.jpg', size: 8340, type: 'image/jpeg'}
BannerFormPage.js:202 FormData contents:
BannerFormPage.js:204 title: kawasaki
BannerFormPage.js:204 description: compren su kawasaki bros
BannerFormPage.js:204 link_url: https://www.revzilla.com/common-tread/special-order-superbikes-aprilia-rsv4-x-gp-and-kawasaki-ninja-h2-lineup
BannerFormPage.js:204 button_text: compre ahora
BannerFormPage.js:204 active: true
BannerFormPage.js:204 display_order: 1
BannerFormPage.js:204 image: File {name: '8FfhjZ.jpg', lastModified: 1757722614910, lastModifiedDate: Fri Sep 12 2025 19:16:54 GMT-0500 (hora estándar de Perú), webkitRelativePath: '', size: 8340, …}
bannerStore.js:90 Creating banner with data: {hasImage: true, title: 'kawasaki', description: 'compren su kawasaki bros', link_url: 'https://www.revzilla.com/common-tread/special-orde…es-aprilia-rsv4-x-gp-and-kawasaki-ninja-h2-lineup', button_text: 'compre ahora', …}
bannerService.js:57  POST http://localhost:5000/api/admin/banners 400 (Bad Request)
dispatchXhrRequest @ xhr.js:195
xhr @ xhr.js:15
dispatchRequest @ dispatchRequest.js:51
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
httpMethod @ Axios.js:226
wrap @ bind.js:5
createBanner @ bannerService.js:57
createBanner @ bannerStore.js:100
handleSubmit @ BannerFormPage.js:211
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
executeDispatch @ react-dom.development.js:9041
processDispatchQueueItemsInOrder @ react-dom.development.js:9073
processDispatchQueue @ react-dom.development.js:9086
dispatchEventsForPlugins @ react-dom.development.js:9097
(anonymous) @ react-dom.development.js:9288
batchedUpdates$1 @ react-dom.development.js:26179
batchedUpdates @ react-dom.development.js:3991
dispatchEventForPluginEventSystem @ react-dom.development.js:9287
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
dispatchEvent @ react-dom.development.js:6457
dispatchDiscreteEvent @ react-dom.development.js:6430
bannerStore.js:112 Error creating banner: Error: Image file is required
    at BannerService.createBanner (bannerService.js:65:1)
    at async createBanner (bannerStore.js:100:1)
    at async handleSubmit (BannerFormPage.js:211:1)
createBanner @ bannerStore.js:112
await in createBanner
handleSubmit @ BannerFormPage.js:211
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
executeDispatch @ react-dom.development.js:9041
processDispatchQueueItemsInOrder @ react-dom.development.js:9073
processDispatchQueue @ react-dom.development.js:9086
dispatchEventsForPlugins @ react-dom.development.js:9097
(anonymous) @ react-dom.development.js:9288
batchedUpdates$1 @ react-dom.development.js:26179
batchedUpdates @ react-dom.development.js:3991
dispatchEventForPluginEventSystem @ react-dom.development.js:9287
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
dispatchEvent @ react-dom.development.js:6457
dispatchDiscreteEvent @ react-dom.development.js:6430
BannerFormPage.js:218 Error saving banner: Error: Image file is required
    at createBanner (bannerStore.js:137:1)
    at async handleSubmit (BannerFormPage.js:211:1)
handleSubmit @ BannerFormPage.js:218
await in handleSubmit
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
executeDispatch @ react-dom.development.js:9041
processDispatchQueueItemsInOrder @ react-dom.development.js:9073
processDispatchQueue @ react-dom.development.js:9086
dispatchEventsForPlugins @ react-dom.development.js:9097
(anonymous) @ react-dom.development.js:9288
batchedUpdates$1 @ react-dom.development.js:26179
batchedUpdates @ react-dom.development.js:3991
dispatchEventForPluginEventSystem @ react-dom.development.js:9287
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
dispatchEvent @ react-dom.development.js:6457
dispatchDiscreteEvent @ react-dom.development.js:6430
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
        dimensions: '15.5 x 7.5 x 0.8 cm'
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
        dimensions: '30.4 x 21.2 x 1.6 cm'
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
        dimensions: '19 x 16 x 8 cm'
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
        dimensions: '70 x 50 x 1 cm'
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
        dimensions: '100 x 40 x 2 cm'
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
        dimensions: '24 x 17 x 3 cm'
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
        dimensions: '25 x 20 x 30 cm'
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
        dimensions: '183 x 61 x 0.6 cm'
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
        image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
        link_url: '/products',
        button_text: 'Shop Now',
        active: true,
        display_order: 1
      },
      {
        title: 'Summer Sale',
        description: 'Up to 50% off on summer collection. Limited time offer!',
        image_url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop',
        link_url: '/products?sale=true',
        button_text: 'View Sale',
        active: true,
        display_order: 2
      },
      {
        title: 'New Electronics Collection',
        description: 'Latest gadgets and electronics now available. Technology at its finest!',
        image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop',
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