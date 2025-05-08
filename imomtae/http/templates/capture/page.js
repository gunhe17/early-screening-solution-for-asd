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

        // TODO: check camera
    }

    async run() {
        // TODO: check video

        // TODO: check camera

        // TODO: record camera

        // TODO: play video
    }

    async stop() {}

    async restart() {}
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