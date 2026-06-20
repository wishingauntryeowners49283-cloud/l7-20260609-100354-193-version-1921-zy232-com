import { H as Hls } from './hls-vendor-dru42stk.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach(function (player) {
  const video = player.querySelector('video');
  const source = video ? video.querySelector('source') : null;
  const overlay = player.querySelector('.play-overlay');

  if (!video || !source || !overlay) {
    return;
  }

  const url = source.getAttribute('src');
  let ready = false;
  let hls = null;

  const attach = function () {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    ready = true;
  };

  const play = function () {
    attach();
    overlay.classList.add('is-hidden');
    video.controls = true;
    const request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        video.controls = true;
      });
    }
  };

  overlay.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      play();
    }
  });

  video.addEventListener('ended', function () {
    if (hls && typeof hls.stopLoad === 'function') {
      hls.stopLoad();
    }
  });
});
