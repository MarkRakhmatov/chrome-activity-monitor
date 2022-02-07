import { Injectable } from '@angular/core';
import { fromPromise } from "rxjs/internal-compatibility";
import { Observable } from "rxjs";

interface AppIsDisabledResponse {
  isDisabled: Boolean
}

interface TemporaryDisableResponse {
  timeout: number
}

export const DURATION_TIME_OUT = 5000;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() {
  }

  temporaryDisable(isTemporaryDisabled: boolean): Observable<TemporaryDisableResponse> {
    return fromPromise(new Promise(resolve => {
      chrome.runtime.sendMessage
      (null, {name: "temporaryDisable", isTemporaryDisabled}, {}, (response) => {
        return resolve(response);
      });
    }));
  }

  onIsDisabled(): Observable<AppIsDisabledResponse> {
    return fromPromise(new Promise((resolve) => {
      chrome.runtime.sendMessage(null, {name: "isDisabled"}, {}, (response) => {
        return resolve(response.isDisabled);
      });
    }));
  }
}
