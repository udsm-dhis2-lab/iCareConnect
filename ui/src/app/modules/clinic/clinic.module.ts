import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicNotificationComponent } from './components/clinic-notification-component';

import { ClinicRoutingModule } from './clinic-routing.module';
import { clinicPages } from './pages';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [...clinicPages, ClinicNotificationComponent],
  providers: [],
  imports: [CommonModule, ClinicRoutingModule, SharedModule],
})
export class ClinicModule {}
