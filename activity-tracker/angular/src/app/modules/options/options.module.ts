import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OptionsRoutingModule } from './options-routing.module';
import { OptionsComponent } from './pages/options/options.component';
import { ListTableComponent } from './components/list-table/list-table.component';
import {ReactiveFormsModule} from "@angular/forms";
import { SettingsRowComponent } from './components/settings-row/settings-row.component';

@NgModule({
  declarations: [OptionsComponent, ListTableComponent, SettingsRowComponent],
  imports: [CommonModule, OptionsRoutingModule, ReactiveFormsModule]
})
export class OptionsModule {}
