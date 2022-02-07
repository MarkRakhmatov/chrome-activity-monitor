import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TAB_ID } from '../../../../providers/tab-id.provider';
import { Switch } from "../../enums/switch";
import { MessageService } from "../../services/message.service";
import { map, switchMap, take, tap } from "rxjs/operators";
import { interval, Subscription, timer } from "rxjs";
import { StorageService } from "../../../options/services/storage.service";

const IS_APP_DISABLED_KEY_STORAGE = 'IS_APP_DISABLED';

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {
  isShowStatistic = false;
  isShowBlockedSite = true;
  stateExtention = Switch.ON;
  switchState = this.messageService.onIsDisabled();
  timer = null;
  interval: Subscription;

  constructor(@Inject(TAB_ID) readonly tabId: number,
              private messageService: MessageService,
              private storageService: StorageService) {
  }

  ngOnDestroy(): void {
    this.storageService.setStorage(IS_APP_DISABLED_KEY_STORAGE, [this.timer]);
  }

  ngOnInit(): void {
    this.storageService.getStorageItem(IS_APP_DISABLED_KEY_STORAGE).subscribe(timer => {
      if(timer) {
        this.createTimeBack(timer);
      }
    });
  }

  showStatistic() {
    this.isShowStatistic = true;
    this.isShowBlockedSite = false;
  }

  showBlockSites() {
    this.isShowStatistic = false;
    this.isShowBlockedSite = true;
  }

  switchExtension() {
    this.stateExtention = this.stateExtention === Switch.ON ? Switch.OFF : Switch.ON;
    this.updateStateApplication(this.stateExtention === Switch.OFF);
  }

  updateStateApplication(isTemporaryDisabled: boolean) {
    this.messageService.temporaryDisable(isTemporaryDisabled)
      .pipe(
        switchMap(({timeout}) => {
          this.interval.unsubscribe();
          this.createTimeBack(timeout / 1000);
          return timer(timeout);
        })
      )
      .subscribe(() => {
        this.stateExtention = Switch.ON;
      });
  }

  createTimeBack(timeout) {
    this.interval = interval(1000).pipe(take(timeout), map(count => timeout - count)).subscribe(value => {
      this.timer = value;
    });
  }
}
