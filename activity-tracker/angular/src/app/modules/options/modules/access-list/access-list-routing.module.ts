import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {AccessListComponent} from "./components/access-list/access-list.component";
import {LimitedAccessListResolver} from "../../resolvers/limited-access-list.resolver";


const routes: Routes = [
  {
    path: '',
    component: AccessListComponent,
    resolve: {
      limitedAccessList: LimitedAccessListResolver
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessListRoutingModule { }
