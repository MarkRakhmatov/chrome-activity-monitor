import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SettingItemTimeIntervalInterface} from "../../types/setting-item-time-interval";

@Component({
  selector: 'tr[app-settings-row-limited]',
  templateUrl: './settings-row-limited.component.html',
  styleUrls: ['./settings-row-limited.component.sass']
})
export class SettingsRowLimitedComponent {

  @Input() settingsItem: SettingItemTimeIntervalInterface;

  @Output() changeItem = new EventEmitter<SettingItemTimeIntervalInterface>();
  @Output() duplicateItem = new EventEmitter<SettingItemTimeIntervalInterface>();
  @Output() removeItem = new EventEmitter<SettingItemTimeIntervalInterface>();

  constructor() {}

  change(rul: SettingItemTimeIntervalInterface) {
    this.changeItem.emit(rul);
  }

  duplicate(rul: SettingItemTimeIntervalInterface) {
    this.duplicateItem.emit(rul);
  }

  remove(rul: SettingItemTimeIntervalInterface) {
    this.removeItem.emit(rul);
  }

}
