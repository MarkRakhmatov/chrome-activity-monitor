import { Injectable } from '@angular/core';

export const DAYS_WEEK = ['Every day', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  constructor() { }
}
