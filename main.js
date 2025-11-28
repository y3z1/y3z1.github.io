
document.addEventListener('DOMContentLoaded', () => {
  // ----- Language toggle (botón único ES/EN) -----
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-lang') || 'es';
      const next = current === 'es' ? 'en' : 'es';
      document.documentElement.setAttribute('data-lang', next);
      langToggle.setAttribute('data-lang', next);
    });
  }

  // ----- Mobile nav -----
  const burgerBtn = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ----- Scroll reveal -----
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach(el => revealObserver.observe(el));

  // ----- Skill bar animation -----
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const value = bar.getAttribute('data-skill') || 0;
        bar.style.width = value + '%';
        skillsObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  skillBars.forEach(bar => skillsObserver.observe(bar));

  // ----- Scrollspy for nav -----
  const sections = document.querySelectorAll('main section[id]');
  const navLinkElements = document.querySelectorAll('.nav-link');
  const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkElements.forEach(link => {
          const href = (link.getAttribute('href') || '').replace('#', '');
          link.classList.toggle('active', href === id);
        });
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(section => scrollSpyObserver.observe(section));

  // ----- Parallax suave en el hero visual -----
  const heroVisual = document.querySelector('.hero-visual-inner');
  if (heroVisual) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const factor = Math.min(scrollY / 600, 1);
      heroVisual.style.transform = `translateY(${factor * -12}px) scale(${1 + factor * 0.02})`;
    });
  }
});