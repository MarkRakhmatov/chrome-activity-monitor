import {Injectable} from '@angular/core';
import {fromPromise} from "rxjs/internal-compatibility";
import {Observable} from "rxjs";
import {SettingItemInterface} from "../types/setting-item";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {
  }

  setStorage(key: string, value: SettingItemInterface[]): void {
    chrome.storage.local.set({[key]: value});
  }

  getStorageItem<T>(key: string): Observable<T[]> {
    return fromPromise(new Promise((resolve, reject) => {
      chrome.storage.local.get([key], results => {
        return resolve(results[key]);
      });
    }));
  }

  removeStorageItem(key: string) {
    localStorage.removeItem(key);
  }

}
