import React, { useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useBannerStore from '../store/bannerStore';
import '../styles/minimalist-banner.css';

const BannerCarousel = () => {
  const { activeBanners, loading, fetchActiveBanners } = useBannerStore();

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

  if (loading.activeBanners) {
    return (
      <div className="minimalist-banner-loading">
        <div className="minimalist-spinner"></div>
        <p className="text-muted">Cargando banners...</p>
      </div>
    );
  }

  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  return (
    <section className="minimalist-banner-section">
      <Carousel 
        className="minimalist-banner-carousel" 
        fade 
        indicators={false}
        controls={false}
        interval={5000}
      >
        {activeBanners.map((banner, index) => (
          <Carousel.Item key={banner.id}>
            <div className="minimalist-banner-item">
              <div className="minimalist-banner-image">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              
              <div className="minimalist-banner-content">
                <div className="minimalist-banner-text">
                  <h1 className="minimalist-banner-title">
                    {banner.title}
                  </h1>
                  {banner.description && (
                    <p className="minimalist-banner-description">
                      {banner.description}
                    </p>
                  )}
                  {banner.link_url && banner.button_text && (
                    <Link 
                      to={banner.link_url} 
                      className="minimalist-banner-button"
                    >
                      {banner.button_text}
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Minimalist indicators */}
              <div className="minimalist-banner-indicators">
                {activeBanners.map((_, i) => (
                  <div 
                    key={i}
                    className={`minimalist-indicator ${i === 0 ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
      
    </section>
  );
};

export default BannerCarousel;