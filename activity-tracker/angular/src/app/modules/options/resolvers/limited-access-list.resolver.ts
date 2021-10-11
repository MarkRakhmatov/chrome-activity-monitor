import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import {TITLES} from "../enums/enums";
import {StorageService} from "../services/storage.service";
import {SettingItemTimeIntervalInterface} from "../types/setting-item-time-interval";

@Injectable({
  providedIn: 'root'
})
export class LimitedAccessListResolver implements Resolve<SettingItemTimeIntervalInterface[]> {
  constructor(private storageService: StorageService) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SettingItemTimeIntervalInterface[]> {
    return this.storageService.getStorageItem<SettingItemTimeIntervalInterface>(TITLES.LIMITED_ACCESS);
  }
}
