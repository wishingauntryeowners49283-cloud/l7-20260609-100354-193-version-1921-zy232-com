(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    const button = document.querySelector(".menu-button");
    const nav = document.getElementById("mobile-nav");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupCarousel() {
    const hero = document.querySelector("[data-carousel]");

    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dots button"));
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
        dot.setAttribute("aria-selected", dotIndex === current ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    const input = document.getElementById("site-search");
    const year = document.getElementById("year-filter");
    const type = document.getElementById("type-filter");
    const cards = Array.from(document.querySelectorAll("[data-search]"));
    const empty = document.querySelector(".empty-state");

    if (!cards.length || (!input && !year && !type)) {
      return;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      const keyword = normalize(input ? input.value : "");
      const yearValue = normalize(year ? year.value : "");
      const typeValue = normalize(type ? type.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute("data-search"));
        const matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        const matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
        const showCard = matchesKeyword && matchesYear && matchesType;

        card.hidden = !showCard;

        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupFilters();
  });
})();
