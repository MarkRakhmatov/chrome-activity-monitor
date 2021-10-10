import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {
  }

  setStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
    chrome.storage.local.set({[key]: JSON.stringify(value)});
  }

  getStorageItem(key: string) {
    return chrome.storage.local.get([key], results => {
      return results;
    });
  }

  removeStorageItem(key: string) {
    localStorage.removeItem(key);
  }

}
