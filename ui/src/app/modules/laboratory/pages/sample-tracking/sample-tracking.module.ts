import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './pages/home/home.component';
import { SampleTrackingRoutingModule } from './sample-tracking-routing.module';
import { SampleTrackingComponent } from './sample-tracking/sample-tracking.component';
import { trackingComponents } from './components';

@NgModule({
  declarations: [SampleTrackingComponent, HomeComponent, ...trackingComponents],
  imports: [CommonModule, SampleTrackingRoutingModule, SharedModule],
})
export class SampleTrackingModule {}
