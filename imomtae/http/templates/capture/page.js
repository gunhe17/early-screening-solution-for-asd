import { fetcher } from "/templates/common/fetcher.js"
import { paramManager } from "/templates/common/param_manager.js"

import { player } from "/templates/capture/component/player/component.js"
import { loading } from "/templates/capture/component/loading/component.js"


/**
 * @Page
 */
class Page {
    constructor() {
        this.main = document.querySelector(`main`);
        this.videoPlayer = document.querySelector(`video[name="video-player"]`);
    }

    // common
    
    async init() {}

    async run() {
        // loading
        loading.show();

        // record camera
        const video_id = paramManager.get("video_id");
        const user_id = paramManager.get("user_id");
        fetcher.record(video_id, user_id)

        // wait 5s
        await new Promise(resolve => setTimeout(resolve, 5000));

        // loading
        loading.hide();

        // play video
        player.play()
    }

    async stop() {
        player.pause()
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
    if (!player.is_checked) return;

    if (event.code === "Space") {
        event.preventDefault();

        if (player.current_player.paused) {
            await page.run();
        } else {
            await page.stop();
        }
    }
});