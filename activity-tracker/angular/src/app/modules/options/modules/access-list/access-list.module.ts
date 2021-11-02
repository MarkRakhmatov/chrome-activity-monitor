import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessListComponent } from './components/access-list/access-list.component';
import {AccessListRoutingModule} from "./access-list-routing.module";
import {OptionsModule} from "../../options.module";



@NgModule({
  declarations: [
    AccessListComponent
  ],
  imports: [
    CommonModule,
    AccessListRoutingModule,
    OptionsModule
  ]
})
export class AccessListModule { }
