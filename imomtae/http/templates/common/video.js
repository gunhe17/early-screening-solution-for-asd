/**
 * @class
 */
class Video {
    constructor() {
        this.db = null;
        this.dbName = 'VideoStorage';
    }

    async init() {
        if (this.db) return;
        
        this.db = await new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('videos')) {
                    db.createObjectStore('videos', { keyPath: 'url' });
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async store(url) {
        await this.init();

        if (await this.exists(url)) return;
        
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            const transaction = this.db.transaction(['videos'], 'readwrite');
            const store = transaction.objectStore('videos');
            
            await new Promise((resolve, reject) => {
                const request = store.put({ url, blob, timestamp: Date.now() });
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            return blob;
        } catch (error) {
            console.log('Video storage 실패:', error);
            throw error;
        }
    }

    async get(url) {
        await this.init();
        
        const transaction = this.db.transaction(['videos'], 'readonly');
        const store = transaction.objectStore('videos');
        
        return new Promise((resolve, reject) => {
            const request = store.get(url);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.blob : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getObjectURL(url) {
        const blob = await this.get(url);
        return blob ? URL.createObjectURL(blob) : null;
    }

    async exists(url) {
        const blob = await this.get(url);
        return blob !== null;
    }

    async delete(url) {
        await this.init();
        
        const transaction = this.db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        
        return new Promise((resolve, reject) => {
            const request = store.delete(url);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear() {
        await this.init();
        
        const transaction = this.db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}


/**
 * @export
 */
export const video = new Video();