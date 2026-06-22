import { useEffect } from 'react';

export const useScrollReveal = (selector = '.slide-in-up', dependencies = []) => {
  useEffect(() => {
    // Wait a brief tick to ensure DOM is fully painted
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.05, // Trigger as soon as 5% of the element is visible
          rootMargin: '0px 0px -50px 0px' // Slightly offset trigger line
        }
      );

      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, dependencies);
};
