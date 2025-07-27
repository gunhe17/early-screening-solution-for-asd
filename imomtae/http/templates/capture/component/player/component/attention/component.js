import { fetcher } from "/templates/common/fetcher.js"
import { paramManager } from "/templates/common/param_manager.js"

/**
 * @Component
 */
class Attention {
    constructor() {
        this.indexes = [2]; // 입력한 index의 해당하는 동영상의 재생 전에 발생함.

        this.attention = document.querySelector(`#attention`);
    }

    // common
    async init() {
    }

    async run() {
        this._show();

        // user
        const user = await this._user();
        const user_called = user.called;
        
        // audio
        const audio = await this._audio(user_called);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(audio.audioUrl);

        // wait
        await new Promise(resolve => setTimeout(resolve, 10000));

        this._hide();
        
        return audio;
    }

    // unique
    is_run(index) {
        return this.indexes.includes(index) ? true : false;
    }

    // private
    async _user() {
        const user_id = paramManager.get("user_id");
        const user = await fetcher.getUser(user_id);

        return user
    }

    async _audio(name) {
        const audioBlob = await fetcher.openai(`${name}, 여기 볼래? 여기야! 여기~`);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.audioUrl = audioUrl;
        
        return audio;
    }

    _show() {
        this.attention.classList.remove("hidden");
    }

    _hide() {
        this.attention.classList.add("hidden");
    }
}

/**
 * @export
 */
export const attention = new Attention();

/**
 * @event
 */
document.addEventListener('DOMContentLoaded', async() => {
    await attention.init();
});