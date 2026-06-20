(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var sliders = document.querySelectorAll('[data-hero-slider]');

    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        slider.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });

        slider.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    });

    var scopes = document.querySelectorAll('[data-search-scope]');

    scopes.forEach(function (scope) {
        var searchInput = scope.querySelector('[data-card-search]');
        var typeSelect = scope.querySelector('[data-card-select]');
        var yearSelect = scope.querySelector('[data-year-select]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
        var emptyState = scope.querySelector('[data-empty-state]');

        if (!cards.length) {
            return;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var selectedType = normalize(typeSelect ? typeSelect.value : '');
            var selectedYear = normalize(yearSelect ? yearSelect.value : '');
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search-text'));
                var typeText = normalize(card.getAttribute('data-type'));
                var yearText = normalize(card.getAttribute('data-year'));
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var typeMatch = !selectedType || typeText.indexOf(selectedType) !== -1;
                var yearMatch = !selectedYear || yearText === selectedYear;
                var visible = keywordMatch && typeMatch && yearMatch;

                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    });
})();
