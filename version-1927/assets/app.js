(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search]");
      var chips = scope.querySelectorAll("[data-filter]");
      var cards = scope.querySelectorAll("[data-card]");
      var current = "all";

      function apply() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-filter-text"));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesChip = current === "all" || text.indexOf(normalize(current)) !== -1;
          card.classList.toggle("hidden", !(matchesQuery && matchesChip));
        });
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
          input.value = initial;
        }
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          current = chip.getAttribute("data-filter") || "all";
          apply();
        });
      });

      apply();
    });
  }

  function setupPlayers() {
    var frames = document.querySelectorAll("[data-video-player]");
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("[data-play-button]");
      var stream = frame.getAttribute("data-stream");
      var hasAttached = false;

      function markPlaying() {
        frame.classList.add("is-playing");
      }

      function markPaused() {
        if (video.paused) {
          frame.classList.remove("is-playing");
        }
      }

      function attach() {
        if (!video || !stream || hasAttached) {
          return;
        }
        hasAttached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        frame.classList.add("is-playing");
      }

      function start() {
        attach();
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            frame.classList.remove("is-playing");
          });
        }
      }

      if (!video) {
        return;
      }
      attach();
      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", markPlaying);
      video.addEventListener("pause", markPaused);
      video.addEventListener("ended", markPaused);
    });
  }

  ready(function () {
    setupMenu();
    setupFilters();
    setupPlayers();
  });
})();
