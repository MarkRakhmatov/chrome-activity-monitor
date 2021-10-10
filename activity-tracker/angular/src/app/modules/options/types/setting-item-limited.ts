import {generateUniqueId} from "./setting-item.interface";

export interface SettingItemLimitedInterface {
  addressUrl: string
  timeInterval: string
  dayWeek: string
  id?: number
}

export class SettingItemLimited implements SettingItemLimitedInterface {
  addressUrl: string;
  dayWeek: string;
  timeInterval: string;
  id?: number;

  constructor({addressUrl, dayWeek, timeInterval}: SettingItemLimitedInterface) {
    this.dayWeek = dayWeek;
    this.addressUrl = addressUrl;
    this.timeInterval = timeInterval;
    this.id = generateUniqueId()
  }


}
