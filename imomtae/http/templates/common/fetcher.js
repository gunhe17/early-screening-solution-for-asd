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

    stop(user_id) {
        return fetchHelper.postAndForget(
            `/backend-api/camera/stop`,
            {
                user_id: user_id
            }
        )
    }

    async getEverySolution() {
        return await fetchHelper.get(
            `/backend-api/solution`,
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
            return json_response;
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

        return json_response.data
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