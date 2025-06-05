import { fetcher } from "/templates/common/fetcher.js"


/**
 * @Page
 */
class Page {
    constructor() {
        this.main = document.querySelector(`main`);
        this.name = this.main.querySelector(`input[id="name"]`);
        this.birth = this.main.querySelector(`input[id="birth"]`);
    }

    // common
    async init() {   
    }

    // event
    async onClick() {
        const name = this.name.value;
        const birth = this.birth.value;

        const user = await fetcher.user(name, birth);
        
        window.location.href = `/capture/u/${user.id}/v/1`;
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