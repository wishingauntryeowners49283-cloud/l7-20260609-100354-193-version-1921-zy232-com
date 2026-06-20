(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        var hero = document.querySelector(".hero-carousel");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }
        show(0);
        start();
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"" + movie.page + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"play-badge\">播放</span>",
            "</a>",
            "<div class=\"card-body\">",
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
            "<h3><a href=\"" + movie.page + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"card-tags\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[character];
        });
    }

    function setupSearch() {
        var form = document.getElementById("search-form");
        var input = document.getElementById("search-input");
        var typeFilter = document.getElementById("type-filter");
        var regionFilter = document.getElementById("region-filter");
        var results = document.getElementById("search-results");
        var status = document.getElementById("search-status");
        if (!form || !input || !results || !Array.isArray(window.movieIndex)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }

        function matches(movie, keyword, typeValue, regionValue) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].concat(movie.tags || []).join(" ").toLowerCase();
            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okType = !typeValue || movie.type.indexOf(typeValue) !== -1 || movie.genre.indexOf(typeValue) !== -1;
            var okRegion = !regionValue || movie.region.indexOf(regionValue) !== -1;
            return okKeyword && okType && okRegion;
        }

        function run() {
            var keyword = input.value.trim().toLowerCase();
            var typeValue = typeFilter ? typeFilter.value : "";
            var regionValue = regionFilter ? regionFilter.value : "";
            var filtered = window.movieIndex.filter(function (movie) {
                return matches(movie, keyword, typeValue, regionValue);
            }).slice(0, 96);
            if (filtered.length) {
                results.innerHTML = filtered.map(createCard).join("");
                status.textContent = "已为你筛选出相关影片。";
            } else {
                results.innerHTML = "";
                status.textContent = "暂无匹配内容，可以调整关键词或筛选条件。";
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            run();
        });
        input.addEventListener("input", run);
        if (typeFilter) {
            typeFilter.addEventListener("change", run);
        }
        if (regionFilter) {
            regionFilter.addEventListener("change", run);
        }
        if (initial) {
            run();
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });

    window.initMoviePlayer = function (videoId, layerId, url) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        if (!video || !url) {
            return;
        }
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = url;
            }
            attached = true;
        }

        function start() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (layer && video.currentTime === 0) {
                layer.classList.remove("is-hidden");
            }
        });
    };
}());
