import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import {StorageService} from "../services/storage.service";
import {SettingItemInterface} from "../types/setting-item";
import {TITLES} from "../enums/enums";

@Injectable({
  providedIn: 'root'
})
export class WhiteListResolver implements Resolve<SettingItemInterface[]> {
  constructor(private storageService: StorageService) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SettingItemInterface[]> {
    return this.storageService.getStorageItem<SettingItemInterface>(TITLES.WHITE);
  }
}
