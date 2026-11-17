// Menu shrink/expand animation between the home page and the section pages.
//
// The browser's cross-document view transition (enabled in styles.css) morphs
// the name, tagline and menu entries between their large home-page positions
// and the small side menu. This script only decides WHEN it may run:
//   - only when the move starts or ends on the home page
//   - never between two section pages
//   - never on phone-sized screens or when the visitor prefers reduced motion
//
// It must load as a plain (blocking) script in <head>: the 'pagereveal' event
// fires before the first paint, earlier than deferred scripts run.
(function () {
  var isHome = function (url) {
    try {
      var path = new URL(url, window.location.href).pathname;
      return path === '/' || path === '/index.html';
    } catch (err) {
      return false;
    }
  };

  window.addEventListener('pagereveal', function (event) {
    var transition = event.viewTransition;
    if (!transition) return;

    var fromUrl = '';
    if (window.navigation && window.navigation.activation && window.navigation.activation.from) {
      fromUrl = window.navigation.activation.from.url || '';
    } else {
      fromUrl = document.referrer;
    }

    var involvesHome = isHome(window.location.href) || (fromUrl !== '' && isHome(fromUrl));
    var smallScreen = window.matchMedia('(max-width: 900px)').matches;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!involvesHome || smallScreen || reducedMotion) {
      transition.skipTransition();
      return;
    }

    // The menu arrives by morphing, so CSS skips the home page's own entrance
    // animation for this page view (the class stays until the page is reloaded).
    document.documentElement.classList.add('vt-arrived');
  });
})();
