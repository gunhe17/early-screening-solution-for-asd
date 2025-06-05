import { fetcher } from "/templates/common/fetcher.js"
import { paramManager } from "/templates/common/param_manager.js"

import { player } from "/templates/capture/component/player/component.js"


/**
 * @Page
 */
class Page {
    constructor() {
        this.main = document.querySelector(`main`);
        this.videoPlayer = document.querySelector(`video[name="video-player"]`);
    }

    // common
    
    async init() {
        // get video
        const video_id = paramManager.get("video_id");
        const getted_video = await fetcher.getVideo(video_id);

        // set video
        await player.set(getted_video)

        // check video
        await player.check()

        // check camera
        await fetcher.ready()
            // TODO: check camera logic
    }

    async run() {
        // record camera
        const video_id = paramManager.get("video_id");
        const user_id = paramManager.get("user_id");
        fetcher.record(video_id, user_id)

        // wait 3s
        await new Promise(resolve => setTimeout(resolve, 3000));

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

        if (player.player.paused) {
            await page.run();
        } else {
            await page.stop();
        }
    }
});