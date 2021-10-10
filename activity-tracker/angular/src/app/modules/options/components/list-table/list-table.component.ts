import {Component, Input, OnInit} from '@angular/core';
import {DAYS_WEEK} from "../../services/date-utils.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {ValidPeriodDate} from "../../../../shared/validators/valid-period-date";
import {StorageService} from "../../services/storage.service";
import {SettingItemPeriod, SettingItemPeriodInterface} from "../../types/setting-item-period";

const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

@Component({
  selector: 'app-list-table',
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.scss']
})
export class ListTableComponent implements OnInit {
  @Input() title;
  weekDays = DAYS_WEEK;
  settingList: SettingItemPeriodInterface[] = [];

  formGroup = this.fb.group({
      site: new FormControl('', [Validators.required,
        Validators.pattern(reg)]),
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

  ngOnInit(): void {
  }

  addRules($event) {
    $event.preventDefault();

    if (this.formGroup.valid) {
      const item = new SettingItemPeriod(this.formGroup.value);
      this.settingList.push(item);
      this.storage.setStorage(this.title, item);
      this.formGroup.reset();
    }
  }

  changeItem($event: SettingItemPeriodInterface) {
    this.removeItem($event);
    this.formGroup.patchValue($event);
  }

  duplicateItem($event: SettingItemPeriodInterface) {
    const settingItem = new SettingItemPeriod($event);
    this.settingList.push(settingItem);
  }

  removeItem($event: SettingItemPeriodInterface) {
    this.settingList = this.settingList.filter(item => item.id !== $event.id);
  }
}
