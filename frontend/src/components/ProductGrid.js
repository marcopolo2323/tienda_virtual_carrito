import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert, Pagination } from 'react-bootstrap';
import axios from '../utils/axios';
import ProductCard from './ProductCard';

const ProductGrid = ({ category, search, sort, page = 1, minPrice, maxPrice, onPageChange }) => {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalProducts, setTotalProducts] = useState(0); // Nuevo estado para el total
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query string from filters
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort);
        if (page) params.append('page', page);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);

        const response = await axios.get(`/products?${params.toString()}`);
        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalProducts(response.data.count || 0); // Usar 'count' que es lo que devuelve tu backend
        setCurrentPage(response.data.currentPage || page);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, search, sort, page, minPrice, maxPrice]);
  
  const handlePageChange = (newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading products...</span>
        </Spinner>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }
  
  if (products.length === 0) {
    return (
      <Alert variant="info">
        No products found matching your search criteria.
      </Alert>
    );
  }
  
  // Calcular el rango de productos mostrados
  const productsPerPage = products.length;
  const startProduct = (currentPage - 1) * productsPerPage + 1;
  const endProduct = Math.min(currentPage * productsPerPage, totalProducts);
  
  return (
    <>
      {/* Mostrar información del total de productos */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted">
          {totalProducts > 0 ? (
            <>
              Mostrando {startProduct}-{endProduct} de {totalProducts} productos
              {search && <span> para "{search}"</span>}
              {category && <span> en {category}</span>}
            </>
          ) : (
            'No se encontraron productos'
          )}
        </div>
        <div className="text-muted">
          Página {currentPage} de {totalPages}
        </div>
      </div>

      <Row xs={1} sm={2} md={3} lg={3} className="g-4 mb-4">
        {products.map(product => (
          <Col key={product.id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => handlePageChange(1)} 
              disabled={currentPage === 1} 
            />
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1} 
            />
            
            {[...Array(totalPages).keys()].map(p => {
              const pageNumber = p + 1;
              // Show current page, first, last, and pages around current
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <Pagination.Item
                    key={pageNumber}
                    active={pageNumber === currentPage}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Pagination.Item>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return <Pagination.Ellipsis key={pageNumber} />;
              }
              return null;
            })}
            
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages} 
            />
            <Pagination.Last 
              onClick={() => handlePageChange(totalPages)} 
              disabled={currentPage === totalPages} 
            />
          </Pagination>
        </div>
      )}
    </>
  );
};

export default ProductGrid;