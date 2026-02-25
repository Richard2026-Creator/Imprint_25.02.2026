import { LibraryImage, StudioSettings, SessionResult, StyleCategory } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_SESSION_LENGTH } from '../constants';

const SETTINGS_KEY = 'aa_settings';
const SESSIONS_KEY = 'aa_sessions';
const IMAGES_KEY = 'aa_images';

// We use IndexedDB for the images because Base64 strings are too large for LocalStorage
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AestheticArchitectDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveImage = async (image: LibraryImage) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');
    const request = store.put(image);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const deleteImage = async (id: string) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const getImages = async (): Promise<LibraryImage[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('images', 'readonly');
    const store = transaction.objectStore('images');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getSettings = (): StudioSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    return {
      logo: null,
      sessionLength: 10,
      minRequiredImages: 5,
      categories: DEFAULT_CATEGORIES,
      adminPin: '0000',
      clientName: '',
    };
  }
  const parsed = JSON.parse(stored);
  if (parsed.minRequiredImages === undefined) {
    parsed.minRequiredImages = 5;
  }
  if (parsed.adminPin === undefined) {
    parsed.adminPin = '0000';
  }
  if (parsed.clientName === undefined) {
    parsed.clientName = '';
  }
  return parsed;
};

export const saveSettings = (settings: StudioSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getSessions = (): SessionResult[] => {
  const stored = localStorage.getItem(SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSession = (session: SessionResult) => {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};