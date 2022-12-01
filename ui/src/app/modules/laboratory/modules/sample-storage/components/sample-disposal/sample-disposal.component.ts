import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { orderBy } from "lodash";
import { Observable, zip } from "rxjs";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { LISConfigurationsModel } from "src/app/modules/laboratory/resources/models/lis-configurations.model";
import { OtherClientLevelSystemsService } from "src/app/modules/laboratory/resources/services/other-client-level-systems.service";
import { SharedConfirmationComponent } from "src/app/shared/components/shared-confirmation /shared-confirmation.component";
import { SharedSamplesVerificationIntegratedComponent } from "src/app/shared/dialogs/shared-samples-verification-integrated/shared-samples-verification-integrated.component";
import { ConceptsService } from "src/app/shared/resources/concepts/services/concepts.service";
import { SamplesService } from "src/app/shared/services/samples.service";
import {
  addLabDepartments,
  loadLabSamplesByCollectionDates,
} from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import {
  getFormattedLabSamplesForTracking,
  getLabSamplesWithResults,
} from "src/app/store/selectors";

@Component({
  selector: "app-sample-disposal",
  templateUrl: "./sample-disposal.component.html",
  styleUrls: ["./sample-disposal.component.scss"],
})
export class SampleDisposalComponent implements OnInit {
  @Input() allSamples: any[];
  @Input() externalSystemsReferenceConceptUuid: any;
  @Input() LISConfigurations: LISConfigurationsModel;

  @Output() sampleSearch: EventEmitter<any> = new EventEmitter();
  @Output() dispose: EventEmitter<any> = new EventEmitter();

  searchingText: string = "";
  samplesToViewMoreDetails: any = {};
  message: any = {};

  constructor() {}

  ngOnInit(): void {}

  onSearch(e) {
    this.sampleSearch.emit(this.searchingText);
  }

  onToggleViewSampleDetails(event: Event, sample: any): void {
    event.stopPropagation();
    this.samplesToViewMoreDetails[sample?.id] = !this.samplesToViewMoreDetails[
      sample?.id
    ]
      ? sample
      : null;
  }

  onDispose(e: Event, sample: any): void {
    e.stopPropagation();
    this.dispose.emit(sample)
  }
}
