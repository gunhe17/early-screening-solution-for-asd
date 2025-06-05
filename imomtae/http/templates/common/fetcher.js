/**
 * @Fetcher
 */
class Fetcher {
    async user(name, birth) {
        return await fetchHelper.post(
            `/backend-api/user`,
            {
                name: name,
                birth: birth
            }
        )
    }

    async ready() {
        return await fetchHelper.post(
            `/backend-api/camera/ready`
        )
    }

    record(video_id, user_id) {
        return fetchHelper.postAndForget(
            `/backend-api/camera/record`,
            {
                video_id: video_id,
                user_id: user_id
            }
        )
    }

    async check() {
        return await fetchHelper.post(
            `/backend-api/camera/check`
        )
    }

    async getVideo(video_id) {
        return await fetchHelper.get_file(
            `/backend-api/video?video_id=${video_id}`,
        )
    }

    async getMonitorVideo(user_id, video_id) {
        return await fetchHelper.get_file(
            `/backend-api/monitor/video/u/${user_id}/v/${video_id}`,
        )
    }

    async getMonitorTime(user_id, video_id) {
        return await fetchHelper.get(
            `/backend-api/monitor/time/u/${user_id}/v/${video_id}`,
        )
    }
}

/**
 * @export
 */
export const fetcher = new Fetcher();


/**
 * @FetchHelper
 */
class FetchHelper {
    postAndForget(url, body) {
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
    }

    async post(url, body) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });
        const json_response = await response.json();
        
        if (json_response.error) {
            console.log(json_response)
            return;
        }

        return json_response.data;
    }

    async get(url, params) {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            params: params
        });
        const json_response = await response.json();
        
        if (json_response.error) {
            console.log(json_response)
            return;
        }

        return json_response.data;
    }

    async get_file(url, params) {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            params: params
        });
        const blob_response = await response.blob();
        
        if (blob_response.error) {
            console.log(blob_response)
            return;
        }

        const videoUrl = URL.createObjectURL(blob_response);

        return videoUrl;
    }

    async patch(url, body) {
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });
        const json_response = await response.json();
        
        if (json_response.error) {
            console.log(json_response)
            return;
        }

        return json_response.data;
    }
}


/**
 * @export
 */
export const fetchHelper = new FetchHelper();