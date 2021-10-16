import {Component, Inject, Input, OnInit} from '@angular/core';
import {TAB_ID} from '../../../../providers/tab-id.provider';

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit {
  constructor(@Inject(TAB_ID) readonly tabId: number) {
  }

  ngOnInit(): void {

  }

}
