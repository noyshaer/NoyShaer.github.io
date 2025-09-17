document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const interval = parseInt(slider.getAttribute('data-interval') || '3000', 10);
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dots = Array.from(slider.querySelectorAll('.dot'));
  let index = slides.findIndex(s => s.classList.contains('is-active'));
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

  const start = () => {
    stop();
    timerId = window.setInterval(tick, interval);
  };
  const stop = () => {
    if (timerId) window.clearInterval(timerId);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  start();
});


