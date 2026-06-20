(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    const configNode = document.getElementById("video-config");
    const video = document.getElementById("movie-video");
    const trigger = document.getElementById("play-trigger");

    if (!configNode || !video || !trigger) {
      return;
    }

    let config = null;
    let prepared = false;
    let hls = null;

    try {
      config = JSON.parse(configNode.textContent || "{}");
    } catch (error) {
      config = {};
    }

    function prepare() {
      if (prepared || !config.source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }

      prepared = true;
    }

    function showCover() {
      trigger.classList.remove("is-hidden");
    }

    function hideCover() {
      trigger.classList.add("is-hidden");
    }

    function start() {
      prepare();
      hideCover();
      const playback = video.play();

      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {
          showCover();
        });
      }
    }

    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideCover);
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showCover();
      }
    });
    video.addEventListener("ended", showCover);

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
