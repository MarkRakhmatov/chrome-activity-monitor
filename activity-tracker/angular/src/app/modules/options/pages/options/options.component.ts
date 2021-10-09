import { Component } from '@angular/core';
import { TITLES } from "../../enums/enums";

@Component({
  selector: 'app-options',
  templateUrl: 'options.component.html',
  styleUrls: ['options.component.scss']
})
export class OptionsComponent {
  titles = TITLES;

  constructor() {
  }

}
