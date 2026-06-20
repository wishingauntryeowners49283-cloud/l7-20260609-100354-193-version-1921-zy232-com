(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        var setSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                setSlide(index);
                start();
            });
        });

        setSlide(0);
        start();
    }

    var filterInput = document.querySelector('[data-movie-filter]');

    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q') || '';

        var applyFilter = function () {
            var keyword = filterInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                card.classList.toggle('is-hidden', keyword !== '' && text.indexOf(keyword) === -1);
            });
        };

        filterInput.value = initialKeyword;
        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }
})();
