import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SettingItemPeriodInterface} from "../../types/setting-item-period";

@Component({
  selector: 'tr[app-settings-row]',
  templateUrl: './settings-row.component.html',
  styleUrls: ['./settings-row.component.scss']
})
export class SettingsRowComponent {
  @Input() settingsItem: SettingItemPeriodInterface;

  @Output() changeItem = new EventEmitter<SettingItemPeriodInterface>();
  @Output() duplicateItem = new EventEmitter<SettingItemPeriodInterface>();
  @Output() removeItem = new EventEmitter<SettingItemPeriodInterface>();

  constructor() {}

  change(rul: SettingItemPeriodInterface) {
    this.changeItem.emit(rul);
  }

  duplicate(rul: SettingItemPeriodInterface) {
    this.duplicateItem.emit(rul);
  }

  remove(rul: SettingItemPeriodInterface) {
    this.removeItem.emit(rul);
  }
}
