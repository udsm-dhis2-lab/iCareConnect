import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LabConfigurationsComponent } from './pages/lab-configurations/lab-configurations.component';
import { TestSettingsComponent } from './pages/test-settings/test-settings.component';
import { TestsControlComponent } from './pages/tests-control/tests-control.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tests-control',
    pathMatch: 'full',
  },
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'tests-control',
        component: TestsControlComponent,
      },
      {
        path: 'tests-settings',
        component: TestSettingsComponent,
      },
      {
        path: 'lab-configurations',
        component: LabConfigurationsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
