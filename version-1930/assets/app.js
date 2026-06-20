(function () {
    var mobileToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var next = slider.querySelector('[data-hero-next]');
        var prev = slider.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
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
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                restart();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupQuickSearch() {
        var forms = document.querySelectorAll('[data-quick-search]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"], input[type="search"]');
                var query = input ? input.value.trim() : '';
                var target = 'search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupFilters() {
        var scopes = document.querySelectorAll('[data-filter-scope]');
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var category = scope.querySelector('[data-filter-category]');
            var year = scope.querySelector('[data-filter-year]');
            var type = scope.querySelector('[data-filter-type]');
            var region = scope.querySelector('[data-filter-region]');
            var grid = document.querySelector('[data-filter-grid]');
            var empty = document.querySelector('[data-empty-state]');

            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .rank-row'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function valueOf(select) {
                return select ? select.value.trim() : '';
            }

            function run() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var wantedCategory = valueOf(category);
                var wantedYear = valueOf(year);
                var wantedType = valueOf(type);
                var wantedRegion = valueOf(region);
                var visible = 0;

                cards.forEach(function (card) {
                    var title = (card.getAttribute('data-title') || '').toLowerCase();
                    var tags = (card.getAttribute('data-tags') || '').toLowerCase();
                    var cardRegion = card.getAttribute('data-region') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardCategory = card.getAttribute('data-category') || '';
                    var textMatch = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1 || cardRegion.toLowerCase().indexOf(query) !== -1 || cardType.toLowerCase().indexOf(query) !== -1 || cardYear.indexOf(query) !== -1;
                    var categoryMatch = !wantedCategory || wantedCategory === cardCategory;
                    var yearMatch = !wantedYear || wantedYear === cardYear;
                    var typeMatch = !wantedType || cardType.indexOf(wantedType) !== -1;
                    var regionMatch = !wantedRegion || cardRegion.indexOf(wantedRegion) !== -1;
                    var shouldShow = textMatch && categoryMatch && yearMatch && typeMatch && regionMatch;

                    card.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, category, year, type, region].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', run);
                    control.addEventListener('change', run);
                }
            });

            run();
        });
    }

    function setupPlayer() {
        var box = document.querySelector('[data-player]');
        if (!box) {
            return;
        }

        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-video-url');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !source) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    }
                });
                return;
            }

            video.src = source;
        }

        function start() {
            attach();
            if (button) {
                button.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupQuickSearch();
        setupFilters();
        setupPlayer();
    });
})();
