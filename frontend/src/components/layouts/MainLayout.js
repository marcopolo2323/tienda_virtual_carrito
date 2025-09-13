import React from 'react';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="minimalist-layout">
      <Navbar />

      <main className="minimalist-main">
        <Container className="py-minimal-lg">
          {children}
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;