import { fetcher } from "/templates/common/fetcher.js"
import { video } from "/templates/common/video.js"
import { paramManager } from "/templates/common/param_manager.js"

import { overlay } from "/templates/capture/component/player/component/overlay/component.js"


/**
 * @Component
 */
class Player{
    constructor() {
        this.component = document.querySelector(`#player`);
        
        this.current_player = null;
        this.current_id = parseInt(paramManager.get("video_id"), 10);
        this.current_id_max = 0;

        this.is_checked = false;
    }

    
    // common

    async init() {
        const start = performance.now();

        await this.load();

        setTimeout(
            () => {
                overlay.hide();
            }, 
            Math.max(0, 5000 - (performance.now() - start))
        );

        this.current();

        this.is_checked = true;
    }

    async load() {
        const every_solution = await fetcher.getEverySolution();

        const solutions = (every_solution).filter(
            s => {
                return s.id >= paramManager.get("video_id");
            }
        );

        for (const s of solutions) {
            // url
            const url = `/backend-api/solution/v/${s.id}`;

            await video.store(url);
            const blob = await video.getObjectURL(url);

            this.component.insertAdjacentHTML("beforeend", `
                <video
                    name="video-player-${s.id}"
                    class="w-full h-full"
                    src="${blob}"
                    hidden
                ></video>
            `);
            
            // player
            const player = this.component.querySelector(`video[name=video-player-${s.id}]`);
            if (!await this._is_ready_to_play(player)) {
                console.log(`Invalid: play ${s.id}`);
                continue;
            }
            
            player.addEventListener('ended', () => {
                this.next();
            });

            // current_id_max
            this.current_id_max = s.id;
        }
    }


    // unique

    play() {
        this.current_player.play();
    }

    pause() {
        this.current_player.pause();
        overlay.pause();

        setTimeout(
            () => {
                window.location.href = `
                    ${window.location.origin}/capture/u/${paramManager.get("user_id")}/v/${this.current_id}
                `;
            }, 
            5000
        );
    }

    async current() {
        this.current_player = this.component.querySelector(`video[name=video-player-${this.current_id}]`);
        this.current_player.hidden = false;
    }

    next() {
        this.current_id += 1;

        if (this.current_id > this.current_id_max) {
            overlay.cleanup();
            return;
        }

        this.current_player.hidden = true;

        this.current();

        this.play();
    }


    // helper

    async _is_valid_url(url) {
        if (!url) {
            console.log("존재하지 않는 값");
            return false
        }

        if (typeof url !== "string") {
            console.log("올바르지 않은 자료형");
            return false
        }

        return true
    }

    async _is_ready_to_play(video, timeout = 5000) {
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
                console.log("재생 가능 상태로 전환되지 않아 타임아웃 처리");
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
        });
    }

    async is_ready_to_record() {}

}


/**
 * @export
 */
export const player = new Player();


/**
 * @event
 */

document.addEventListener('DOMContentLoaded', async() => {
    await player.init()
});