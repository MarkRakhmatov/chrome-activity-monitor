import {Injectable} from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {TITLES} from "../enums/enums";
import {StorageService} from "../services/storage.service";
import {map} from "rxjs/operators";
import {SettingItemInterface} from "../types/setting-item";

@Injectable({
  providedIn: 'root'
})
export class BlackListResolver implements Resolve<SettingItemInterface[]> {
  constructor(private storageService: StorageService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SettingItemInterface[]> {
    return this.storageService.getStorageItem<SettingItemInterface>(TITLES.BLACK);
  }
}
