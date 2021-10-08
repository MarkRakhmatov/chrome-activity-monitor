import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {StatisticInterface} from "../types/statistic.interface";
import {of} from "rxjs/internal/observable/of";

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  statistic = new Subject<StatisticInterface[]>();

  constructor() {
  }

  getStatistic(): Subject<StatisticInterface[]> {
    chrome.runtime.sendMessage(null, {name: "getStatistics"}, {}, (response) => {
      const json = JSON.parse(response);
      const statistic = Object.keys(json).map(key => {
        return {
          url: key,
          duration: json[key]
        }
      });

      return of(statistic);
    });

    return this.statistic;
  }
}
