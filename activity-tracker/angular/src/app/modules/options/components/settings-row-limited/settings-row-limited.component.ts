import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SettingItemInterface} from "../../types/setting-item.interface";
import {SettingItemLimitedInterface} from "../../types/setting-item-limited";

@Component({
  selector: 'tr[app-settings-row-limited]',
  templateUrl: './settings-row-limited.component.html',
  styleUrls: ['./settings-row-limited.component.sass']
})
export class SettingsRowLimitedComponent {

  @Input() settingsItem: SettingItemLimitedInterface;

  @Output() changeItem = new EventEmitter<SettingItemLimitedInterface>();
  @Output() duplicateItem = new EventEmitter<SettingItemLimitedInterface>();
  @Output() removeItem = new EventEmitter<SettingItemLimitedInterface>();

  constructor() {}

  change(rul: SettingItemLimitedInterface) {
    this.changeItem.emit(rul);
  }

  duplicate(rul: SettingItemLimitedInterface) {
    this.duplicateItem.emit(rul);
  }

  remove(rul: SettingItemLimitedInterface) {
    this.removeItem.emit(rul);
  }

}
