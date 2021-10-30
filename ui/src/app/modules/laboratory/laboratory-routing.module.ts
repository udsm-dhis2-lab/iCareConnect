import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LaboratoryHomeComponent } from './pages/laboratory-home/laboratory-home.component';
import { LaboratorySampleCollectionComponent } from './pages/laboratory-sample-collection/laboratory-sample-collection.component';
import { CollectedLabSamplesComponent } from './pages/collected-lab-samples/collected-lab-samples.component';
import { LabSamplesAllocationComponent } from './pages/lab-samples-allocation/lab-samples-allocation.component';
import { LabTestsManagementComponent } from './pages/lab-tests-management/lab-tests-management.component';
import { SampleTrackingDashboardComponent } from './pages/sample-tracking-dashboard/sample-tracking-dashboard.component';
import { SampleCollectionHomeComponent } from './pages/sample-collection-home/sample-collection-home.component';
import { LaboratoryComponent } from './laboratory.component';
import { NoLabAccessComponent } from './pages/no-lab-access/no-lab-access.component';

const routes: Routes = [
  {
    path: '',
    component: LaboratoryComponent,
    children: [
      {
        path: 'no-lab-access',
        component: NoLabAccessComponent,
      },
      {
        path: 'sample-collection-home',
        component: SampleCollectionHomeComponent,
      },
      {
        path: 'sample-collection-home/collection/:patientId/:visitId',
        component: LaboratorySampleCollectionComponent,
      },
      {
        path: 'lab-investigation-home',
        loadChildren: () =>
          import(
            './pages/laboratory-investigation/laboratory-investigation.module'
          ).then((m) => m.LaboratoryInvestigationModule),
      },
      {
        path: 'sample-tracking',
        loadChildren: () =>
          import('./pages/sample-tracking/sample-tracking.module').then(
            (m) => m.SampleTrackingModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./pages/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./pages/lab-reports/reports.module').then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: 'sample-acceptance-and-results',
        loadChildren: () =>
          import(
            './pages/sample-acceptance-and-results/sample-acceptance-and-results.module'
          ).then((m) => m.SampleAcceptanceAndResultsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaboratoryRoutingModule {}
