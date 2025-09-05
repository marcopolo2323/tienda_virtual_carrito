import React, { useState, useEffect } from 'react';
import { Form, Button, Accordion, Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const ProductFilters = ({ initialFilters = {}, onFilterChange, onResetFilters }) => {
  const location = useLocation();
  
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    search: initialFilters.search || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    sort: initialFilters.sort || 'newest'
  });
  
  // Update filters when initialFilters change
  useEffect(() => {
    setFilters({
      category: initialFilters.category || '',
      search: initialFilters.search || '',
      minPrice: initialFilters.minPrice || '',
      maxPrice: initialFilters.maxPrice || '',
      sort: initialFilters.sort || 'newest'
    });
  }, [initialFilters]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Notify parent component
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };
  
  const handleClearFilters = () => {
    // Reset filters
    const resetFilters = {
      category: '',
      search: filters.search, // Preserve search term
      minPrice: '',
      maxPrice: '',
      sort: 'newest'
    };
    
    setFilters(resetFilters);
    
    // Notify parent component
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
    
    // Call onResetFilters if provided
    if (onResetFilters) {
      onResetFilters();
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>Filters</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* Search field */}
          <Form.Group className="mb-3">
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              name="search"
              placeholder="Search products..."
              value={filters.search}
              onChange={handleInputChange}
            />
          </Form.Group>
          
          <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Sort By</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Select 
                    name="sort" 
                    value={filters.sort} 
                    onChange={handleInputChange}
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                  </Form.Select>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
            
            <Accordion.Item eventKey="1">
              <Accordion.Header>Price Range</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex gap-2 mb-3">
                  <Form.Group className="flex-grow-1">
                    <Form.Control 
                      type="number" 
                      placeholder="Min" 
                      name="minPrice" 
                      value={filters.minPrice} 
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <span className="align-self-center">-</span>
                  <Form.Group className="flex-grow-1">
                    <Form.Control 
                      type="number" 
                      placeholder="Max" 
                      name="maxPrice" 
                      value={filters.maxPrice} 
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        
        <div className="d-grid gap-2 mt-3">
          <Button type="submit" variant="primary">
            Apply Filters
          </Button>
          <Button 
            type="button" 
            variant="outline-secondary" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </Form>
    </Card.Body>
  </Card>
  );
};

export default ProductFilters;