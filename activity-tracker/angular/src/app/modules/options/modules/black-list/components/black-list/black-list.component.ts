import {Component, OnInit} from '@angular/core';
import {TITLES} from "../../../../enums/enums";
import {SettingItemInterface} from "../../../../types/setting-item";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-black-list',
  templateUrl: './black-list.component.html',
  styleUrls: ['./black-list.component.sass']
})
export class BlackListComponent implements OnInit {
  titles = TITLES;
  blackList: SettingItemInterface[];

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(params => {
      this.blackList = params.blackList || [];
    });
  }

}
