import { Corporate } from './types';

const DB_NAME = 'MaxDB';
const STORE_NAME = 'corporates';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('IndexedDB is only available in the browser'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

export async function upsertCorporate(corporate: Corporate) {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Add updated_at for sorting
        const dataToSave = {
            ...corporate,
            updated_at: new Date().toISOString()
        };
        
        const request = store.put(dataToSave);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function fetchAllCorporates(): Promise<Corporate[]> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const results = request.result as (Corporate & { updated_at: string })[];
                // Sort by updated_at descending
                const sorted = results.sort((a, b) => 
                    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                );
                resolve(sorted);
            };
        });
    } catch (error) {
        console.error('Error fetching corporates:', error);
        return [];
    }
}

export async function fetchCorporateById(id: string): Promise<Corporate | null> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    } catch (error) {
        console.error('Error fetching corporate by id:', error);
        return null;
    }
}

export async function deleteCorporate(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}
