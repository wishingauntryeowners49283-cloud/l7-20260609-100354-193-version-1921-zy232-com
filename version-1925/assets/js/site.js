(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var searchInput = document.querySelector('[data-site-search]');
    var searchItems = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));

    if (searchInput && searchItems.length) {
      searchInput.addEventListener('input', function () {
        var query = searchInput.value.trim().toLowerCase();

        searchItems.forEach(function (item) {
          var text = (item.getAttribute('data-text') || item.getAttribute('data-title') || '').toLowerCase();
          item.classList.toggle('hidden-by-search', query.length > 0 && text.indexOf(query) === -1);
        });
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        slides[index].classList.remove('active');
        index = (nextIndex + slides.length) % slides.length;
        slides[index].classList.add('active');
      }

      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function reset() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          reset();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          reset();
        });
      }

      start();
    }
  });
})();
