import { fetcher } from "/templates/common/fetcher.js"
import { paramManager } from "/templates/common/param_manager.js"

/**
 * @Component
 */
class Attention {
    constructor() {
        this.indexes = [2, 9]; // 입력한 index의 해당하는 동영상의 재생 전에 발생함.

        this.attention = document.querySelector(`#attention`);
    }

    // common
    async init() {
    }

    async run(index) {
        this._show();

        // user
        const user = await this._user();
        const user_called = user.called;


        if (index === 2) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        } else if (index === 9) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const audio = await this._audio(user_called, index);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(audio.audioUrl);

        await new Promise(resolve => setTimeout(resolve, 5000));

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

    async _audio(name, index) {
        let message;

        if (index === 2) {
            message = name + "~! 친구들이 뭐하는지 볼래?";
        } else if (index === 9) {
            message = name + "~! 나 따라서 신나게 춤춰볼까? 잘 할 수 있지~?";
        }

        const audioBlob = await fetcher.openai(message);
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