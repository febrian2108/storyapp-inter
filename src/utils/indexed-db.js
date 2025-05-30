class IdbHelper {
    static DB_NAME = 'db-storyapps';
    static DB_VERSION = 1;
    static STORE_STORIES = 'stories';
    static STORE_FAVORITES = 'favorites';

    static async openDB() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('Browser does not support IndexedDB'));
                return;
            }

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Buat object store untuk stories jika belum ada
                if (!db.objectStoreNames.contains(this.STORE_STORIES)) {
                    db.createObjectStore(this.STORE_STORIES, { keyPath: 'id' });
                    console.log(`Object store ${this.STORE_STORIES} created successfully`);
                }

                // Buat object store untuk favorites jika belum ada
                if (!db.objectStoreNames.contains(this.STORE_FAVORITES)) {
                    db.createObjectStore(this.STORE_FAVORITES, { keyPath: 'id' });
                    console.log(`Object store ${this.STORE_FAVORITES} created successfully`);
                }
            };
        });
    }

    static async saveStories(stories) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_STORIES, 'readwrite');
        const store = tx.objectStore(this.STORE_STORIES);

        // Simpan setiap cerita
        stories.forEach((story) => {
            store.put(story);
        });

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                console.log('Stories successfully saved to IndexedDB');
                resolve(stories);
            };

            tx.onerror = (event) => {
                console.error('Error menyimpan stories:', event.target.error);
                reject(new Error('Failed to save stories to IndexedDB'));
            };
        });
    }

    static async getStories() {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_STORIES, 'readonly');
        const store = tx.objectStore(this.STORE_STORIES);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('Error to fetch  stories:', event.target.error);
                reject(new Error('Failed to fetch stories from IndexedDB'));
            };
        });
    }

    static async getStoryById(id) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_STORIES, 'readonly');
        const store = tx.objectStore(this.STORE_STORIES);
        const request = store.get(id);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('Error to fetch story:', event.target.error);
                reject(new Error('Failed to fetch story from IndexedDB'));
            };
        });
    }

    static async deleteStory(id) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_STORIES, 'readwrite');
        const store = tx.objectStore(this.STORE_STORIES);
        const request = store.delete(id);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log(`Story with id ${id} successfully deleted from IndexedDB`);
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('Error deleted story:', event.target.error);
                reject(new Error(`Failed to delete story with id ${id} with IndexedDB`));
            };
        });
    }

    static async clearStories() {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_STORIES, 'readwrite');
        const store = tx.objectStore(this.STORE_STORIES);
        const request = store.clear();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('Semua stories berhasil dihapus dari IndexedDB');
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('Error menghapus semua stories:', event.target.error);
                reject(new Error('Gagal menghapus semua stories dari IndexedDB'));
            };
        });
    }

    // Favorites methods
    static async addToFavorites(story) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_FAVORITES, 'readwrite');
        const store = tx.objectStore(this.STORE_FAVORITES);

        return new Promise((resolve, reject) => {
            const request = store.put(story);

            request.onsuccess = () => {
                console.log(`Story berhasil ditambahkan ke favorit`);
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('Error menambahkan favorit:', event.target.error);
                reject(new Error('Gagal menambahkan story ke favorit'));
            };
        });
    }

    static async removeFromFavorites(id) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_FAVORITES, 'readwrite');
        const store = tx.objectStore(this.STORE_FAVORITES);

        return new Promise((resolve, reject) => {
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(`Story berhasil dihapus dari favorit`);
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('Error menghapus favorit:', event.target.error);
                reject(new Error('Gagal menghapus story dari favorit'));
            };
        });
    }

    static async getFavorites() {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_FAVORITES, 'readonly');
        const store = tx.objectStore(this.STORE_FAVORITES);

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('Error mengambil favorit:', event.target.error);
                reject(new Error('Gagal mengambil daftar favorit'));
            };
        });
    }

    static async isFavorite(id) {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_FAVORITES, 'readonly');
        const store = tx.objectStore(this.STORE_FAVORITES);

        return new Promise((resolve, reject) => {
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(!!request.result);
            };

            request.onerror = (event) => {
                console.error('Error memeriksa favorit:', event.target.error);
                reject(new Error('Gagal memeriksa status favorit'));
            };
        });
    }
}

export { IdbHelper };