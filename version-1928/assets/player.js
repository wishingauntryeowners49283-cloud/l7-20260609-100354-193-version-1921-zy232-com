(function () {
  function loadLibrary(callback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }

    var existing = document.querySelector("script[data-hls-loader]");

    if (existing) {
      existing.addEventListener("load", function () {
        callback(window.Hls);
      });
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", function () {
      callback(window.Hls);
    });
    document.head.appendChild(script);
  }

  function bindPlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-button]");
    var ready = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function startVideo() {
      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    function prepare(callback) {
      if (ready) {
        callback();
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        callback();
        return;
      }

      loadLibrary(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.addEventListener("loadedmetadata", callback, { once: true });
          window.setTimeout(callback, 500);
        } else {
          video.src = source;
          callback();
        }
      });
    }

    function play() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      prepare(startVideo);
    }

    if (overlay) {
      overlay.addEventListener("click", play);
      overlay.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play();
        }
      });
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        prepare(startVideo);
      } else {
        video.pause();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = bindPlayer;
})();
