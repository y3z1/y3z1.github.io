document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;

  // ===== Helpers =====
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const lockBodyScroll = (locked) => {
    // Evita scroll detrás del menú en móvil
    document.body.style.overflow = locked ? 'hidden' : '';
  };

  // ===== Language (persist + stable toggle + a11y) =====
  const langToggle = document.getElementById('langToggle');

  const setLang = (lang) => {
    const safeLang = (lang === 'en' || lang === 'es') ? lang : 'es';

    html.setAttribute('data-lang', safeLang);
    html.lang = safeLang; // clave para accesibilidad/SEO

    if (langToggle) {
      langToggle.setAttribute('data-lang', safeLang);
      langToggle.setAttribute(
        'aria-label',
        safeLang === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'
      );
    }

    localStorage.setItem('lang', safeLang);

    // Cierra menú móvil si está abierto
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('open');

    const burgerBtn = document.getElementById('burgerBtn');
    if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'false');
    lockBodyScroll(false);
  };

  const savedLang = localStorage.getItem('lang');
  const initialLang = savedLang || html.getAttribute('data-lang') || 'es';
  setLang(initialLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-lang') || 'es';
      setLang(current === 'es' ? 'en' : 'es');
    });
  }

  // ===== Mobile nav (a11y improved) =====
  const burgerBtn = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');

  const openNav = () => {
    if (!navLinks || !burgerBtn) return;
    navLinks.classList.add('open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    lockBodyScroll(true);
  };

  const closeNav = () => {
    if (!navLinks || !burgerBtn) return;
    navLinks.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    lockBodyScroll(false);
  };

  const toggleNav = () => {
    if (!navLinks || !burgerBtn) return;
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeNav() : openNav();
  };

  if (burgerBtn && navLinks) {
    // Asegura atributos ARIA útiles
    burgerBtn.setAttribute('aria-controls', 'navLinks');
    burgerBtn.setAttribute('aria-expanded', 'false');

    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNav();
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => closeNav());
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      const isInside = navLinks.contains(e.target) || burgerBtn.contains(e.target);
      if (!isInside) closeNav();
    });

    // Close with ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Close on resize to desktop (evita quedarse "bloqueado")
    window.addEventListener('resize', () => {
      if (window.innerWidth > 840) closeNav();
    }, { passive: true });
  }

  // ===== IntersectionObserver guard =====
  const hasIO = 'IntersectionObserver' in window;

  // ===== Scroll reveal =====
  const revealElements = document.querySelectorAll('.reveal');
  if (hasIO && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // fallback: muestra todo sin animación
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // ===== Skill bar animation =====
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  if (hasIO && !prefersReducedMotion) {
    const skillsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const value = Number(bar.getAttribute('data-skill')) || 0;
          bar.style.width = `${Math.max(0, Math.min(value, 100))}%`;
          obs.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });
    skillBars.forEach(bar => skillsObserver.observe(bar));
  } else {
    // fallback: set width immediately
    skillBars.forEach(bar => {
      const value = Number(bar.getAttribute('data-skill')) || 0;
      bar.style.width = `${Math.max(0, Math.min(value, 100))}%`;
    });
  }

  // ===== Scrollspy for nav (más estable con header sticky) =====
  const sections = document.querySelectorAll('main section[id]');
  const navLinkElements = document.querySelectorAll('.nav-link');

  // Marca sección cuando su top entra en una "ventana" debajo del header
  // Ajusta -88px si cambias la altura del header
  if (hasIO) {
    const scrollSpyObserver = new IntersectionObserver((entries) => {
      // Elegimos la entrada más cercana/visible
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const id = visible.target.getAttribute('id');
      navLinkElements.forEach(link => {
        const href = (link.getAttribute('href') || '').replace('#', '');
        link.classList.toggle('active', href === id);
      });
    }, {
      root: null,
      // top margin “empuja” la zona activa por debajo del header
      rootMargin: '-88px 0px -55% 0px',
      threshold: [0.15, 0.25, 0.35]
    });

    sections.forEach(section => scrollSpyObserver.observe(section));
  }

  // ===== Parallax suave (throttled with rAF + reduced motion safe) =====
  const heroVisual = document.querySelector('.hero-visual-inner');
  if (heroVisual && !prefersReducedMotion) {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const factor = Math.min(scrollY / 600, 1);
        heroVisual.style.transform = `translateY(${factor * -12}px) scale(${1 + factor * 0.02})`;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
});
