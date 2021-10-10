import {Component, Input, OnInit} from '@angular/core';
import {DAYS_WEEK} from "../../services/date-utils.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {SettingItem, SettingItemInterface} from "../../types/setting-item.interface";
import {ValidPeriodDate} from "../../../../shared/validators/valid-period-date";

const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

@Component({
  selector: 'app-list-table',
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.scss']
})
export class ListTableComponent implements OnInit {
  @Input() title;
  weekDays = DAYS_WEEK;
  settingList: SettingItemInterface[] = [];

  formGroup = this.fb.group({
      addressUrl: new FormControl('', [Validators.required,
        Validators.pattern(reg)]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      dayWeek: new FormControl(null, [Validators.required])
    },
    {
      validators: [this.validPeriodDate.validateDateRange()],
      updateOn: 'change',
    })

  constructor(private fb: FormBuilder,
              private validPeriodDate: ValidPeriodDate) {
  }

  ngOnInit(): void {
  }

  addRules($event) {
    $event.preventDefault();

    if (this.formGroup.valid) {
      const item = new SettingItem(this.formGroup.value);
      this.settingList.push(item);
      this.formGroup.reset();
    }
  }

  changeItem($event: SettingItemInterface) {
    this.removeItem($event);
    this.formGroup.patchValue($event);
  }

  duplicateItem($event: SettingItemInterface) {
    const settingItem = new SettingItem($event);
    this.settingList.push(settingItem);
  }

  removeItem($event: SettingItemInterface) {
    this.settingList = this.settingList.filter(item => item.id !== $event.id);
  }
}
