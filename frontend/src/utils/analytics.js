/**
 * Analytics and User Tracking
 * Para mejorar la experiencia del cliente y optimizar conversiones
 */

// Google Analytics 4 Integration
export const initGoogleAnalytics = () => {
  if (process.env.REACT_APP_GA_TRACKING_ID) {
    // Cargar Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_GA_TRACKING_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', process.env.REACT_APP_GA_TRACKING_ID);
  }
};

// Track page views
export const trackPageView = (pageName, pageTitle) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_name: pageName
    });
  }
  
  // También enviar a nuestro backend para análisis propio
  fetch('/analytics/page-view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: pageName,
      title: pageTitle,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    })
  }).catch(err => console.log('Analytics error:', err));
};

// Track product views
export const trackProductView = (productId, productName, category, price) => {
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price
      }]
    });
  }
  
  // Enviar a nuestro backend
  fetch('/analytics/product-view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      productName,
      category,
      price,
      timestamp: new Date().toISOString()
    })
  }).catch(err => console.log('Analytics error:', err));
};

// Track add to cart
export const trackAddToCart = (productId, productName, category, price, quantity = 1) => {
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
        quantity: quantity
      }]
    });
  }
  
  // Enviar a nuestro backend
  fetch('/analytics/add-to-cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      productName,
      category,
      price,
      quantity,
      timestamp: new Date().toISOString()
    })
  }).catch(err => console.log('Analytics error:', err));
};

// Track purchase
export const trackPurchase = (transactionId, value, currency = 'USD', items) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }
  
  // Enviar a nuestro backend
  fetch('/analytics/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactionId,
      value,
      currency,
      items,
      timestamp: new Date().toISOString()
    })
  }).catch(err => console.log('Analytics error:', err));
};

// Track search
export const trackSearch = (searchTerm, resultsCount) => {
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }
  
  // Enviar a nuestro backend
  fetch('/analytics/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      searchTerm,
      resultsCount,
      timestamp: new Date().toISOString()
    })
  }).catch(err => console.log('Analytics error:', err));
};

// Track user engagement
export const trackUserEngagement = (action, details = {}) => {
  // Enviar a nuestro backend para análisis de comportamiento
  fetch('/analytics/engagement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      details,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: getUserId()
    })
  }).catch(err => console.log('Analytics error:', err));
};

// Helper functions
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

const getUserId = () => {
  // Obtener ID del usuario si está autenticado
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user ? user.id : null;
};

// Track scroll depth
export const trackScrollDepth = () => {
  let maxScroll = 0;
  
  window.addEventListener('scroll', () => {
    const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (scrollDepth > maxScroll) {
      maxScroll = scrollDepth;
      
      // Track milestone scroll depths
      if (maxScroll >= 25 && maxScroll < 50) {
        trackUserEngagement('scroll_25');
      } else if (maxScroll >= 50 && maxScroll < 75) {
        trackUserEngagement('scroll_50');
      } else if (maxScroll >= 75 && maxScroll < 90) {
        trackUserEngagement('scroll_75');
      } else if (maxScroll >= 90) {
        trackUserEngagement('scroll_90');
      }
    }
  });
};

// Track time on page
export const trackTimeOnPage = (pageName) => {
  const startTime = Date.now();
  
  window.addEventListener('beforeunload', () => {
    const timeSpent = Date.now() - startTime;
    trackUserEngagement('time_on_page', {
      page: pageName,
      timeSpent: timeSpent
    });
  });
};

// Heatmap tracking (simplified)
export const trackClick = (element, pageName) => {
  element.addEventListener('click', (e) => {
    trackUserEngagement('click', {
      page: pageName,
      element: element.tagName,
      className: element.className,
      id: element.id,
      text: element.textContent?.substring(0, 50),
      position: {
        x: e.clientX,
        y: e.clientY
      }
    });
  });
};

// A/B Testing helper
export const getABTestVariant = (testName) => {
  let variant = localStorage.getItem(`ab_test_${testName}`);
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(`ab_test_${testName}`, variant);
  }
  return variant;
};

export const trackABTest = (testName, variant, action) => {
  trackUserEngagement('ab_test', {
    testName,
    variant,
    action
  });
};
