import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopupComponent } from './pages/popup/popup.component';
import { PopupRoutingModule } from './popup-routing.module';
import { StatisticTableComponent } from './components/statistic-table/statistic-table.component';
import { BlockedSitesComponent } from './components/blocked-sites/blocked-sites.component';

@NgModule({
  declarations: [PopupComponent, StatisticTableComponent, BlockedSitesComponent],
  imports: [CommonModule, PopupRoutingModule]
})
export class PopupModule {}
