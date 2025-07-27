
/**
 * @Component
 */
class Loading {
    constructor() {
        this.loading = document.querySelector(`#loading`);

        console.log('loading init:', this.loading);
    }

    // common

    init() {
        this.loading.classList.add('hidden');
    }

    show() {
        this.loading.classList.remove('hidden');
    }

    hide() {
        this.loading.classList.add('hidden');
    }
}

/**
 * @export
 */
export const loading = new Loading();


/**
 * @event
 */
document.addEventListener('DOMContentLoaded', async() => {
    loading.init()
});