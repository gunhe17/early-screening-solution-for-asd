/**
 * @Component
 */
class Timer {
    constructor() {
        this.timer = document.querySelector(`#timer`);
        this.running = false;
        this.startTime = null;
        this.rafId = null;
        this.callbacks = [];
        this.elapsedWhenStopped = 0;
    }

    // common
    init() {
        this.update();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.startTime = performance.now() - (this.elapsedWhenStopped / 1000); // us → ms
        this._tick();
    }

    stop() {
        if (!this.running) return;
        this.elapsedWhenStopped = this._getElapsedUs();
        this.running = false;
        cancelAnimationFrame(this.rafId);
    }

    getText() {
        return this.timer.textContent;
    }

    update() {
        this._updateDisplay(this.elapsedWhenStopped || 0);
    }

    // event
    onTime(usTarget, callback) {
        this.callbacks.push({ usTarget, callback, called: false });
    }

    // private
    _tick() {
        if (!this.running) return;

        const now = performance.now();
        const elapsedUs = Math.floor((now - this.startTime) * 1000);
        this._updateDisplay(elapsedUs);

        // 콜백 실행 여부 확인
        for (const entry of this.callbacks) {
            if (!entry.called && elapsedUs >= entry.usTarget) {
                entry.called = true;
                entry.callback(elapsedUs);
            }
        }

        this.rafId = requestAnimationFrame(this._tick.bind(this));
    }

    _updateDisplay(us) {
        const ms = Math.floor(us / 1000);
        const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
        const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
        const milli = String(ms % 1000).padStart(3, '0');
        const micro = String(us % 1000).padStart(3, '0');
        this.timer.textContent = `${h}:${m}:${s}.${milli}${micro}`;
    }

    _getElapsedUs() {
        if (!this.running || this.startTime === null) return this.elapsedWhenStopped;
        return Math.floor((performance.now() - this.startTime) * 1000); // ms → us
    }
}

/**
 * @export
 */
export const timer = new Timer();

/**
 * @event
 */
document.addEventListener("DOMContentLoaded", () => {
    timer.init();
});