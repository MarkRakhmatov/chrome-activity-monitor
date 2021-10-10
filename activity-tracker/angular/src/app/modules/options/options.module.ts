import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OptionsRoutingModule } from './options-routing.module';
import { OptionsComponent } from './pages/options/options.component';
import { ListTableComponent } from './components/list-table/list-table.component';
import {ReactiveFormsModule} from "@angular/forms";
import { SettingsRowComponent } from './components/settings-row/settings-row.component';
import { LimitedListTableComponent } from './components/limited-list-table/limited-list-table.component';
import { SettingsRowLimitedComponent } from './components/settings-row-limited/settings-row-limited.component';

@NgModule({
  declarations: [OptionsComponent, ListTableComponent, SettingsRowComponent, LimitedListTableComponent, SettingsRowLimitedComponent],
  imports: [CommonModule, OptionsRoutingModule, ReactiveFormsModule]
})
export class OptionsModule {}
