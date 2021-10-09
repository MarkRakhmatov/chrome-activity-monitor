import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {StatisticInterface} from "../types/statistic.interface";

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private statistic$ = new Subject<StatisticInterface[]>();

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
      this.statistic$.next(statistic);
    });

    return this.statistic$;
  }

  getMessage(): Observable<StatisticInterface[]> {
    return this.statistic$.asObservable();
  }
}
