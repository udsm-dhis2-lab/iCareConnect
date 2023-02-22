import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './pages/home/home.component';
import { SampleResultsRoutingModule } from './sample-results-routing.module';
import { SampleResultsComponent } from "./sample-results/sample-results.component";
import { resultsComponents } from "./components";

@NgModule({
  declarations: [SampleResultsComponent, HomeComponent, ...resultsComponents],
  imports: [CommonModule, SampleResultsRoutingModule, SharedModule],
})
export class SampleResultsModule {}
