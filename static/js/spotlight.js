document.addEventListener('DOMContentLoaded', () => {
  // Support both legacy wrapper (.project-gallery) and the new layout where
  // figures are direct items (.project-gallery-item inside .project)
  const galleryRoots = Array.from(document.querySelectorAll('.project-gallery, .project'));
  if (!galleryRoots.length) return;

  let lightboxEl;
  let imgEl;
  let closeBtn;
  let prevBtn;
  let nextBtn;
  let counterEl;
  let activeImages = [];
  let activeIndex = 0;
  let isOpen = false;
  let previousBodyOverflow = '';

  const createLightbox = () => {
    if (lightboxEl) return;
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';

    // Image
    imgEl = document.createElement('img');
    imgEl.className = 'lightbox__img';
    imgEl.alt = '';
    imgEl.draggable = false;

    // Controls
    closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox__button lightbox__close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<svg class="lightbox__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

    prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox__button lightbox__arrow lightbox__arrow--prev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '<svg class="lightbox__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';

    nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox__button lightbox__arrow lightbox__arrow--next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '<svg class="lightbox__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

    counterEl = document.createElement('div');
    counterEl.className = 'lightbox__counter';

    lightboxEl.appendChild(imgEl);
    lightboxEl.appendChild(closeBtn);
    lightboxEl.appendChild(prevBtn);
    lightboxEl.appendChild(nextBtn);
    lightboxEl.appendChild(counterEl);

    document.body.appendChild(lightboxEl);

    // Backdrop click closes (but not clicks on controls/image)
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl) {
        close();
      }
    });

    // Controls
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(activeIndex - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(activeIndex + 1); });

    // Click image advances to next
    imgEl.addEventListener('click', (e) => { e.stopPropagation(); show(activeIndex + 1); });
  };

  const onKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(activeIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(activeIndex + 1);
    }
  };

  const updateCounter = () => {
    if (!counterEl) return;
    if (!activeImages.length) { counterEl.textContent = ''; return; }
    counterEl.textContent = `${activeIndex + 1} / ${activeImages.length}`;
  };

  const preload = (index) => {
    const i = (index + activeImages.length) % activeImages.length;
    const src = activeImages[i] && activeImages[i].currentSrc || activeImages[i] && activeImages[i].src;
    if (!src) return;
    const img = new Image();
    img.src = src;
  };

  const show = (index) => {
    if (!activeImages.length) return;
    activeIndex = (index + activeImages.length) % activeImages.length;
    const active = activeImages[activeIndex];
    if (!active) return;
    const src = active.currentSrc || active.src;
    const alt = active.alt || '';
    imgEl.src = src;
    imgEl.alt = alt;
    updateCounter();
    // Preload neighbors
    preload(activeIndex + 1);
    preload(activeIndex - 1);
  };

  const open = (images, index) => {
    if (!images || !images.length) return;
    createLightbox();
    activeImages = images;
    activeIndex = index || 0;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightboxEl.classList.add('is-open');
    isOpen = true;
    show(activeIndex);
    document.addEventListener('keydown', onKeyDown);
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    lightboxEl.classList.remove('is-open');
    imgEl.removeAttribute('src');
    document.body.style.overflow = previousBodyOverflow || '';
    document.removeEventListener('keydown', onKeyDown);
  };

  // Bind click handlers for every gallery root
  galleryRoots.forEach((root) => {
    // If it's the legacy wrapper, select all imgs.
    // Otherwise, select only gallery item images in the project.
    const imgs = root.matches('.project-gallery')
      ? Array.from(root.querySelectorAll('img'))
      : Array.from(root.querySelectorAll('.project-gallery-item img'));
    if (!imgs.length) return;
    imgs.forEach((imageEl, i) => {
      imageEl.addEventListener('click', (e) => {
        e.preventDefault();
        open(imgs, i);
      });
    });
  });
});


