export interface SettingItemInterface {
  addressUrl: string
  startDate: string
  endDate: string
  dayWeek: string
  id?: number
}

export class SettingItem implements SettingItemInterface {
  dayWeek: string;
  endDate: string;
  id: number;
  startDate: string;
  addressUrl: string;

  constructor({addressUrl, dayWeek, startDate, endDate}: SettingItemInterface) {
    this.addressUrl = addressUrl;
    this.dayWeek = dayWeek;
    this.startDate = startDate;
    this.endDate = endDate;
    this.id = generateUniqueId();
  }
}

export function generateUniqueId(): number {
  return Math.round(Math.random() * 100 + 1);
}
