export interface SettingItemInterface {
  site: string
  days: string
  id?: number
}

export class SettingItem implements SettingItemInterface {
  days: string;
  id: number;
  site: string;

  constructor(cnt: SettingItemInterface) {
    this.days = cnt.days;
    this.site = cnt.site;
    this.id = cnt.id || generateUnicId();
  }
}

export function generateUnicId() {
  return Math.round(Math.random() * 100 + 1);
}
