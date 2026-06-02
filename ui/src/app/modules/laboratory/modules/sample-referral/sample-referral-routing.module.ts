import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ReferredSamplesComponent } from './components/referred-samples/referred-samples.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,

    children: [
      {
        path: '',
        component: ReferredSamplesComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SampleReferralRoutingModule {}
