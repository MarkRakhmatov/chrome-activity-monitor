import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {StatisticInterface} from "../types/statistic.interface";
import {startWith} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private statistic$ = new Subject<StatisticInterface[]>();
  currentStatistic = this.statistic$.asObservable().pipe(
    startWith([]),
  );

  constructor() {
  }

  getStatistic(): void {
    chrome.runtime.sendMessage(null, {name: "getStatistics"}, {},
      this.responseCallBackMessage.bind(this));
  }

  responseCallBackMessage(response) {
    const json = JSON.parse(response);
    const statistic = Object.keys(json).map(key => {
      return {
        url: key,
        duration: json[key]
      }
    });
    this.statistic$.next(statistic);
  }

}
