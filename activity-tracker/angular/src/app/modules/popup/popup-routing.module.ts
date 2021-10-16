import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PopupComponent} from './pages/popup/popup.component';
import {StatisticTableComponent} from "./components/statistic-table/statistic-table.component";
import {BlockedSitesComponent} from "./components/blocked-sites/blocked-sites.component";

const routes: Routes = [
  {
    path: '',
    component: PopupComponent,
    children: [
      {
        path: '/statistic', component: StatisticTableComponent
      },
      {
        path: 'blockedSites', component: BlockedSitesComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PopupRoutingModule {
}
