import {Injectable} from '@angular/core';
import {fromEventPattern, Observable, ReplaySubject, Subject} from "rxjs";
import {StatisticInterface} from "../types/statistic.interface";
import {getMessage} from "@extend-chrome/messages";

export const [sendStatistic, statisticsStream, waitForStatistic] = getMessage(
  'getStatistics',
)

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private statistic$ = new Subject<StatisticInterface[]>();
  private statistic2$: Observable<any> = statisticsStream;

  constructor() {
    this.getStatistic();
    this.statistic2$.subscribe(value => console.log(value));
  }


  getStatistic(): void {
    chrome.runtime.sendMessage(null, {name: "getStatistics"}, {}, (response) => {
      const json = JSON.parse(response);
      const statistic = Object.keys(json).map(key => {
        return {
          url: key,
          duration: json[key]
        }
      });
      sendStatistic(statistic);
      this.statistic$.next(statistic);
    });
  }

  getStat() {

  }

  getMessage(): Observable<StatisticInterface[]> {
    return this.statistic$.asObservable();
  }
}
