import { useEffect } from 'react';

export const useScrollParallax = (selector = '.parallax-element', speed = 0.5) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const handleScroll = () => {
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Calculate parallax offset based on scroll position
        const offset = (windowHeight - elementTop) * speed;
        element.style.transform = `translateY(${offset}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selector, speed]);
};

export const use3DScroll = (selector = '.perspective-element') => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const handleScroll = () => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerY = window.innerHeight / 2;
        const elementCenterY = rect.top + rect.height / 2;
        const distanceFromCenter = elementCenterY - centerY;

        // Calculate 3D rotation based on scroll position
        const rotationX = (distanceFromCenter / window.innerHeight) * 15;
        const scale = 1 - Math.abs(distanceFromCenter) / (window.innerHeight * 2) * 0.1;

        element.style.transform = `perspective(1000px) rotateX(${rotationX}deg) scale(${scale})`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selector]);
};

export const useScrollScale = (selector = '.scale-on-scroll') => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const handleScroll = () => {
            const rect = entry.target.getBoundingClientRect();
            const scrollProgress = 1 - (rect.top / window.innerHeight);
            const scale = Math.min(1, 0.8 + scrollProgress * 0.2);
            entry.target.style.transform = `scale(${scale})`;
          };

          window.addEventListener('scroll', handleScroll, { passive: true });
          entry.target._scrollHandler = handleScroll;
        } else if (entry.target._scrollHandler) {
          window.removeEventListener('scroll', entry.target._scrollHandler);
          delete entry.target._scrollHandler;
        }
      });
    }, { threshold: 0 });

    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => {
        if (el._scrollHandler) {
          window.removeEventListener('scroll', el._scrollHandler);
        }
        observer.unobserve(el);
      });
    };
  }, [selector]);
};
