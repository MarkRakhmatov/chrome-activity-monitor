import {Component, Input, OnInit} from '@angular/core';
import {DAYS_WEEK} from "../../services/date-utils.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {SettingItemInterface} from "../../types/setting-item.interface";
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
      dayWeek: new FormControl('', [Validators.required])
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
      this.settingList.push(this.formGroup.value);
      this.formGroup.reset();
    }
  }

  changeItem($event: SettingItemInterface) {

  }

  duplicateItem($event: SettingItemInterface) {

  }

  removeItem($event: SettingItemInterface) {
    this.settingList = this.settingList.filter(item => item.addressUrl !== $event.addressUrl)
  }
}
