document.addEventListener('DOMContentLoaded', () => {
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


