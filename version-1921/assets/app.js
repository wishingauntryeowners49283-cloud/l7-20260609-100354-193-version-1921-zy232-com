(function () {
    var mobileButton = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("open");
            mobileButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var carousel = document.querySelector("[data-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function goNext() {
            showSlide(index + 1);
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(goNext, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide") || 0));
                restart();
            });
        });

        restart();
    }

    var searchInput = document.querySelector(".movie-search");
    var yearFilter = document.querySelector(".year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value : "");
        var year = yearFilter ? yearFilter.value : "";
        var shown = 0;
        var existing = document.querySelector(".no-match");

        if (existing) {
            existing.remove();
        }

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-category"),
                card.textContent
            ].join(" "));
            var cardYear = String(card.getAttribute("data-year") || "");
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            var visible = matchedKeyword && matchedYear;

            card.style.display = visible ? "" : "none";

            if (visible) {
                shown += 1;
            }
        });

        if (!shown) {
            var grid = cards[0].parentElement;
            var message = document.createElement("div");
            message.className = "no-match";
            message.textContent = "没有找到匹配内容，可调整关键词或年份继续浏览。";
            grid.appendChild(message);
        }
    }

    if (searchInput) {
        try {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query) {
                searchInput.value = query;
            }
        } catch (error) {
            searchInput.value = searchInput.value || "";
        }

        searchInput.addEventListener("input", applyFilter);
    }

    if (yearFilter) {
        yearFilter.addEventListener("change", applyFilter);
    }

    applyFilter();

    function launchPlayer(shell) {
        var video = shell.querySelector("video");

        if (!video) {
            return;
        }

        var streamUrl = video.getAttribute("data-stream-url");

        if (!streamUrl) {
            return;
        }

        function playNow() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    shell.classList.remove("playing");
                });
            }
        }

        if (shell.getAttribute("data-ready") === "true") {
            shell.classList.add("playing");
            playNow();
            return;
        }

        shell.setAttribute("data-ready", "true");
        shell.classList.add("playing");

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    shell.classList.remove("playing");
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playNow, { once: true });
        } else {
            shell.classList.remove("playing");
        }
    }

    document.querySelectorAll("[data-player]").forEach(function (shell) {
        var button = shell.querySelector(".play-overlay");
        var video = shell.querySelector("video");

        if (button) {
            button.addEventListener("click", function () {
                launchPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener("play", function () {
                shell.classList.add("playing");
            });

            video.addEventListener("pause", function () {
                shell.classList.remove("playing");
            });
        }
    });
})();
