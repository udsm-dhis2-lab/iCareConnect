import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { modules } from "./modules";
import { materialModules } from "./material-modules";
import { components, sharedEntryComponents } from "./components";
import { sharedPipes } from "./pipes";
import { FormModule } from "./modules/form/form.module";
import { sharedDialogs } from "./dialogs";
import { sharedServices } from "./services";
import { FilterFormsByServiceProvidedPipe } from "./pipes/filter-forms-by-service-provided.pipe";
import { FilterFormsByLocationPipe } from "./pipes/filter-forms-by-location.pipe";
import { FilterServicesConceptPipe } from "./pipes/filter-services-concept.pipe";
import { FormatIsoStrDateForDisplayPipe } from "./pipes/format-iso-str-date-for-display.pipe";
import { FilterDiagnosesPipe } from "./pipes/filter-diagnoses.pipe";
import { FilterItemsBySelectionsPipe } from "./pipes/filter-items-by-selections.pipe";
import { HttpClientModule } from "@angular/common/http";
import { SearchTestDetailsPipe } from "./pipes/search-test-details.pipe";
import { FormatLabelCharCountDisplayPipe } from "./pipes/format-label-char-count-display.pipe";
import { sharedStoreModals } from "./store-modals";
import { sharedStorePages } from "./store-pages";
import { sharedStoreComponents } from "./store-components";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
@NgModule({
  imports: [
    CommonModule,
    ...materialModules,
    ...modules,
    NgxMatSelectSearchModule,
  ],
  exports: [
    CommonModule,
    FormModule,
    ...materialModules,
    ...modules,
    ...components,
    ...sharedStorePages,
    ...sharedStoreComponents,
    ...sharedStoreModals,
    ...sharedPipes,
    ...sharedDialogs,
    ...sharedEntryComponents,
    HttpClientModule,
    NgxMatSelectSearchModule,
  ],
  declarations: [
    ...components,
    ...sharedStorePages,
    ...sharedStoreComponents,
    ...sharedStoreModals,
    ...sharedDialogs,
    ...sharedPipes,
    FilterFormsByServiceProvidedPipe,
    FilterFormsByLocationPipe,
    FilterServicesConceptPipe,
    FormatIsoStrDateForDisplayPipe,
    FilterDiagnosesPipe,
    FilterItemsBySelectionsPipe,
    SearchTestDetailsPipe,
    FormatLabelCharCountDisplayPipe,
  ],
  providers: [...sharedServices],
})
export class SharedModule {}
