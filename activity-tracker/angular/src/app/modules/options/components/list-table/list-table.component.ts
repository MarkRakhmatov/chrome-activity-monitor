import { Component, OnInit } from '@angular/core';
import {DAYS_WEEK} from "../../services/date-utils.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {SettingItemInterface} from "../../types/setting-item.interface";

const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

@Component({
  selector: 'app-list-table',
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.scss']
})
export class ListTableComponent implements OnInit {
  weekDays = DAYS_WEEK;
  settingList: SettingItemInterface[] = [];

  formGroup = this.fb.group({
    addressUrl: new FormControl('', [Validators.required,
      Validators.pattern(reg)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    dayWeek: new FormControl('', [Validators.required])
  })

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  addRules() {
    if (this.formGroup.valid) {
      this.settingList.push(this.formGroup.value);
      this.formGroup.reset();
    }
  }
}
