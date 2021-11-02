import {RouterModule, Routes} from "@angular/router";
import {BlackListResolver} from "../../resolvers/black-list.resolver";
import {NgModule} from "@angular/core";
import {BlackListComponent} from "./components/black-list/black-list.component";

const routes: Routes = [
  {
    path: '',
    component: BlackListComponent,
    resolve: {
      blackList: BlackListResolver
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlackListRoutingModule {
}
