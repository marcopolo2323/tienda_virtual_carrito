const { Category, Product } = require('../models');

// Obtener todas las categorías
const getAllCategories = async (req, res) => {
  try {
    // Obtener todas las categorías
    const categories = await Category.findAll({ 
      order: [['name', 'ASC']]
    });

    // Para cada categoría, contar sus productos
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.count({
          where: { category_id: category.id }
        });
        
        return {
          ...category.toJSON(),
          product_count: productCount
        };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error('Error en getAllCategories:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Obtener una categoría por ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva categoría
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Verificar si ya existe una categoría con ese nombre
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // Crear categoría
    const category = await Category.create({
      name,
      description
    });
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar una categoría
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Verificar si ya existe otra categoría con ese nombre
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }
    
    // Actualizar datos
    category.name = name || category.name;
    category.description = description || category.description;
    
    await category.save();
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar una categoría
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Verificar si hay productos asociados a esta categoría
    const productsCount = await Product.count({ where: { categoryId: req.params.id } });
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with associated products',
        productsCount
      });
    }
    
    await category.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}