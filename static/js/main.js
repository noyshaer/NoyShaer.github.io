document.addEventListener('DOMContentLoaded', () => {
  const sliders = Array.from(document.querySelectorAll('.slider'));
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    if (!slides.length) return;

    const interval = parseInt(slider.getAttribute('data-interval') || '3000', 10);
    const dots = Array.from(slider.querySelectorAll('.dot'));
    let index = slides.findIndex((s) => s.classList.contains('is-active'));
    if (index < 0) index = 0;
    let timerId;

    const goTo = (i) => {
      slides[index]?.classList.remove('is-active');
      dots[index]?.classList.remove('is-active');
      index = (i + slides.length) % slides.length;
      slides[index]?.classList.add('is-active');
      dots[index]?.classList.add('is-active');
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

    start();
  });
});


