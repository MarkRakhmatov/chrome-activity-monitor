import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OptionsComponent} from './pages/options/options.component';
import {BlackListResolver} from "./resolvers/black-list.resolver";
import {WhiteListResolver} from "./resolvers/white-list.resolver";
import {LimitedAccessListResolver} from "./resolvers/limited-access-list.resolver";
import {BlackListComponent} from "./components/black-list/black-list.component";

const routes: Routes = [
  {
    path: '',
    component: OptionsComponent,
    resolve: {
      blackList: BlackListResolver,
      whiteList: WhiteListResolver,
      limitedAccessList: LimitedAccessListResolver
    }
  },
  {path: 'blackList', component: BlackListComponent}
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class OptionsRoutingModule {
}
