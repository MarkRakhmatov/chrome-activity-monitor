import { Component, OnInit } from '@angular/core';
import {TITLES} from "../../../../enums/enums";
import {SettingItemInterface} from "../../../../types/setting-item";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-access-list',
  templateUrl: './access-list.component.html',
  styleUrls: ['./access-list.component.sass']
})
export class AccessListComponent implements OnInit {

  titles = TITLES;
  accessList: SettingItemInterface[];

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(params => {
      this.accessList = params.limitedAccessList || [];
    });
  }

}
