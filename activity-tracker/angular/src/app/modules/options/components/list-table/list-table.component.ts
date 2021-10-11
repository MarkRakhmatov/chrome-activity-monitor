import {Component, Input, OnInit} from '@angular/core';
import {DAYS_WEEK} from "../../services/date-utils.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {ValidPeriodDate} from "../../../../shared/validators/valid-period-date";
import {StorageService} from "../../services/storage.service";
import {SettingItemPeriod, SettingItemPeriodInterface} from "../../types/setting-item-period";
import {SettingItemInterface} from "../../types/setting-item";
import {REG_EXP_URL} from "../limited-list-table/limited-list-table.component";

@Component({
  selector: 'app-list-table',
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.scss']
})
export class ListTableComponent implements OnInit {
  @Input() title;
  @Input() settingList: SettingItemInterface[] = [];
  weekDays = DAYS_WEEK;

  formGroup = this.fb.group({
      site: new FormControl('', [Validators.required,
        Validators.pattern(REG_EXP_URL)]),
      timeStart: new FormControl('', [Validators.required]),
      timeEnd: new FormControl('', [Validators.required]),
      days: new FormControl(null, [Validators.required])
    },
    {
      validators: [this.validPeriodDate.validateDateRange()],
      updateOn: 'change',
    })

  constructor(private fb: FormBuilder,
              private validPeriodDate: ValidPeriodDate,
              private storage: StorageService) {
  }

  ngOnInit() {
  }

  saveItem($event) {
    $event.preventDefault();

    if (this.formGroup.valid) {
      const settingItem = new SettingItemPeriod(this.formGroup.value);
      this.settingList.push(settingItem);
      this.saveSettingInStorage();
      this.formGroup.reset();
    }
  }

  changeItem($event: SettingItemPeriodInterface) {
    this.removeItem($event);
    this.formGroup.patchValue($event);
  }

  duplicateItem({site, days, timeEnd, timeStart}: SettingItemPeriodInterface) {
    const settingItem = new SettingItemPeriod({site, days, timeEnd, timeStart});
    this.settingList.push(settingItem);
    this.saveSettingInStorage();
  }

  removeItem($event: SettingItemPeriodInterface) {
    this.settingList = this.settingList.filter(item => item.id !== $event.id);
    this.storage.removeStorageItem(this.title);
    this.saveSettingInStorage();
  }

  saveSettingInStorage(): void {
    this.storage.setStorage(this.title, this.settingList);
  }
}
