import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhiteListComponent } from './components/white-list/white-list.component';
import {OptionsModule} from "../../options.module";
import {WhiteListRoutingModule} from "./white-list-routing.module";



@NgModule({
  declarations: [
    WhiteListComponent
  ],
  imports: [
    CommonModule,
    WhiteListRoutingModule,
    OptionsModule
  ]
})
export class WhitelistModule { }
