import {Component, Input, OnInit} from '@angular/core';
import {StatisticsService} from "../../services/statistics.service";
import {StatisticInterface} from "../../types/statistic.interface";

@Component({
  selector: 'app-statistic-table',
  templateUrl: './statistic-table.component.html',
  styleUrls: ['./statistic-table.component.scss']
})
export class StatisticTableComponent implements OnInit {
  statistic: StatisticInterface[];

  constructor(private statisticService: StatisticsService) {
  }

  ngOnInit(): void {
    this.statisticService.getStatistic();
    this.statisticService.getMessage().subscribe(value => this.statistic = value);
  }
}
