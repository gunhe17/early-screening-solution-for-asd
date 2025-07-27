/**
 * @Component
 */
class Countdown {
    constructor() {
        this.countdown = document.querySelector(`#countdown`);
        this.number = null;
    }

    // common

    init() {
        this.number = this.countdown.querySelector('#number');
    }

    async show(seconds) {
        this.countdown.classList.remove('hidden');
        
        for (let i = seconds; i > 0; i--) {
            this.number.textContent = i;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.countdown.classList.add('hidden');
    }

    hide() {
        this.countdown.classList.add('hidden');
    }
}

/**
 * @export
 */
export const countdown = new Countdown();

/**
 * @event
 */
document.addEventListener('DOMContentLoaded', async() => {
    countdown.init();
});