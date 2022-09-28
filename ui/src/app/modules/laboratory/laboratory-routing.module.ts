import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LaboratorySampleCollectionComponent } from "./modules/sample-collection/pages/laboratory-sample-collection/laboratory-sample-collection.component";
import { SampleCollectionHomeComponent } from "./modules/sample-collection/pages/sample-collection-home/sample-collection-home.component";
import { LaboratoryComponent } from "./laboratory.component";
import { NoLabAccessComponent } from "./pages/no-lab-access/no-lab-access.component";

const routes: Routes = [
  {
    path: "",
    component: LaboratoryComponent,
    children: [
      {
        path: "no-lab-access",
        component: NoLabAccessComponent,
      },
      {
        path: "sample-registration",
        loadChildren: () =>
          import(
            "./modules/sample-registration/sample-registration.module"
          ).then((m) => m.SampleRegistrationModule),
      },
      {
        path: "sample-collection",
        loadChildren: () =>
          import("./modules/sample-collection/sample-collection.module").then(
            (m) => m.SampleCollectionModule
          ),
      },
      {
        path: "lab-investigation-home",
        loadChildren: () =>
          import(
            "./modules/laboratory-investigation/laboratory-investigation.module"
          ).then((m) => m.LaboratoryInvestigationModule),
      },
      {
        path: "sample-tracking",
        loadChildren: () =>
          import("./modules/sample-tracking/sample-tracking.module").then(
            (m) => m.SampleTrackingModule
          ),
      },
      {
        path: "settings",
        loadChildren: () =>
          import("./modules/settings/settings.module").then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: "reports",
        loadChildren: () =>
          import("./modules/lab-reports/reports.module").then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: "sample-acceptance-and-results",
        loadChildren: () =>
          import(
            "./modules/sample-acceptance-and-results/sample-acceptance-and-results.module"
          ).then((m) => m.SampleAcceptanceAndResultsModule),
      },
      {
        path: "sample-results-list",
        loadChildren: () =>
          import("./modules/sample-results/sample-results.module").then(
            (m) => m.SampleResultsModule,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaboratoryRoutingModule {}
