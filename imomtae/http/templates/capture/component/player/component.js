import { fetcher } from "/templates/common/fetcher.js"

import { overlay } from "/templates/capture/component/player/component/overlay/component.js"


/**
 * @Component
 */
class Player{
    constructor() {
        this.component = document.querySelector(`#player`);
        this.player = this.component.querySelector(`video[name=video-player]`);

        this.is_checked = false;
    }

    // common
    init() {}

    async set(video) {
        if (!this.is_valid_url(video)) return

        this.player.src = video
    }

    async check() {
        if (!await this.is_ready_to_play()) return
        if (!await this.is_ready_to_record()) return

        await new Promise(resolve => setTimeout(resolve, 3000));

        overlay.hide()

        this.is_checked = true;
    }

    // unique

    play() {
        overlay.hide_immediately()

        this.player.play()
    }

    pause() {
        this.player.pause()
        this.player.currentTime = 0;

        overlay.pause()
    }

    // helper

    is_valid_url(url) {
        if (!url) {
            throw new Error("존재하지 않는 값");
        }

        if (typeof url !== "string") {
            throw new Error("올바르지 않은 자료형")
        }

        if (!url.startsWith("blob:")) {
            throw new Error("올바르지 않은 값(not blob).")
        }

        return true
    }

    async is_ready_to_play(timeout = 5000) {
        const video = this.player;

        return new Promise((resolve) => {
            let resolved = false;

            const onReady = () => {
                if (resolved) return;
                resolved = true;
                cleanup();
                resolve(true);
            };

            const onError = () => {
                if (resolved) return;
                resolved = true;
                cleanup();
                resolve(false);
            };

            const onTimeout = () => {
                if (resolved) return;
                resolved = true;
                cleanup();
                console.warn("⏱️ 재생 가능 상태로 전환되지 않아 타임아웃 처리");
                resolve(false);
            };

            const cleanup = () => {
                clearTimeout(timer);
                video.removeEventListener("canplaythrough", onReady);
                video.removeEventListener("error", onError);
            };

            video.addEventListener("canplaythrough", onReady, { once: true });
            video.addEventListener("error", onError, { once: true });

            const timer = setTimeout(onTimeout, timeout);
            video.load();
        });
    }

    async is_ready_to_record() {
        const is_ready = await fetcher.ready();
        if (!is_ready) return false;

        return true;
    }

}


/**
 * @export
 */
export const player = new Player();

/**
 * @event
 */

document.addEventListener('DOMContentLoaded', async() => {
    player.init()
});

document.addEventListener("keydown", async(event) => {
    if (!player.is_checked) return;

    if (event.code === "Space") {
        event.preventDefault();

        if (player.player.paused) {
            player.play();
        } else {
            player.pause();
        }
    }
});