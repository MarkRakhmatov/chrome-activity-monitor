import {Component} from '@angular/core';
import {StatisticsService} from "../../services/statistics.service";
import {StatisticInterface} from "../../types/statistic.interface";
import {Observable} from "rxjs";

@Component({
  selector: 'app-statistic-table',
  templateUrl: './statistic-table.component.html',
  styleUrls: ['./statistic-table.component.scss']
})
export class StatisticTableComponent {
  statistic: Observable<StatisticInterface[]> = this.statisticService.currentStatistic;

  constructor(private statisticService: StatisticsService) {
    this.statisticService.getStatistic();
  }
}
