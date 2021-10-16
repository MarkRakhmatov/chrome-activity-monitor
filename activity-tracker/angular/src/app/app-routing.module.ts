import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'popup',
    pathMatch: 'full',
    loadChildren: () => import('./modules/popup/popup.module').then(m => m.PopupModule)
  },
  {
    path: 'options',
    pathMatch: 'full',
    loadChildren: () => import('./modules/options/options.module').then(m => m.OptionsModule)
  },
  {
    path: 'options/blacklist',
    pathMatch: 'full',
    loadChildren: () => import('./modules/options/modules/black-list/black-list.module').then(m => m.BlackListModule)
  },
  {
    path: 'options/whitelist',
    pathMatch: 'full',
    loadChildren: () => import('./modules/options/modules/whitelist/whitelist.module').then(m => m.WhitelistModule)
  },
  {
    path: 'options/accessList',
    pathMatch: 'full',
    loadChildren: () => import('./modules/options/modules/access-list/access-list.module').then(m => m.AccessListModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
