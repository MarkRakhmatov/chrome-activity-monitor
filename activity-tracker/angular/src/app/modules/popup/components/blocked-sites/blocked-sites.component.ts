import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../../options/services/storage.service";
import {SettingItemInterface} from "../../../options/types/setting-item";
import {TITLES} from "../../../options/enums/enums";
import {SettingItemPeriodInterface} from "../../../options/types/setting-item-period";

@Component({
  selector: 'app-blocked-sites',
  templateUrl: './blocked-sites.component.html',
  styleUrls: ['./blocked-sites.component.scss']
})
export class BlockedSitesComponent implements OnInit {

  blockList = this.storageService.getStorageItem<SettingItemPeriodInterface>(TITLES.BLACK);

  constructor(private storageService: StorageService) {
  }

  ngOnInit(): void {
  }

}
