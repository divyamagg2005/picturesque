const DATABASE_NAME = "picturesque-local-references";
const DATABASE_VERSION = 1;
const STORE_NAME = "gallery-reference";
const RECORD_KEY = "selected-image";

export type StoredGalleryReference = {
  blob: Blob;
  name: string;
};

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Local image storage is unavailable in this browser."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local image storage could not be opened."));
  });
}

export async function readGalleryReference(): Promise<StoredGalleryReference | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve((request.result as StoredGalleryReference | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("The saved reference image could not be read."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("The saved reference image could not be read."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("The saved reference image could not be read."));
    };
  });
}

export async function saveGalleryReference(file: File): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ blob: file, name: file.name } satisfies StoredGalleryReference, RECORD_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("The reference image could not be saved on this device."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("The reference image could not be saved on this device."));
    };
  });
}

export async function deleteGalleryReference(): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(RECORD_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("The saved reference image could not be removed."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("The saved reference image could not be removed."));
    };
  });
}