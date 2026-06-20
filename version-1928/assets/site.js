(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector(".mobile-menu-button");
  var mobilePanel = document.querySelector("#mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("#hero-slider");

  if (hero) {
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var nextButton = hero.querySelector("[data-hero-next]");
    var prevButton = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restart();
      });
    });

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    restart();
  }

  selectAll(".catalog-page").forEach(function (page) {
    var input = page.querySelector("[data-catalog-search]");
    var sort = page.querySelector("[data-catalog-sort]");
    var grid = page.querySelector("[data-catalog-grid]");

    if (!grid) {
      return;
    }

    function filterCatalog() {
      var value = input ? input.value.trim().toLowerCase() : "";
      var cards = selectAll(".movie-card", grid);

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var visible = !value || text.indexOf(value) !== -1 || title.indexOf(value) !== -1;
        card.classList.toggle("is-hidden", !visible);
      });
    }

    function sortCatalog() {
      var cards = selectAll(".movie-card", grid);
      var mode = sort ? sort.value : "year";

      cards.sort(function (a, b) {
        if (mode === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }

        if (mode === "views") {
          return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
        }

        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", filterCatalog);
    }

    if (sort) {
      sort.addEventListener("change", function () {
        sortCatalog();
        filterCatalog();
      });
    }

    sortCatalog();
  });

  var searchGrid = document.querySelector("[data-search-grid]");
  var searchInput = document.querySelector("[data-search-input]");
  var emptyState = document.querySelector("[data-empty-state]");

  if (searchGrid) {
    var query = new URLSearchParams(window.location.search).get("q") || "";

    if (searchInput) {
      searchInput.value = query;
    }

    function applySearch() {
      var value = searchInput ? searchInput.value.trim().toLowerCase() : query.trim().toLowerCase();
      var cards = selectAll(".movie-card", searchGrid);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var visible = !value || text.indexOf(value) !== -1 || title.indexOf(value) !== -1;
        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applySearch);
    }

    applySearch();
  }
})();
