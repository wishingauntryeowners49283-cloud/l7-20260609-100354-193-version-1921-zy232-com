import { H as Hls } from './hls-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-start]');
    var message = shell.querySelector('[data-player-message]');
    var source = shell.getAttribute('data-video-src');
    var attached = false;
    var hls = null;

    var showMessage = function (text) {
        if (!message) {
            return;
        }

        message.textContent = text;
        message.classList.add('is-visible');
    };

    var attach = function () {
        if (attached || !video || !source) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showMessage('视频暂时无法播放，请稍后重试');
                }
            });
            return;
        }

        showMessage('当前浏览器暂不支持该视频播放');
    };

    var play = function () {
        attach();

        var result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                showMessage('点击播放器即可继续播放');
            });
        }
    };

    if (button) {
        button.addEventListener('click', function () {
            play();
        });
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
        });

        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
});
