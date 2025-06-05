import { fetcher } from "/templates/common/fetcher.js"
import { paramManager } from "/templates/common/param_manager.js"

import { timer } from "/templates/monitor/component/timer/component.js"


/**
 * @Page
 */
class Page {
    constructor() {
        this.main = document.querySelector(`main`);
        this.video1 = this.main.querySelector(`video[name="video1"]`);
        this.label1 = this.main.querySelector(`div[name="label1"]`);
        this.video2 = this.main.querySelector(`video[name="video2"]`);
        this.label2 = this.main.querySelector(`div[name="label2"]`);
        this.video3 = this.main.querySelector(`video[name="video3"]`);
        this.label3 = this.main.querySelector(`div[name="label3"]`);
        this.video4 = this.main.querySelector(`video[name="video4"]`);
        this.label4 = this.main.querySelector(`div[name="label4"]`);
        this.video5 = this.main.querySelector(`video[name="video5"]`);
        this.label5 = this.main.querySelector(`div[name="label5"]`);
        this.video6 = this.main.querySelector(`video[name="video6"]`);
        this.label6 = this.main.querySelector(`div[name="label6"]`);
    }

    // common
    
    async init() {
        const user_id = paramManager.get("user_id");

        const videos = [
            { video: this.video1, label: this.label1 },
            { video: this.video2, label: this.label2 },
            { video: this.video3, label: this.label3 },
            { video: this.video4, label: this.label4 },
            { video: this.video5, label: this.label5 },
            { video: this.video6, label: this.label6 },
        ];

        for (let idx = 0; idx < videos.length; idx++) {
            const { video, label } = videos[idx];

            video.src = await fetcher.getMonitorVideo(user_id, idx);
            await this.is_ready_to_play(video);
            const video_time = await fetcher.getMonitorTime(user_id, idx);

            timer.onTime(video_time.relative_time[0], () => {
                console.log(`▶ video${idx + 1} 재생`);
                video.play();
            });

            const offset = video_time.relative_time[0];

            for (let i = 0; i < video_time.relative_time.length; i++) {
                const rel = video_time.relative_time[i] - offset;
                const abs = video_time.absolute_time[i];

                timer.onTime(rel, () => {
                    label.innerText = `${rel} us\n${abs}`;
                });
            }
        }

    }

    // event
    async play() {
        timer.start();
    }

    // helper

    async is_ready_to_play(player, timeout = 5000) {
        const video = player;

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
}

/**
 * @export
 */
export const page = new Page();

/**
 * @window
 */
if (!window.page) {
    window.page = page;
}

/**
 * @event
 */
document.addEventListener('DOMContentLoaded', async() => {
    await page.init();
});

document.addEventListener("keydown", async(event) => {
    if (event.code === "Space") {
        event.preventDefault();

        if (!timer.running) {
            await timer.start();

            for (const video of [
                page.video1, page.video2, page.video3,
                page.video4, page.video5, page.video6
            ]) {
                if (video.paused) video.play();
            }

        } else {
            await timer.stop();
            
            for (const video of [
                page.video1, page.video2, page.video3,
                page.video4, page.video5, page.video6
            ]) {
                video.pause();
            }
        }
    }
});