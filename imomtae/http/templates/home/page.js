/**
 * @Page
 */
class Page {
    constructor() {
        this.main = document.querySelector(`main`);
    }

    // common
    
    async init() {   
    }

    // event
    
    async onClick() {
        const uuid = URL.createObjectURL(new Blob()).substring(31);
        
        window.location.href = `/capture/u/${uuid}/v/1`;
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