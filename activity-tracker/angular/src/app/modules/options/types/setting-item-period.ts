import {SettingItem, SettingItemInterface} from "./setting-item";

export interface SettingItemPeriodInterface extends SettingItemInterface {
  timeStart: string
  timeEnd: string
}

export class SettingItemPeriod extends SettingItem implements SettingItemPeriodInterface {
  timeStart: string;
  timeEnd: string;

  constructor(cnt: SettingItemPeriodInterface) {
    super(cnt);
    this.timeEnd = cnt.timeEnd;
    this.timeStart = cnt.timeStart;
  }
}
