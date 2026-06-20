(function () {
  function initMoviePlayer(playlistUrl) {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('play-toggle');
    var shell = document.querySelector('.player-shell');

    if (!video || !playlistUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playlistUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(playlistUrl);
      hls.attachMedia(video);
    } else {
      video.src = playlistUrl;
    }

    function markPlaying() {
      if (shell) {
        shell.classList.add('is-playing');
      }
    }

    function markPaused() {
      if (shell && video.paused) {
        shell.classList.remove('is-playing');
      }
    }

    function playVideo() {
      markPlaying();
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          markPaused();
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', markPaused);
    video.addEventListener('ended', markPaused);
  }

  window.initMoviePlayer = initMoviePlayer;
})();
