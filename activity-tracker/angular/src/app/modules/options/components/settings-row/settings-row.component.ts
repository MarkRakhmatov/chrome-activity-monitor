import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SettingItemInterface} from "../../types/setting-item.interface";

@Component({
  selector: 'tr[app-settings-row]',
  templateUrl: './settings-row.component.html',
  styleUrls: ['./settings-row.component.scss']
})
export class SettingsRowComponent {
  @Input() settingsItem: SettingItemInterface;

  @Output() changeItem = new EventEmitter<SettingItemInterface>();
  @Output() duplicateItem = new EventEmitter<SettingItemInterface>();
  @Output() removeItem = new EventEmitter<SettingItemInterface>();

  constructor() {}

  change(rul: SettingItemInterface) {
    this.changeItem.emit(rul);
  }

  duplicate(rul: SettingItemInterface) {
    this.duplicateItem.emit(rul);
  }

  remove(rul: SettingItemInterface) {
    this.removeItem.emit(rul);
  }
}
