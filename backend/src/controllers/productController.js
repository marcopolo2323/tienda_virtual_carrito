/**
 * Controlador de productos
 * Maneja operaciones CRUD para productos y búsquedas
 */
const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const { deleteImage, getOptimizedUrl } = require('../config/cloudinary');
const { 
  handleSequelizeError, 
  handleNotFoundError, 
  handleValidationError,
  handleError, 
  sendErrorResponse 
} = require('../utils/errorHandler');

// Helper function para extraer public_id de URL de Cloudinary
const extractPublicId = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return null;
  }
  
  // Extraer public_id de la URL de Cloudinary
  // Ejemplo: https://res.cloudinary.com/tu_cloud/image/upload/v1234567890/tienda-productos/product-123456789.jpg
  const matches = imageUrl.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp)$/i);
  if (matches) {
    const filename = matches[1];
    return `tienda-productos/${filename}`;
  }
  
  return null;
};

// Helper function para procesar URLs de imágenes (ya no necesaria para Cloudinary, pero mantenerla por compatibilidad)
const processImageUrl = (product, req) => {
  const productData = product.toJSON ? product.toJSON() : product;
  
  // Si ya es una URL de Cloudinary, devolverla tal como está
  if (productData.image_url && productData.image_url.includes('cloudinary.com')) {
    return productData;
  }
  
  // Mantener compatibilidad con imágenes locales existentes
  if (productData.image_url && !productData.image_url.startsWith('http')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    if (productData.image_url.startsWith('/uploads/')) {
      productData.image_url = `${baseUrl}${productData.image_url}`;
    } else {
      productData.image_url = `${baseUrl}/uploads/${productData.image_url}`;
    }
  }
  
  return productData;
};

