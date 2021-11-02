import { Component, OnInit } from '@angular/core';
import {TITLES} from "../../../../enums/enums";
import {SettingItemInterface} from "../../../../types/setting-item";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-white-list',
  templateUrl: './white-list.component.html',
  styleUrls: ['./white-list.component.sass']
})
export class WhiteListComponent implements OnInit {

  titles = TITLES;
  whiteList: SettingItemInterface[];

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(params => {
      this.whiteList = params.whiteList || [];
    });
  }
}
