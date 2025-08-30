// Performance optimization utilities

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical images
  const criticalImages = [
    '/ic/logo.svg',
    '/banner/banner0.webp',
    '/banner/banner1.webp'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Preload critical routes
export const preloadCriticalRoutes = () => {
  const criticalRoutes = [
    () => import('../pages/Products'),
    () => import('../pages/Purchase'),
    () => import('../pages/Payme')
  ];

  // Preload on user interaction
  const preloadRoutes = () => {
    criticalRoutes.forEach(route => route());
    window.removeEventListener('mousemove', preloadRoutes);
    window.removeEventListener('touchstart', preloadRoutes);
  };

  window.addEventListener('mousemove', preloadRoutes, { once: true });
  window.addEventListener('touchstart', preloadRoutes, { once: true });
};

// Optimize images loading
export const optimizeImageLoading = () => {
  // Use Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Debounce function for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory management
export const cleanupMemory = () => {
  // Clear unused event listeners
  if (window.gc) {
    window.gc();
  }
  
  // Clear unused images from cache
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name !== 'vite-plugin-pwa') {
          caches.delete(name);
        }
      });
    });
  }
};

// Performance monitoring
export const monitorPerformance = () => {
  if ('performance' in window) {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift') {
          console.log('CLS:', entry.value);
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }
};

// Initialize all performance optimizations
export const initPerformanceOptimizations = () => {
  preloadCriticalResources();
  preloadCriticalRoutes();
  optimizeImageLoading();
  monitorPerformance();
  
  // Cleanup memory periodically
  setInterval(cleanupMemory, 5 * 60 * 1000); // Every 5 minutes
};
