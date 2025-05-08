/**
 * @ParamManager
 */

class ParamManager {
    get(name) {
        if (name === "user_id") {
            return this._fromPath('u')
        }
        
        if (name === "video_id") {
            return this._fromPath('v');
        }

        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    _fromPath(key) {
        const segments = window.location.pathname.split('/');
        const index = segments.indexOf(key);
        return index !== -1 && segments[index + 1] || null;
    }
}


/**
 * @export
 */

export const paramManager = new ParamManager();