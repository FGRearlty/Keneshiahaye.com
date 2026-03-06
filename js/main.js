/* ============================================
   Keneshia Haye Real Estate — Main JS v3
   Premium animations & interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar scroll effect ---
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // --- Mobile menu toggle ---
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('active');
      document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
    });

    links.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll-reveal with stagger ---
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation for sibling elements
        const parent = entry.target.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll('.reveal')) : [];
        const siblingIndex = siblings.indexOf(entry.target);
        const delay = siblingIndex >= 0 ? siblingIndex * 80 : 0;

        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Animate stat counters ---
  const counters = document.querySelectorAll('.hero__stat-number[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let current = 0;
        const duration = 2000;
        const startTime = performance.now();

        function easeOutQuart(t) {
          return 1 - Math.pow(1 - t, 4);
        }

        function animate(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          current = Math.floor(easeOutQuart(progress) * target);
          el.textContent = prefix + current + suffix;
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = prefix + target + suffix;
          }
        }

        requestAnimationFrame(animate);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => countObserver.observe(c));

  // --- Parallax-like effect for hero background ---
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.05)`;
      }
    }, { passive: true });
  }

  // --- Card tilt/glow effect on mouse move ---
  const glowCards = document.querySelectorAll('.service-card, .testimonial-card, .va-benefit, .process-step, .feature-item');
  glowCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
