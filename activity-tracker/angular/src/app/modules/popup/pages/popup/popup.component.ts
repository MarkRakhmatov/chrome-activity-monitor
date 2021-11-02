import {Component, Inject, OnInit} from '@angular/core';
import {TAB_ID} from '../../../../providers/tab-id.provider';
import {StatisticsService} from "../../services/statistics.service";

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit {
  isShowStatistic = false;
  isShowBlockedSite = true;

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
