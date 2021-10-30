import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AddUserComponent,
  UserManagementComponent,
  MaintenanceHomeComponent,
  LocationManagementComponent,
  EditUserComponent,
  PriceListHomeComponent,
} from './pages';

const routes: Routes = [
  {
    path: '',
    component: MaintenanceHomeComponent,
    children: [
      // TODO: Need to find best starting page for maintenance
      {
        path: '',
        redirectTo: 'price-list',
      },
      {
        path: 'price-list',
        component: PriceListHomeComponent,
      },
      {
        path: 'users',
        component: UserManagementComponent,
      },
      {
        path: 'location',
        component: LocationManagementComponent,
      },
      {
        path: 'users/add-user',
        component: AddUserComponent,
      },
      {
        path: 'users/edit-user',
        component: EditUserComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaintenanceRoutingModule {}
