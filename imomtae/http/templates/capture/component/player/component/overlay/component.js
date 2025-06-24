/**
 * @Component
 */
class Overlay {
    constructor() {
        this.overlay = document.querySelector(`#overlay`);
        this.title = this.overlay.querySelector(`[name=quote-title]`);
        this.description = this.overlay.querySelector(`[name=quote-description]`);
    }


    // common

    init() {
        this.title.textContent = "수집을 위한 준비 중입니다.";
        this.description.textContent = "이 메시지가 사라지면 수집을 시작할 수 있습니다.";
        this._fade_in();
    }

    pause() {
        this.title.textContent = "수집을 중단하셨습니다.";
        this.description.textContent = "정확한 수집을 위해 처음부터 다시 수집을 진행합니다.";
        this._fade_in();
    }

    cleanup() {
        this.title.textContent = "촬영이 완료되었습니다.";
        this.description.textContent = "촬영된 데이터를 저장하는 중 입니다.";
        this._fade_in();        
    }

    end() {
        this.title.textContent = "수집이 완료되었습니다.";
        this.description.textContent = "다음 단계를 진행할 수 있습니다.";
        this._fade_in();
    }

    hide() {
        this._fade_out();
    }

    hide_immediately() {
        this._immediately_out();
    }

    
    // helper

    _fade_in() {
        this.overlay.classList.remove("hidden");
        this.overlay.classList.add("visible");
    }

    _fade_out() {
        this.overlay.classList.remove("visible");
        setTimeout(() => {
            if (!this.overlay.classList.contains("visible")) {
                this.overlay.classList.add("hidden");
            }
        }, 300);
    }

    _immediately_out() {
        this.overlay.classList.remove("visible");
        this.overlay.classList.add("hidden");
    }
}

/**
 * @export
 */
export const overlay = new Overlay();


/**
 * @event
 */
document.addEventListener('DOMContentLoaded', async() => {
    overlay.init()
});