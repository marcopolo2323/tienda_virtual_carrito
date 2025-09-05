import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';
import CategoryList from '../components/CategoryList';

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category') || '';
  const searchParam = queryParams.get('search') || '';
  const sortParam = queryParams.get('sort') || 'newest';
  const pageParam = parseInt(queryParams.get('page') || '1', 10);
  const minPriceParam = queryParams.get('min_price') || '';
  const maxPriceParam = queryParams.get('max_price') || '';

  // Handle page change
  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set('page', page.toString());
    navigate(`/products?${params.toString()}`);
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    params.append('page', '1'); // Reset to first page when filters change

    navigate(`/products?${params.toString()}`);
  };

  // Reset all filters
  const resetFilters = () => {
    navigate('/products');
  };

  return (
    <Container>
      <h1 className="mb-4">Products</h1>
      
      <Row>
        {/* Filters Sidebar */}
        <Col md={3} className="mb-4">
          {/* Category List */}
          <CategoryList displayAsList={true} />
          
          {/* Product Filters */}
          <ProductFilters 
            initialFilters={{
              category: categoryParam,
              search: searchParam,
              sort: sortParam,
              minPrice: minPriceParam,
              maxPrice: maxPriceParam
            }}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
        </Col>

        {/* Products Grid */}
        <Col md={9}>
          <ProductGrid 
            category={categoryParam}
            search={searchParam}
            sort={sortParam}
            page={pageParam}
            minPrice={minPriceParam}
            maxPrice={maxPriceParam}
            onPageChange={handlePageChange}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ProductsPage;