/**
 * Obtener todos los productos con filtros opcionales
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getAllProducts = async (req, res) => {
  try {
    const { 
      featured, 
      category, 
      category_id, 
      search, 
      limit = 10, 
      page = 1, 
      exclude,
      min_price,
      max_price,
      status
    } = req.query;
    
    // Validar parámetros de paginación
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return sendErrorResponse(res, handleValidationError({
        message: 'El límite debe ser un número positivo',
        fields: ['limit']
      }));
    }
    
    if (isNaN(parsedPage) || parsedPage < 1) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La página debe ser un número positivo',
        fields: ['page']
      }));
    }
    
    const offset = (parsedPage - 1) * parsedLimit;
    const whereConditions = {};
    
    // Aplicar filtros
    if (featured === 'true') {
      whereConditions.featured = true;
    }
    
    if (category || category_id) {
      whereConditions.category_id = category || category_id;
    }
    
    if (search) {
      whereConditions.name = { [Op.iLike]: `%${search}%` };
    }
    
    if (exclude) {
      whereConditions.id = { [Op.ne]: exclude };
    }
    
    // Filtros de precio
    if (min_price || max_price) {
      whereConditions.price = {};
      
      if (min_price) {
        const parsedMinPrice = parseFloat(min_price);
        if (!isNaN(parsedMinPrice)) {
          whereConditions.price[Op.gte] = parsedMinPrice;
        }
      }
      
      if (max_price) {
        const parsedMaxPrice = parseFloat(max_price);
        if (!isNaN(parsedMaxPrice)) {
          whereConditions.price[Op.lte] = parsedMaxPrice;
        }
      }
    }
    
    // Filtro por estado
    if (status) {
      whereConditions.status = status;
    }
    
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      include: [{ 
        model: Category, 
        attributes: ['id', 'name'],
        required: false
      }],
      limit: parsedLimit,
      offset,
      order: [['created_at', 'DESC']]
    });
    
    // Procesar URLs de imágenes (mantener por compatibilidad)
    const formattedProducts = products.map(product => {
      const productData = processImageUrl(product, req);
      return {
        ...productData,
        category_name: productData.Category ? productData.Category.name : null,
        price: parseFloat(productData.price || 0),
        discounted_price: product.getDiscountedPrice ? product.getDiscountedPrice() : parseFloat(productData.price || 0)
      };
    });
    
    res.status(200).json({
      success: true,
      products: formattedProducts,
      pagination: {
        total_pages: Math.ceil(count / parsedLimit),
        current_page: parsedPage,
        total_products: count,
        limit: parsedLimit
      }
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error));
  }
};

/**
 * Obtener un producto por ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Se requiere un ID de producto válido',
        fields: ['id']
      }));
    }
    
    const product = await Product.findByPk(id, {
      include: [{ 
        model: Category, 
        attributes: ['id', 'name'],
        required: false
      }]
    });
    
    if (!product) {
      return sendErrorResponse(res, handleNotFoundError(`Producto con ID ${id} no encontrado`));
    }
    
    const productData = processImageUrl(product, req);
    const formattedProduct = {
      ...productData,
      price: parseFloat(productData.price || 0),
      weight: productData.weight ? parseFloat(productData.weight) : null,
      category_name: productData.Category ? productData.Category.name : null,
      discounted_price: product.getDiscountedPrice ? product.getDiscountedPrice() : parseFloat(productData.price || 0)
    };
    
    res.status(200).json({
      success: true,
      product: formattedProduct
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error));
  }
};

/**
 * Crear un nuevo producto
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      stock, 
      featured, 
      category_id,
      sku, 
      weight, 
      dimensions,
      discount_percent,
      status
    } = req.body;
    
    // Validación de campos requeridos
    const requiredFields = ['name', 'price', 'stock'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Faltan campos requeridos',
        fields: missingFields
      }));
    }
    
    // Validación de formato de precio
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return sendErrorResponse(res, handleValidationError({
        message: 'El precio debe ser un número positivo',
        fields: ['price']
      }));
    }
    
    // Validación de formato de stock
    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return sendErrorResponse(res, handleValidationError({
        message: 'El stock debe ser un número entero no negativo',
        fields: ['stock']
      }));
    }
    
    // Validación de descuento si está presente
    if (discount_percent !== undefined) {
      const parsedDiscount = parseFloat(discount_percent);
      if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
        return sendErrorResponse(res, handleValidationError({
          message: 'El descuento debe ser un número entre 0 y 100',
          fields: ['discount_percent']
        }));
      }
    }
    
    // Validación de categoría si está presente
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return sendErrorResponse(res, handleValidationError({
          message: 'La categoría seleccionada no existe',
          fields: ['category_id']
        }));
      }
    }
    
    // Con Cloudinary, req.file.path contiene la URL completa de la imagen
    let image_url = null;
    if (req.file) {
      image_url = req.file.path; // Cloudinary devuelve la URL completa
      console.log('Imagen subida a Cloudinary:', image_url);
      console.log('Public ID:', req.file.public_id);
    }
    
    const productData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      price: parsedPrice,
      stock: parsedStock,
      image_url, // URL completa de Cloudinary
      featured: featured === 'true' || featured === true,
      category_id: category_id || null,
      sku: sku || null,
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions || null
    };
    
    console.log('Datos a guardar:', productData);
    
    const product = await Product.create(productData);
    
    // Obtener el producto completo con la categoría
    const fullProduct = await Product.findByPk(product.id, {
      include: [{ 
        model: Category, 
        attributes: ['id', 'name'],
        required: false
      }]
    });
    
    console.log('Producto creado exitosamente con Cloudinary');
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: fullProduct
    });
  } catch (error) {
    console.error('Error en createProduct:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Actualizar un producto
const updateProduct = async (req, res) => {
  try {
    console.log('=== ACTUALIZANDO PRODUCTO CON CLOUDINARY ===');
    console.log('ID:', req.params.id);
    console.log('Body recibido:', req.body);
    console.log('Archivo recibido:', req.file);
    
    const { 
      name, 
      description, 
      price, 
      stock, 
      featured, 
      category_id,
      sku, 
      weight, 
      dimensions 
    } = req.body;
    
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Si se subió una nueva imagen
    if (req.file) {
      // Eliminar la imagen anterior de Cloudinary si existe
      if (product.image_url) {
        const oldPublicId = extractPublicId(product.image_url);
        if (oldPublicId) {
          try {
            await deleteImage(oldPublicId);
            console.log('Imagen anterior eliminada de Cloudinary');
          } catch (error) {
            console.error('Error eliminando imagen anterior:', error);
          }
        }
      }
      
      // Asignar la nueva URL de Cloudinary
      product.image_url = req.file.path;
      console.log('Nueva imagen subida a Cloudinary:', req.file.path);
    }
    
    // Actualizar otros campos
    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description ? description.trim() : null;
    
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (!isNaN(parsedPrice)) {
        product.price = parsedPrice;
      }
    }
    
    if (stock !== undefined) {
      const parsedStock = parseInt(stock);
      if (!isNaN(parsedStock)) {
        product.stock = parsedStock;
      }
    }
    
    if (featured !== undefined) {
      product.featured = featured === 'true' || featured === true;
    }
    
    if (category_id !== undefined) {
      product.category_id = category_id || null;
    }
    
    if (sku !== undefined) product.sku = sku || null;
    
    if (weight !== undefined) {
      const parsedWeight = parseFloat(weight);
      product.weight = !isNaN(parsedWeight) ? parsedWeight : null;
    }
    
    if (dimensions !== undefined) {
      product.dimensions = dimensions || null;
    }
    
    await product.save();
    
    // Obtener el producto completo con la categoría
    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ 
        model: Category, 
        attributes: ['id', 'name'],
        required: false
      }]
    });
    
    console.log('Producto actualizado exitosamente');
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error en updateProduct:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Eliminar un producto
const deleteProduct = async (req, res) => {
  try {
    console.log('Eliminando producto ID:', req.params.id);
    
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Eliminar imagen de Cloudinary si existe
    if (product.image_url) {
      const publicId = extractPublicId(product.image_url);
      if (publicId) {
        try {
          await deleteImage(publicId);
          console.log('Imagen eliminada de Cloudinary');
        } catch (error) {
          console.error('Error eliminando imagen de Cloudinary:', error);
        }
      }
    }
    
    await product.destroy();
    
    console.log('Producto eliminado exitosamente');
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Obtener productos destacados
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const featuredProducts = await Product.findAll({
      where: { featured: true },
      include: [{ 
        model: Category, 
        attributes: ['id', 'name'],
        required: false
      }],
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    // Procesar productos
    const productsData = featuredProducts.map(product => {
      const productData = processImageUrl(product, req);
      return {
        ...productData, 
        price: parseFloat(productData.price || 0),
        weight: productData.weight ? parseFloat(productData.weight) : null,
        category_name: productData.Category ? productData.Category.name : null
      };
    });

    console.log('Productos destacados obtenidos:', productsData.length);

    res.json(productsData); 
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos destacados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }); 
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};