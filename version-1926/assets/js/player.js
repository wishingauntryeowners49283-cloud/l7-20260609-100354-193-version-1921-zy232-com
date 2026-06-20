(function () {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('.play-overlay');
    var hlsInstance = null;

    if (!video || !overlay) {
        return;
    }

    function getStream() {
        return overlay.getAttribute('data-stream') || '';
    }

    function attachStream(stream) {
        if (!stream) {
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== stream) {
                video.src = stream;
            }
            return Promise.resolve();
        }

        if (globalThis.Hls && globalThis.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new globalThis.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.attachMedia(video);
            }
            hlsInstance.loadSource(stream);
            return Promise.resolve();
        }

        video.src = stream;
        return Promise.resolve();
    }

    function beginPlay() {
        attachStream(getStream()).then(function () {
            overlay.classList.add('is-hidden');
            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        });
    }

    overlay.addEventListener('click', beginPlay);

    video.addEventListener('click', function () {
        if (video.paused) {
            beginPlay();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
})();
