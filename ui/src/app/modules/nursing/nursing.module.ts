import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { nursingComponents } from './components';
import { NursingRoutingModule } from './nursing-routing.module';
import { nursingPages } from './pages';
import { NursingNotificationComponent } from './components/nursing-notification-component/nursing-notification-components';

@NgModule({
  declarations: [...nursingPages, ...nursingComponents, NursingNotificationComponent],
  entryComponents: [],
  providers: [],
  imports: [CommonModule, NursingRoutingModule, SharedModule],
})
export class NursingModule {}
