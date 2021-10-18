import {Component, Inject, Input, OnInit} from '@angular/core';
import {TAB_ID} from '../../../../providers/tab-id.provider';
import {StatisticsService} from "../../services/statistics.service";
import {switchMap} from "rxjs/operators";

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit {
  isShowStatistic = true;
  isShowBlockedSite = false;

  constructor(@Inject(TAB_ID) readonly tabId: number) {
  }

  ngOnInit(): void {

  }

  showStatistic() {
    this.isShowStatistic = true;
    this.isShowBlockedSite = false;
  }

  showBlockSites() {
    this.isShowStatistic = false;
    this.isShowBlockedSite = true;
  }
}
