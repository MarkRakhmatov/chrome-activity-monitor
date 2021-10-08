import {Component, Inject, OnInit} from '@angular/core';
import {TAB_ID} from '../../../../providers/tab-id.provider';
import {StatisticsService} from "../../services/statistics.service";
import {Subject} from "rxjs";
import {StatisticInterface} from "../../types/statistic.interface";

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit {
  message: string;
  statistic: Subject<StatisticInterface[]> = this.statisticService.getStatistic();

  constructor(@Inject(TAB_ID) readonly tabId: number,
              private statisticService: StatisticsService) {
  }

  ngOnInit(): void {

  }

}
