import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { components } from './components';
import { ReportsHomeComponent } from './reports-home/reports-home.component';
import { LabReportsComponent } from './components/lab-reports/lab-reports.component';
import { ReportsDashboardComponent } from './pages/reports-dashboard/reports-dashboard.component';
import { CustomReportsComponent } from './components/custom-reports/custom-reports.component';

@NgModule({
  declarations: [
    ...components,
    ReportsHomeComponent,
    LabReportsComponent,
    ReportsDashboardComponent,
    CustomReportsComponent,
    
  ],
  imports: [CommonModule, ReportsRoutingModule, SharedModule],
})
export class ReportsModule {}
