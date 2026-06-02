import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SettingsComponent } from "./settings/settings.component";
import { SettingsRoutingModule } from "./settings-routing.module";
import { HomeComponent } from "./pages/home/home.component";
import { TestSettingsComponent } from "./components/test-settings/test-settings.component";
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
import { ProfilesAndAccessControlComponent } from "./containers/profiles-and-access-control/profiles-and-access-control.component";
import { ExtendedParametersSettingsComponent } from "./containers/extended-parameters-settings/extended-parameters-settings.component";
import { settingsContainers } from "./containers";
import { SampleRegistrationModule } from "../sample-registration/sample-registration.module";
import { SharedLabModule } from "../../shared/modules/shared-lab.module";
import { SharedModule } from "../../../../shared/shared.module";
import { StorageTypeDialogComponent } from "./containers/sample-management/dialog/storage-type-dialog/storage-type-dialog.component";
import { StorageDialogComponent } from "./containers/sample-management/dialog/storage-dialog/storage-dialog.component";
import { StorageLocationTypeDialogComponent } from "./containers/sample-management/dialog/storage-location-type-dialog/storage-location-type-dialog.component";
import { StorageLocationDialogComponent } from "./containers/sample-management/dialog/storage-location-dialog/storage-location-dialog.component";
import { GenerateSlotsDialogComponent } from "./containers/sample-management/dialog/generate-slots-dialog/generate-slots-dialog.component";
import { StorageLocationPreviewDialogComponent } from "./containers/sample-management/dialog/storage-location-preview-dialog/storage-location-preview-dialog.component";
import { DeleteConfirmDialogComponent } from "./containers/sample-management/dialog/delete-confirm-dialog/delete-confirm-dialog.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SettingsRoutingModule,
        SharedModule,
        SampleRegistrationModule,
        SharedLabModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
    ],
    declarations: [
        SettingsComponent,
        HomeComponent,
        TestSettingsComponent,
        ...components,
        ...settingsContainers,
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
        ExtendedParametersSettingsComponent,
        StorageTypeDialogComponent,
        StorageDialogComponent,
        StorageLocationTypeDialogComponent,
        StorageLocationDialogComponent,
        GenerateSlotsDialogComponent,
        StorageLocationPreviewDialogComponent,
        DeleteConfirmDialogComponent
    ],
})
export class SettingsModule { }
