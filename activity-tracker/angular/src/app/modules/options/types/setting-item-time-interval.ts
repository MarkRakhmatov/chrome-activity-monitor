import {SettingItem, SettingItemInterface} from "./setting-item";

export interface SettingItemTimeIntervalInterface extends SettingItemInterface {
  timeInterval: string;
}

export class SettingItemTimeInterval extends SettingItem implements SettingItemTimeIntervalInterface {
  timeInterval: string;

  constructor(cnt: SettingItemTimeIntervalInterface) {
    super(cnt);
    this.timeInterval = cnt.timeInterval;
  }
}
