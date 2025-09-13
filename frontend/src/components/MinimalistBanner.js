import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useBannerStore from '../store/bannerStore';
import '../styles/minimalist-banner.css';

const MinimalistBanner = () => {
  const { activeBanners, loading, fetchActiveBanners } = useBannerStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

  useEffect(() => {
    if (activeBanners && activeBanners.length > 1 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeBanners, isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    if (activeBanners) {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }
  };

  const prevSlide = () => {
    if (activeBanners) {
      setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
  };

  if (loading.activeBanners) {
    return (
      <div className="minimalist-banner-skeleton">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-description"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    );
  }

  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentSlide];

  return (
    <section className="minimalist-hero-banner">
      <div 
        className="minimalist-hero-container"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background Image */}
        <div className="minimalist-hero-background">
          <img
            src={currentBanner.image_url}
            alt={currentBanner.title}
            loading="eager"
          />
          <div className="minimalist-hero-overlay"></div>
        </div>

        {/* Content */}
        <div className="minimalist-hero-content">
          <div className="minimalist-hero-text">
            <h1 className="minimalist-hero-title">
              {currentBanner.title}
            </h1>
            {currentBanner.description && (
              <p className="minimalist-hero-description">
                {currentBanner.description}
              </p>
            )}
            {currentBanner.link_url && currentBanner.button_text && (
              <Link 
                to={currentBanner.link_url} 
                className="minimalist-hero-cta"
              >
                {currentBanner.button_text}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        {activeBanners.length > 1 && (
          <>
            {/* Arrow Navigation */}
            <button 
              className="minimalist-hero-nav minimalist-hero-prev"
              onClick={prevSlide}
              aria-label="Previous banner"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button 
              className="minimalist-hero-nav minimalist-hero-next"
              onClick={nextSlide}
              aria-label="Next banner"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dots Navigation */}
            <div className="minimalist-hero-dots">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  className={`minimalist-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

    </section>
  );
};

export default MinimalistBanner;
