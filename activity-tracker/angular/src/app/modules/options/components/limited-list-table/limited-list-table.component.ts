import {Component, Input, OnInit} from '@angular/core';
import {DAYS_WEEK} from "../../services/date-utils.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {SettingItemTimeInterval, SettingItemTimeIntervalInterface} from "../../types/setting-item-time-interval";
import {StorageService} from "../../services/storage.service";
import { SettingItemInterface } from "../../types/setting-item";

export const REG_EXP_URL = new RegExp("^(((([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]))\s*\n*\r*)+$");

@Component({
  selector: 'app-limited-list-table',
  templateUrl: './limited-list-table.component.html',
  styleUrls: ['./limited-list-table.component.sass']
})
export class LimitedListTableComponent implements OnInit {
  @Input() title;
  @Input() settingList: SettingItemTimeIntervalInterface[] = [];

  weekDays = DAYS_WEEK;

  formGroup = this.fb.group({
    site: new FormControl('', [Validators.required,
      Validators.pattern(REG_EXP_URL)]),
    timeInterval: new FormControl('', Validators.required),
    days: new FormControl(null, [Validators.required])
  })

  constructor(private fb: FormBuilder,
              private storage: StorageService) {
  }

  ngOnInit(): void {
  }

  saveItem($event) {
    $event.preventDefault();

    if (this.formGroup.valid) {
      const item = new SettingItemTimeInterval(this.formGroup.value);
      this.settingList.push(item);
      this.storage.setStorage<SettingItemInterface>(this.title, this.settingList);
      this.formGroup.reset();
    }
  }

  changeItem($event: SettingItemTimeIntervalInterface) {
    this.removeItem($event);
    this.formGroup.patchValue($event);
  }

  duplicateItem($event: SettingItemTimeIntervalInterface) {
    const settingItem = new SettingItemTimeInterval($event);
    this.settingList.push(settingItem);
    this.saveSettingInStorage();
  }

  removeItem($event: SettingItemTimeIntervalInterface) {
    this.settingList = this.settingList.filter(item => item.id !== $event.id);
    this.storage.removeStorageItem(this.title);
    this.saveSettingInStorage();
  }

  saveSettingInStorage() {
    this.storage.setStorage(this.title, this.settingList);
  }
}
