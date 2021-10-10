import {Component, Input, OnInit} from '@angular/core';
import {DAYS_WEEK} from "../../services/date-utils.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {SettingItemLimited, SettingItemLimitedInterface} from "../../types/setting-item-limited";

const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

@Component({
  selector: 'app-limited-list-table',
  templateUrl: './limited-list-table.component.html',
  styleUrls: ['./limited-list-table.component.sass']
})
export class LimitedListTableComponent implements OnInit {

  @Input() title;
  weekDays = DAYS_WEEK;
  settingList: SettingItemLimitedInterface[] = [];

  formGroup = this.fb.group({
    addressUrl: new FormControl('', [Validators.required,
      Validators.pattern(reg)]),
    timeInterval: new FormControl('', Validators.required),
    dayWeek: new FormControl(null, [Validators.required])
  })

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
  }

  addRules($event) {
    $event.preventDefault();

    if (this.formGroup.valid) {
      const item = new SettingItemLimited(this.formGroup.value);
      this.settingList.push(item);
      this.formGroup.reset();
    }
  }

  changeItem($event: SettingItemLimitedInterface) {
    this.removeItem($event);
    this.formGroup.patchValue($event);
  }

  duplicateItem($event: SettingItemLimitedInterface) {
    const settingItem = new SettingItemLimited($event);
    this.settingList.push(settingItem);
  }

  removeItem($event: SettingItemLimitedInterface) {
    this.settingList = this.settingList.filter(item => item.id !== $event.id);
  }

}
