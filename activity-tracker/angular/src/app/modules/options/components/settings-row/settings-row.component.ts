import {Component, Input, OnInit} from '@angular/core';
import {SettingItemInterface} from "../../types/setting-item.interface";

@Component({
  selector: 'tr[app-settings-row]',
  templateUrl: './settings-row.component.html',
  styleUrls: ['./settings-row.component.scss']
})
export class SettingsRowComponent implements OnInit {
  @Input() settingList: SettingItemInterface[];
  constructor() { }

  ngOnInit(): void {
  }

}
