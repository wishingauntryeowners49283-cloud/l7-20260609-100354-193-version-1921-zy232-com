(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    const section = panel.closest('section') || document;
    const list = section.querySelector('[data-filter-list]');
    const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];
    const keyword = panel.querySelector('.page-filter-input');
    const selects = Array.from(panel.querySelectorAll('[data-filter-select]'));

    if (!cards.length) {
      return;
    }

    const apply = function () {
      const term = (keyword ? keyword.value : '').trim().toLowerCase();
      const filters = {};
      selects.forEach(function (select) {
        filters[select.dataset.filterSelect] = select.value;
      });
      cards.forEach(function (card) {
        const haystack = (card.dataset.title || '').toLowerCase();
        const matchTerm = !term || haystack.includes(term);
        const matchYear = !filters.year || card.dataset.year === filters.year;
        const matchType = !filters.type || (card.dataset.type || '').includes(filters.type);
        const matchCategory = !filters.category || card.dataset.category === filters.category;
        card.classList.toggle('is-hidden', !(matchTerm && matchYear && matchType && matchCategory));
      });
    };

    if (keyword) {
      keyword.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  });

  const jump = document.querySelector('[data-player-jump]');

  if (jump) {
    jump.addEventListener('click', function (event) {
      event.preventDefault();
      const shell = document.querySelector('[data-player]');
      if (shell) {
        shell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const overlay = shell.querySelector('.play-overlay');
        if (overlay) {
          overlay.focus();
        }
      }
    });
  }
})();
