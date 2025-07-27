import { fetcher } from "/templates/common/fetcher.js"


/**
 * @Page
 */
class Page {
    constructor() {
        this.main = document.querySelector(`main`);
        this.name = this.main.querySelector(`input[id="name"]`);
        this.birth = this.main.querySelector(`input[id="birth"]`);
        this.center = this.main.querySelector(`input[id="center"]`);
        this.type = this.main.querySelector(`select[id="type"]`);
        this.called = this.main.querySelector(`input[id="called"]`);
        this.isExisting = this.main.querySelector(`span[id="is-existing"]`);
    }

    // common
    async init() {   
    }

    // event
    async onClick() {
        const name = this.name.value;
        const birth = this.birth.value;
        const center = this.center.value;
        const type = this.type.value;
        const called = this.called.value;

        const user = await fetcher.createUser(
            name, 
            birth,
            center,
            type,
            called
        );

        if (user.error) {
            this.isExisting.hidden = false;
            return;
        }
        
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