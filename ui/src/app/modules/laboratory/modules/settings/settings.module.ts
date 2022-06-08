import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { SettingsComponent } from "./settings/settings.component";
import { SettingsRoutingModule } from "./settings-routing.module";
import { HomeComponent } from "./pages/home/home.component";
import { TestsControlComponent } from "./pages/tests-control/tests-control.component";
import { LabConfigurationsComponent } from "./pages/lab-configurations/lab-configurations.component";
import { TestSettingsComponent } from "./pages/test-settings/test-settings.component";
import { components } from "./components";
import { TestSelectorComponent } from "./components/test-selector/test-selector.component";
import { TestTimeComponent } from "./components/test-time/test-time.component";
import { TestMaleRangeComponent } from "./components/test-male-range/test-male-range.component";
import { TestFemaleRangeComponent } from "./components/test-female-range/test-female-range.component";
import { TimeSettingsListComponent } from "./components/time-settings-list/time-settings-list.component";
import { TestMaleRangeListComponent } from "./components/test-male-range-list/test-male-range-list.component";
import { TestFemaleRangeListComponent } from "./components/test-female-range-list/test-female-range-list.component";
import { TestMethodsDashboardComponent } from "./containers/test-methods-dashboard/test-methods-dashboard.component";
import { SpecimenSourcesDashboardComponent } from "./containers/specimen-sources-dashboard/specimen-sources-dashboard.component";
import { ParametersDashboardComponent } from "./containers/parameters-dashboard/parameters-dashboard.component";
import { ProfilesAndAccessControlComponent } from './containers/profiles-and-access-control/profiles-and-access-control.component';

@NgModule({
  declarations: [
    SettingsComponent,
    HomeComponent,
    TestsControlComponent,
    LabConfigurationsComponent,
    TestSettingsComponent,
    ...components,
    TestSelectorComponent,
    TestTimeComponent,
    TestMaleRangeComponent,
    TestFemaleRangeComponent,
    TimeSettingsListComponent,
    TestMaleRangeListComponent,
    TestFemaleRangeListComponent,
    TestMethodsDashboardComponent,
    SpecimenSourcesDashboardComponent,
    ParametersDashboardComponent,
    ProfilesAndAccessControlComponent,
  ],
  imports: [CommonModule, SettingsRoutingModule, SharedModule],
})
export class SettingsModule {}
