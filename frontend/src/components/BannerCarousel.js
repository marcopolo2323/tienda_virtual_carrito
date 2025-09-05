// components/BannerCarousel.js - Componente para mostrar banners en el frontend
import React, { useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useBannerStore from '../store/bannerStore';

const BannerCarousel = () => {
  const { activeBanners, loading, fetchActiveBanners } = useBannerStore();

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

  if (loading.activeBanners) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading banners...</span>
        </div>
      </div>
    );
  }

  if (!activeBanners || activeBanners.length === 0) {
    return null; // No mostrar nada si no hay banners
  }

  return (
    <Carousel className="mb-5" fade>
      {activeBanners.map(banner => (
        <Carousel.Item key={banner.id}>
          <img
            className="d-block w-100"
            src={banner.image_url}
            alt={banner.title}
            style={{ height: '400px', objectFit: 'cover' }}
          />
          <Carousel.Caption>
            <h2>{banner.title}</h2>
            <p>{banner.description}</p>
            {banner.link_url && banner.button_text && (
              <Link to={banner.link_url} className="btn btn-primary btn-lg">
                {banner.button_text}
              </Link>
            )}
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default BannerCarousel;