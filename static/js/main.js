document.addEventListener('DOMContentLoaded', () => {
  const globalMenu = document.querySelector('.global-menu');
  const menuToggle = document.querySelector('.menu-toggle');

  if (globalMenu && menuToggle) {
    const closeMenu = () => {
      globalMenu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = globalMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    globalMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }

  // Floating "Back to top" button (desktop/laptop only)
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const updateBackToTop = () => {
      // Hide on small screens
      if (window.innerWidth <= 900) {
        backToTop.classList.remove('is-visible');
        return;
      }
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
    };

    backToTop.addEventListener('click', (event) => {
      event.preventDefault();
      const prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    window.addEventListener('resize', updateBackToTop);
    updateBackToTop();
  }

  // Sync the first project image height to the text column height
  const syncFirstImageHeight = () => {
    const project = document.querySelector('.project');
    if (!project) return;
    const info = project.querySelector('.project-info');
    const firstFigure = project.querySelector('.project-gallery-item--first');
    const img = firstFigure && firstFigure.querySelector('img');
    if (!info || !firstFigure || !img) return;
    // Reset on small screens
    if (window.innerWidth <= 900) {
      firstFigure.style.height = '';
      img.style.height = '';
      return;
    }
    const infoRect = info.getBoundingClientRect();
    const infoHeight = Math.round(infoRect.height);
    if (infoHeight > 0) {
      firstFigure.style.height = `${infoHeight}px`;
      img.style.height = '100%';
    }
  };
  // Recompute on load, resize, and after fonts load
  window.addEventListener('load', syncFirstImageHeight);
  window.addEventListener('resize', syncFirstImageHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncFirstImageHeight).catch(() => {});
  }
  // Run once on DOM ready
  requestAnimationFrame(syncFirstImageHeight);

  // Home page: the large section menu swaps the image panel on hover/focus
  const homeMenu = document.querySelector('.home-menu');
  if (homeMenu) {
    const items = Array.from(homeMenu.querySelectorAll('.home-menu__item'));
    const visualPanel = document.querySelector('.home-visual');
    const visuals = Array.from(document.querySelectorAll('.home-visual__item'));
    const defaultKey = visuals.length ? visuals[0].getAttribute('data-visual') : null;
    // Show the image for a menu item; items without an image leave the panel blank
    const showVisual = (key) => {
      let matched = false;
      visuals.forEach((el) => {
        const isMatch = el.getAttribute('data-visual') === key;
        el.classList.toggle('is-active', isMatch);
        if (isMatch) matched = true;
      });
      if (visualPanel) visualPanel.classList.toggle('is-blank', !matched);
    };

    // Architecture gallery: while "Architecture" is hovered the panel steps
    // through the project images, one every 2 seconds, and pauses on leave.
    const GALLERY_INTERVAL = 2000;
    const gallery = document.querySelector('.home-visual__item[data-gallery]');
    const galleryKey = gallery ? gallery.getAttribute('data-visual') : null;
    const slides = gallery ? Array.from(gallery.querySelectorAll('img')) : [];
    const caption = gallery ? gallery.querySelector('.home-visual__caption') : null;
    let slideIndex = 0;
    let galleryTimer = null;
    let leavingTimer = null;
    const isLoaded = (img) => img.complete && img.naturalWidth > 0;
    const showSlide = (index) => {
      if (index === slideIndex) return;
      const previous = slides[slideIndex];
      const next = slides[index];
      slides.forEach((img) => img.classList.remove('is-leaving'));
      // The outgoing image stays fully visible underneath while the next fades in
      previous.classList.remove('is-current');
      previous.classList.add('is-leaving');
      next.classList.add('is-current');
      if (caption) caption.textContent = next.getAttribute('data-caption') || '';
      slideIndex = index;
      window.clearTimeout(leavingTimer);
      leavingTimer = window.setTimeout(() => previous.classList.remove('is-leaving'), 800);
    };
    const nextSlide = () => {
      // Skip images that have not finished loading yet
      for (let step = 1; step < slides.length; step += 1) {
        const index = (slideIndex + step) % slides.length;
        if (isLoaded(slides[index])) { showSlide(index); return; }
      }
    };
    // The extra images are fetched after the page itself (or on first hover)
    const loadSlides = () => {
      slides.forEach((img) => {
        const src = img.getAttribute('data-src');
        if (src && !img.getAttribute('src')) img.setAttribute('src', src);
      });
    };
    const startGallery = () => {
      if (slides.length < 2 || galleryTimer) return;
      loadSlides();
      galleryTimer = window.setInterval(nextSlide, GALLERY_INTERVAL);
    };
    const stopGallery = () => {
      window.clearInterval(galleryTimer);
      galleryTimer = null;
    };
    // Preload once the page has loaded, on devices that have a mouse or trackpad
    if (slides.length > 1 && window.matchMedia('(any-hover: hover)').matches) {
      if (document.readyState === 'complete') loadSlides();
      else window.addEventListener('load', loadSlides);
    }

    const activate = (item) => {
      const key = item.getAttribute('data-visual');
      items.forEach((el) => el.classList.toggle('is-active', el === item));
      homeMenu.classList.add('has-active');
      showVisual(key);
      if (key === galleryKey) startGallery();
      else stopGallery();
    };
    const clear = () => {
      items.forEach((el) => el.classList.remove('is-active'));
      homeMenu.classList.remove('has-active');
      showVisual(defaultKey);
      stopGallery();
    };
    items.forEach((item) => {
      item.addEventListener('mouseenter', () => activate(item));
      item.addEventListener('focus', () => activate(item));
      item.addEventListener('blur', clear);
    });
    homeMenu.addEventListener('mouseleave', clear);
  }

  const sliders = Array.from(document.querySelectorAll('.slider'));
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    if (!slides.length) return;

    const interval = parseInt(slider.getAttribute('data-interval') || '6000', 10);
    const dots = Array.from(slider.querySelectorAll('.dot'));
    const prevArrow = slider.querySelector('.slider-arrow--prev');
    const nextArrow = slider.querySelector('.slider-arrow--next');
    const slidesContainer = slider.querySelector('.slides');
    let index = slides.findIndex((s) => s.classList.contains('is-active'));
    if (index < 0) index = 0;
    let timerId;
    let isAnimating = false;

    const updateDots = () => {
      dots.forEach((d, i) => {
        if (i === index) d.classList.add('is-active');
        else d.classList.remove('is-active');
      });
    };

    const updateHeight = () => {
      if (!slidesContainer) return;
      const active = slides[index];
      if (!active) return;
      const rect = active.getBoundingClientRect();
      if (rect.height > 0) {
        slidesContainer.style.height = `${rect.height}px`;
        return;
      }
      const img = active.querySelector('img');
      const containerWidth = slidesContainer.getBoundingClientRect().width;
      if (img && img.naturalWidth && img.naturalHeight && containerWidth > 0) {
        const estimated = Math.round((img.naturalHeight / img.naturalWidth) * containerWidth);
        slidesContainer.style.height = `${estimated}px`;
      }
    };

    const goTo = (i) => {
      if (!slides.length) return;
      if (isAnimating) return;
      const nextIndex = (i + slides.length) % slides.length;
      if (nextIndex === index) return;

      const current = slides[index];
      const next = slides[nextIndex];
      if (!current || !next) return;

      isAnimating = true;
      // Prepare next slide entering from top
      next.classList.remove('is-active');
      next.classList.add('from-top');
      // Ensure container keeps height during transition
      updateHeight();
      // Force reflow so the starting transform is applied
      void next.getBoundingClientRect();
      // Start transitions
      current.classList.add('is-exiting');
      next.classList.add('is-entering');
      next.classList.remove('from-top');

      const onDone = () => {
        next.removeEventListener('transitionend', onDone);
        current.classList.remove('is-active', 'is-exiting');
        next.classList.remove('is-entering');
        next.classList.add('is-active');
        index = nextIndex;
        updateDots();
        updateHeight();
        isAnimating = false;
      };
      next.addEventListener('transitionend', onDone, { once: true });
    };

    const tick = () => {
      goTo(index + 1);
    };

    const stop = () => {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = undefined;
      }
    };

    const start = () => {
      if (slides.length < 2) return;
      stop();
      timerId = window.setInterval(tick, interval);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        start();
      });
    });

    if (prevArrow) {
      prevArrow.addEventListener('click', (event) => {
        event.preventDefault();
        goTo(index - 1);
        start();
      });
    }

    if (nextArrow) {
      nextArrow.addEventListener('click', (event) => {
        event.preventDefault();
        goTo(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    if (slides.length > 1 && slider.closest('.image-gallery')) {
      const slidesContainer = slider.querySelector('.slides');
      if (slidesContainer) {
        slidesContainer.addEventListener('click', (event) => {
          const rect = slidesContainer.getBoundingClientRect();
          const clickX = event.clientX - rect.left;
          if (clickX >= rect.width / 2) {
            goTo(index + 1);
          } else {
            goTo(index - 1);
          }
          start();
        });
      }
    }

    // Update height when images load and on resize
    slides.forEach((s) => {
      const img = s.querySelector('img');
      if (img) {
        img.addEventListener('load', updateHeight);
      }
    });
    window.addEventListener('resize', updateHeight);

    // Initial height sync and start autoplay
    updateDots();
    // Defer height calculation to next frame to ensure styles applied
    requestAnimationFrame(updateHeight);
    start();
  });
});


