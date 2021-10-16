import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BlackListRoutingModule} from "./black-list-routing.module";
import { BlackListComponent } from './components/black-list/black-list.component';
import {OptionsModule} from "../../options.module";



@NgModule({
  declarations: [
    BlackListComponent
  ],
  imports: [
    CommonModule,
    BlackListRoutingModule,
    OptionsModule
  ]
})
export class BlackListModule { }
