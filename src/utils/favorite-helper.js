class FavoriteHelper {
    static DB_NAME = 'db-storyapps-favorite';
    static DB_VERSION = 1;
    static STORE_NAME = 'favorites';

    static async openDB() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('Browser does not support IndexedDB'));
                return;
            }

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                reject(new Error('Failed to open favorites database'));
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                    console.log(`Object store ${this.STORE_NAME} created successfully`);
                }
            };
        });
    }

    static async addToFavorites(story) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.put(story);

            request.onsuccess = () => {
                resolve(true);
                console.log(`Story successfully added to favorites`);
            };

            request.onerror = () => {
                reject(new Error('Failed to add story to favorites'));
            };
        });
    }

    static async removeFromFavorites(id) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
                console.log(`Story successfully removed from favorites`);
            };

            request.onerror = () => {
                reject(new Error('Failed to delete story from favorites'));
            };
        });
    }

    static async getFavorites() {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to fetch favorites list'));
            };
        });
    }

    static async isFavorite(id) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(!!request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to check favorite status'));
            };
        });
    }
}

export { FavoriteHelper };