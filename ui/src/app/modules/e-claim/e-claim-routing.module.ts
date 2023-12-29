import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EClaimHomeComponent } from './pages/e-claim-home/e-claim-home.component';
import { SubmitEClaimComponent } from './pages/submit-e-claim/submit-e-claim.component';

const routes: Routes = [
  {
    path: 'home',
    component: EClaimHomeComponent,
    data: { title: 'E-Claim Home' }, // Add a title for the route if needed
  },
  {
    path: 'submit/:patientId',
    component: SubmitEClaimComponent,
    data: { title: 'Submit E-Claim' }, // Add a title for the route if needed
  },
  {
    path: '', // Redirect to home if no path provided
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EClaimRoutingModule {}
