import React from 'react';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />

      <Container className="py-4 min-vh-100">
        {children}
      </Container>
      
      <Footer />
    </>
  );
};

export default MainLayout;