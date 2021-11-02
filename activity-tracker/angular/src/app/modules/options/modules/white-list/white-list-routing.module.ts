import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {WhiteListComponent} from "./components/white-list/white-list.component";
import {WhiteListResolver} from "../../resolvers/white-list.resolver";

const routes: Routes = [
  {
    path: '',
    component: WhiteListComponent,
    resolve: {
      whiteList: WhiteListResolver
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WhiteListRoutingModule { }
