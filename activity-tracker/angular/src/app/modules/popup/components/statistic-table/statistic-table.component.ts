import {Component, Input, OnInit} from '@angular/core';
import {StatisticsService} from "../../services/statistics.service";
import {StatisticInterface} from "../../types/statistic.interface";
import {Observable} from "rxjs";

@Component({
  selector: 'app-statistic-table',
  templateUrl: './statistic-table.component.html',
  styleUrls: ['./statistic-table.component.scss']
})
export class StatisticTableComponent implements OnInit {
  statistic: Observable<StatisticInterface[]> = this.statisticService.getMessage();
  statistic2;

  constructor(private statisticService: StatisticsService) {
    this.statisticService.getStatistic();
  }

  ngOnInit(): void {
    this.statisticService.getMessage().subscribe(value => this.statistic2 = value);
  }
}
