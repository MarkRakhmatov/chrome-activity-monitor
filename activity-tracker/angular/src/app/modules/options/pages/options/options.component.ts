import {Component, OnInit} from '@angular/core';
import {TITLES} from "../../enums/enums";
import {ActivatedRoute} from "@angular/router";
import {SettingItemInterface} from "../../types/setting-item";
import {SettingItemTimeIntervalInterface} from "../../types/setting-item-time-interval";

@Component({
  selector: 'app-options',
  templateUrl: 'options.component.html',
  styleUrls: ['options.component.scss']
})
export class OptionsComponent implements OnInit {
  titles = TITLES;
  blackList: SettingItemInterface[];
  whiteList: SettingItemInterface[];
  limitedAccessList: SettingItemTimeIntervalInterface[];

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(params => {
      this.blackList = params.blackList || [];
      this.whiteList = params.whiteList || [];
      this.limitedAccessList = params.limitedAccessList || [];
    });
  }


}
