import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';
import { NgModule } from '@angular/core';
import { PopupComponent } from './pages/popup/popup.component';
import { PopupRoutingModule } from './popup-routing.module';
import { StatisticTableComponent } from './components/statistic-table/statistic-table.component';
import { BlockedSitesComponent } from './components/blocked-sites/blocked-sites.component';
import { TimerPipe } from './pipes/timer.pipe';

@NgModule({
  declarations: [PopupComponent, StatisticTableComponent, BlockedSitesComponent, TimerPipe],
  imports: [CommonModule, PopupRoutingModule],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
})
export class PopupModule {}
