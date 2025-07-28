/**
 * @Fetcher
 */
class Fetcher {
    async createUser(name, birth, center, type, called) {
        return await fetchHelper.post(
            `/backend-api/user`,
            {
                name: name,
                birth: birth,
                center: center,
                type: type,
                called: called
            }
        )
    }

    async getUser(id) {
        return await fetchHelper.get(
            `/backend-api/user/${id}`
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

    async openai(text) {
        return await fetchHelper.postBlob(
            `/backend-api/openai`,
            {
                text: text
            }
        )
    }

    async getEverySolution() {
        return await fetchHelper.get(
            `/backend-api/solution`,
        )
    }

    async getSolution(id) {
        return await fetchHelper.getBlob(
            `/backend-api/solution/v/${id}`,
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

    async postBlob(url, body) {
        const response = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.log(await response.json());
            return;
        }

        const blob_response = await response.blob();
        return blob_response;
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

    async getBlob(url) {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.log(await response.json());
            return;
        }

        const blob_response = await response.blob();
        return blob_response;
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