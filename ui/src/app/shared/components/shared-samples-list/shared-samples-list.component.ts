// import {
//   AfterViewInit,
//   ChangeDetectorRef,
//   Component,
//   EventEmitter,
//   Input,
//   OnInit,
//   Output,
// } from "@angular/core";
// import { MatCheckboxChange } from "@angular/material/checkbox";
// import { MatRadioChange } from "@angular/material/radio";
// import { MatSelectChange } from "@angular/material/select";
// import { MatDialog } from "@angular/material/dialog";
// import { Store } from "@ngrx/store";
// import { omit, keyBy } from "lodash";
// import { Observable, of } from "rxjs";
// import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
// import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
// import { SamplesService } from "src/app/shared/services/samples.service";
// import { AppState } from "src/app/store/reducers";
// import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
// import { VisitsService } from "../../resources/visits/services";
// import { map } from "rxjs/operators";
// import { webSocket } from "rxjs/webSocket";
// import { BarCodeModalComponent } from "src/app/shared/dialogs/bar-code-modal/bar-code-modal.component";
// import { formatDateToYYMMDD } from "../../helpers/format-date.helper";
// import { SampleDisposeDialogComponent, SampleStoreDialogComponent } from "../../dialogs";

// @Component({
//   selector: "app-shared-samples-list",
//   templateUrl: "./shared-samples-list.component.html",
//   styleUrls: ["./shared-samples-list.component.scss"],
// })
// export class SharedSamplesListComponent implements OnInit, AfterViewInit {
//   @Input() LISConfigurations: any;
//   @Input() labSamplesDepartments: any;
//   @Input() tabType: string;
//   @Input() datesParameters: any;
//   @Input() excludeAllocations: boolean;
//   @Input() sampleTypes: any[];
//   @Input() codedSampleRejectionReasons: any[];
//   @Input() category: string;
//   @Input() hasStatus: string;
//   @Input() acceptedBy: string;
//   @Input() showLegend: boolean;
//   @Input() barcodeSettings: any;
//   @Input() excludedSampleCategories: string[];
//   samplesToViewMoreDetails: any = {};
//   selectedDepartment: string;
//   searchingText: string;
//   page: number = 1;
//   pageSize: number = 10;
//   @Output() resultEntrySample: EventEmitter<any> = new EventEmitter<any>();
//   @Output() selectedSampleDetails: EventEmitter<any> = new EventEmitter<any>();
//   selectedSamples: any[] = [];
//   @Output() samplesForAction: EventEmitter<any[]> = new EventEmitter<any[]>();

//   samples$: Observable<{ pager: any; results: any[] }>;
//   labEquipments$: Observable<any[]>;

//   pageCounts: any[] = [1, 5, 10, 20, 25, 50, 100, 200];

//   searchingTestField: any;
//   searchingSpecimenSourceField: any;
//   searchingEquipmentsField: any;
//   keyedSelectedSamples: any = {};
//   instrumentUuid: string;
//   testUuid: string;
//   specimenUuid: string;
//   dapartment: string;
//   connection: any;

//   itemsToShow: any = {};
//   currentUser$: Observable<any>;
//   listType: string = "patients";

//   currentSamplesByVisits$: Observable<any[]>;
//   currentVisit: any;
//   sampleVisitParameters: any;
//   allCurrentPatientSamplesSelected: boolean = false;
//   currentPatientSelectedSamples: any = {};
//   currentPatientSelectedSamplesCount: number = 0;
//   showModal: boolean = false;

//   constructor(
//     private sampleService: SamplesService,
//     private dialog: MatDialog,
//     private store: Store<AppState>,
//     private visitsService: VisitsService,
//     private cdr: ChangeDetectorRef
//   ) {}


  
//   ngAfterViewInit(): void {
//     this.connection = webSocket(this.barcodeSettings?.socketUrl);
//     this.connection.subscribe({
//       next: (msg) => console.log("message received: ", msg),
//       error: (err) => console.log(err),
//       complete: () => console.log("complete"),
//     });
//     // [tabType]="'completed-samples'"
//     if (this.listType === "samples") {
      
//       this.getSamples({
//         category: this.category,
//         hasStatus: this.hasStatus,
//         pageSize: this.pageSize,
//         page: this.page,
//       });
//     } else {
//       this.getPatients();
//     }
//     this.cdr.detectChanges(); 
//   }

//   ngOnInit(): void {
//     this.listType = !this.LISConfigurations?.isLIS ? "patients" : "samples";
//     this.pageSize = this.tabType == "completed-samples"?200:100;
//     this.sampleVisitParameters = {
//       hasStatus: this.hasStatus,
//       sampleCategory:
//         this.category === "COLLECTED" && this.tabType !== "sample-tracking"
//           ? "NOT ACCEPTED"
//           : this.category,
//     };
    
//     this.searchingTestField = new Dropdown({
//       id: "test",
//       key: "test",
//       label: "Search by Test",
//       searchControlType: "concept",
//       searchTerm: "TEST_ORDERS",
//       conceptClass: "Test",
//       shouldHaveLiveSearchForDropDownFields: true,
//     });

//     this.searchingSpecimenSourceField = new Dropdown({
//       id: "specimen",
//       key: "specimen",
//       label: "Search by Specimen type",
//       searchControlType: "concept",
//       searchTerm: "SPECIMEN_SOURCE",
//       conceptClass: "Specimen",
//       shouldHaveLiveSearchForDropDownFields: true,
//     });
//     // TODO: Consider to put class name for instruments on global property
//     this.searchingEquipmentsField = new Dropdown({
//       id: "instrument",
//       key: "instrument",
//       label: "Search by Instrument/Method",
//       searchControlType: "concept",
//       searchTerm: "LIS_INSTRUMENT",
//       conceptClass: "LIS instrument",
//       shouldHaveLiveSearchForDropDownFields: true,
//     });

//     this.currentUser$ = this.store.select(getCurrentUserDetails);
//   }

//   toggleCurrentPatientSamples(event: MatCheckboxChange, samples: any[]): void {
//     if (event.checked) {
//       this.allCurrentPatientSamplesSelected = true;
//       this.currentPatientSelectedSamples = keyBy(samples, "uuid");
//     } else {
//       this.allCurrentPatientSamplesSelected = false;
//       this.currentPatientSelectedSamples = {};
//     }
//     this.currentPatientSelectedSamplesCount = Object.keys(
//       this.currentPatientSelectedSamples
//     )?.length;
//   }

//   toggleCurrentPatientSample(
//     event: MatCheckboxChange,
//     sample: any,
//     allSamples: any[]
//   ): void {
//     if (event.checked) {
//       this.currentPatientSelectedSamples[sample?.uuid] = sample;
//       this.allCurrentPatientSamplesSelected =
//         allSamples?.length ===
//         Object.keys(this.currentPatientSelectedSamples)?.length;
//     } else {
//       this.currentPatientSelectedSamples = omit(
//         this.currentPatientSelectedSamples,
//         sample?.id
//       );
//       this.allCurrentPatientSamplesSelected = false;
//     }
//     this.currentPatientSelectedSamplesCount = Object.keys(
//       this.currentPatientSelectedSamples
//     )?.length;
//   }

//   onRejectAllCurrentPatientSamples(event: Event): void {
//     event.stopPropagation();
//     this.selectedSampleDetails.emit({
//       data: Object.keys(this.currentPatientSelectedSamples).map(
//         (key) => this.currentPatientSelectedSamples[key]
//       ),
//       actionType: "reject",
//     });
//     this.allCurrentPatientSamplesSelected = false;
//     this.currentPatientSelectedSamples = {};
//     this.currentPatientSelectedSamplesCount = 0;
//   }

//   onAcceptAllCurrentPatientSamples(event: Event): void {
//     event.stopPropagation();

//     this.selectedSampleDetails.emit({
//       data: Object.keys(this.currentPatientSelectedSamples).map(
//         (key) => this.currentPatientSelectedSamples[key]
//       ),
//       actionType: "accept",
//     });
//     this.allCurrentPatientSamplesSelected = false;
//     this.currentPatientSelectedSamples = {};
//     this.currentPatientSelectedSamplesCount = 0;
//   }

//   toggleListType(event: MatRadioChange): void {
//     this.listType = event.value;
//     if (this.listType === "samples") {
//       this.getSamples({
//         pageSize: this.pageSize,
//         page: this.page,
//         category:
//           this.category === "COLLECTED" && this.tabType !== "sample-tracking"
//             ? "NOT ACCEPTED"
//             : this.category,
//         hasStatus: this.hasStatus,
//       });
//     } else {
//       this.getPatients();
//     }
//   }

//   toggleItemToShow(event: MatCheckboxChange, item: string): void {
//     if (event?.checked) {
//       this.itemsToShow[item] = true;
//     } else {
//       this.itemsToShow[item] = false;
//     }
//   }

//   getPatients(): void {
//     this.samples$ = this.visitsService
//       .getAllVisits(
//         null,
//         false,
//         false,
//         null,
//         0,
//         this.pageSize,
//         null,
//         null,
//         null,
//         null,
//         null,
//         null,
//         null,
//         this.category,
//         this.excludedSampleCategories
//       )
//       .pipe(
//         map((response) => {
//           return {
//             pager: null,
//             results: response?.map((visitData) => visitData?.visit),
//           };
//         })  
//       );
      
//   }

//   getSamplesListByVisit(event: Event, visit: any, parameters: any): void {
 
//     event.stopPropagation();
//     this.currentVisit = visit;
//     this.showModal=true;
//     this.currentSamplesByVisits$ = this.visitsService.getSamplesByVisitUuid(
//       visit?.uuid,
//       parameters
//     );
    
//   }

//   getSamples(params?: any): void {
//     const category =
//       params.category === "COLLECTED" && this.tabType !== "sample-tracking"
//         ? "NOT ACCEPTED"
//         : params.category;
//     this.samples$ = this.sampleService.getLabSamplesByCollectionDates(
//       this.datesParameters,
//       category,
//       params?.hasStatus,
//       this.excludeAllocations,
//       this.tabType ? this.tabType : null,
//       this.excludedSampleCategories ? this.excludedSampleCategories : null,
//       {
//         pageSize: params?.pageSize,
//         page: params?.page,
//       },
//       {
//         departments: this.labSamplesDepartments,
//         specimenSources: this.sampleTypes,
//         codedRejectionReasons: this.codedSampleRejectionReasons,
//       },
//       this.acceptedBy,
//       params?.q,
//       params?.dapartment,
//       params?.testUuid,
//       params?.instrument,
//       params?.specimenUuid,
//       this.LISConfigurations?.isLIS
//         ? localStorage?.getItem("currentLocation").indexOf("{") > -1
//           ? JSON.parse(localStorage?.getItem("currentLocation"))?.uuid
//           : null
//         : null
//     );
//   }

//   onPageChange(event: any): void {
//     this.page = this.page + (event?.pageIndex - event?.previousPageIndex);
//     this.pageSize = event?.pageSize;
//     this.getSamples({
//       category: this.category,
//       hasStatus: this.hasStatus,
//       pageSize: this.pageSize,
//       page: this.page,
//       testUuid: this.testUuid,
//       specimenUuid: this.specimenUuid,
//       instrument: this.instrumentUuid,
//       dapartment: this.dapartment,
//     });
//   }

//   onToggleViewSampleDetails(event: Event, sample: any): void {
//     event.stopPropagation();
//     if (!this.samplesToViewMoreDetails[sample?.uuid]) {
//       this.samplesToViewMoreDetails[sample?.uuid] = sample;
//     } else {
//       this.samplesToViewMoreDetails = omit(
//         this.samplesToViewMoreDetails,
//         sample?.uuid
//       );
//     }
//   }


//   onStore(event: Event, sample: any): void {
//     event.stopPropagation();
//     this.dialog
//       .open(SampleStoreDialogComponent, {
//         width: "720px",
//         maxWidth: "95vw",
//         disableClose: true,
//         panelClass: "custom-dialog-container",
//         data: {
//           sample,
//           LISConfigurations: this.LISConfigurations,
//         },
//       })
//       .afterClosed()
//       .subscribe((result) => {
//         if (result?.saved) {
//           this.refreshVisibleSamples();
//         }
//       });
//   }

//   onOpenDisposeDialog(event: Event, sample: any): void {
//     event.stopPropagation();
//     if (sample?.disposedStatus) {
//       return;
//     }

//     this.dialog
//       .open(SampleDisposeDialogComponent, {
//         width: "720px",
//         maxWidth: "95vw",
//         disableClose: true,
//         panelClass: "custom-dialog-container",
//         data: {
//           sample,
//           LISConfigurations: this.LISConfigurations,
//         },
//       })
//       .afterClosed()
//       .subscribe((result) => {
//         if (result?.saved) {
//           this.refreshVisibleSamples();
//         }
//       });
//   }

//   private refreshVisibleSamples(): void {
//     if (this.listType === "samples") {
//       this.getSamples({
//         category: this.category,
//         hasStatus: this.hasStatus,
//         pageSize: this.pageSize,
//         page: this.page,
//         q: this.searchingText,
//         testUuid: this.testUuid,
//         specimenUuid: this.specimenUuid,
//         instrument: this.instrumentUuid,
//         dapartment: this.dapartment,
//       });
//     } else if (this.currentVisit?.uuid) {
//       this.currentSamplesByVisits$ = this.visitsService.getSamplesByVisitUuid(
//         this.currentVisit?.uuid,
//         this.sampleVisitParameters
//       );
//     }
//   }

//   onSelectDepartment(event: MatSelectChange): void {
//     this.dapartment = event?.value?.uuid;
//     this.getSamples({
//       category: this.category,
//       hasStatus: this.hasStatus,
//       pageSize: this.pageSize,
//       page: 1,
//       q: this.searchingText,
//       testUuid: this.testUuid,
//       specimenUuid: this.specimenUuid,
//       instrument: this.instrumentUuid,
//       dapartment: this.dapartment,
//     });
//   }

//   onResultsEntryAndReview(e: Event, sample: any): void {
//     e.stopPropagation();
//     this.resultEntrySample.emit(sample);
//   }

//   onPrint(event: Event, sample: any): void {
//     event.stopPropagation();
//     this.selectedSampleDetails.emit(sample);
//   }

//   onAccept(event: Event, samples: any[], actionType?: string): void {
//     event.stopPropagation();
//     this.selectedSampleDetails.emit({ data: samples, actionType });
//   }
//   onReject(event: Event, samples: any[], actionType?: string): void {
//     event.stopPropagation();
//     this.selectedSampleDetails.emit({ data: samples, actionType });
//   }

//   onGetSelectedSampleDetails(event: Event, sample: any, action: string): void {
//     event.stopPropagation();
//     this.selectedSampleDetails.emit({ data: sample, action: action });
//   }

//   onSelectItem(event: MatCheckboxChange, sample: any): void {
//     this.selectedSamples = event?.checked
//       ? [...this.selectedSamples, sample]
//       : this.selectedSamples?.filter(
//           (selectedSample) => selectedSample?.label !== sample?.label
//         ) || [];
//     this.keyedSelectedSamples[sample?.id] = sample;
//     this.samplesForAction.emit(this.selectedSamples);
//   }

//   onSelectAll(event: MatCheckboxChange, samples: any[]): void {
//     this.selectedSamples = [];
//     this.selectedSamples = event?.checked
//       ? [...this.selectedSamples, ...samples]
//       : [];
//     this.keyedSelectedSamples =
//       this.selectedSamples?.length > 0 ? keyBy(this.selectedSamples, "id") : {};
//     this.samplesForAction.emit(this.selectedSamples);
//   }

//   onSearchSamples(event): void {
//     this.searchingText = (event.target as HTMLInputElement)?.value;
//     this.getSamples({
//       category: this.category,
//       hasStatus: this.hasStatus,
//       pageSize: this.pageSize,
//       page: 1,
//       q: this.searchingText,
//     });
//   }

//   onSearchByTest(formValue: FormValue): void {
//     this.testUuid = formValue.getValues()?.test?.value;
//     this.getSamples({
//       category: this.category,
//       hasStatus: this.hasStatus,
//       pageSize: this.pageSize,
//       page: 1,
//       q: this.searchingText,
//       testUuid: this.testUuid,
//       specimenUuid: this.specimenUuid,
//       instrument: this.instrumentUuid,
//       dapartment: this.dapartment,
//     });
//   }

//   onSearchBySpecimen(formValue: FormValue): void {
//     this.specimenUuid = formValue.getValues()?.specimen?.value;
//     this.getSamples({
//       category: this.category,
//       hasStatus: this.hasStatus,
//       pageSize: this.pageSize,
//       page: 1,
//       q: this.searchingText,
//       testUuid: this.testUuid,
//       specimenUuid: this.specimenUuid,
//       instrument: this.instrumentUuid,
//       dapartment: this.dapartment,
//     });
//   }

//   onSearchByEquipment(formValue: FormValue): void {
//     this.instrumentUuid = formValue.getValues()?.instrument?.value;
//     this.getSamples({
//       instrument: this.instrumentUuid,
//       category: this.category,
//       hasStatus: this.hasStatus,
//       pageSize: this.pageSize,
//       page: 1,
//       q: this.searchingText,
//       testUuid: this.testUuid,
//       specimenUuid: this.specimenUuid,
//       dapartment: this.dapartment,
//     });
//   }

//   onDispose(event: Event, sample: any): void {
//     this.onOpenDisposeDialog(event, sample);
//   }

//   onPrintBarcode(event: Event, sample: any): void {
//     const data = {
//       identifier: sample?.label,
//       sample: sample,
//       sampleLabelsUsedDetails: [sample],
//       isLis: this.LISConfigurations?.isLIS,
//     };

//     this.dialog
//       .open(BarCodeModalComponent, {
//         height: "200px",
//         width: "20%",
//         data,
//         disableClose: false,
//         panelClass: "custom-dialog-container",
//       })
//       .afterClosed()
//       .subscribe((results) => {
//         if (results) {
//           let tests = [];
//           results?.sampleData?.orders?.forEach((order) => {
//             tests = [
//               ...tests,
//               order?.order?.shortName?.split("TEST_ORDERS:")?.join(""),
//             ];
//           });

//           const message = {
//             SampleID: results?.sampleData?.label,
//             Tests: tests?.join(","),
//             PatientNames: `${results?.sampleData?.patient?.givenName} ${
//               results?.sampleData?.patient?.middleName?.length
//                 ? results?.sampleData?.patient?.middleName
//                 : ""
//             } ${results?.sampleData?.patient?.familyName}`,
//             Date: formatDateToYYMMDD(
//               new Date(results?.sampleData?.created),
//               true
//             ),
//             Storage: "",
//             Department:
//               results?.sampleData?.department?.shortName
//                 ?.split("LAB_DEPARTMENT:")
//                 .join("") || "",
//             BarcodeData: results?.sampleData?.label
//               ?.split(this.barcodeSettings?.textToIgnore)
//               .join(""),
//           };

//           this.connection.next({
//             Message: message,
//             Description: "Message of data to be printed",
//             Type: "print",
//           });
//         }
//       });
//   }

//   closeModal(){
//     this.showModal = false;
//   }
// }
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatRadioChange } from "@angular/material/radio";
import { MatSelectChange } from "@angular/material/select";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Store } from "@ngrx/store";
import { omit, keyBy } from "lodash";
import { Observable, of } from "rxjs";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { SamplesService } from "src/app/shared/services/samples.service";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
import { VisitsService } from "../../resources/visits/services";
import { map, tap } from "rxjs/operators";
import { webSocket } from "rxjs/webSocket";
import { BarCodeModalComponent } from "src/app/shared/dialogs/bar-code-modal/bar-code-modal.component";
import { formatDateToYYMMDD } from "../../helpers/format-date.helper";
import { SampleDisposeDialogComponent, SampleStoreDialogComponent } from "../../dialogs";
import { SampleReferralService } from "src/app/modules/laboratory/modules/sample-referral/services/referral-samples.service";

@Component({
  selector: "app-shared-samples-list",
  templateUrl: "./shared-samples-list.component.html",
  styleUrls: ["./shared-samples-list.component.scss"],
})
export class SharedSamplesListComponent implements OnInit, AfterViewInit {
  @Input() LISConfigurations: any;
  @Input() labSamplesDepartments: any;
  @Input() tabType: string;
  @Input() datesParameters: any;
  @Input() excludeAllocations: boolean;
  @Input() sampleTypes: any[];
  @Input() codedSampleRejectionReasons: any[];
  @Input() category: string;
  @Input() hasStatus: string;
  @Input() acceptedBy: string;
  @Input() showLegend: boolean;
  @Input() barcodeSettings: any;
  @Input() excludedSampleCategories: string[];
  samplesToViewMoreDetails: any = {};
  selectedDepartment: string;
  searchingText: string;
  page: number = 1;
  pageSize: number = 10;
  @Output() resultEntrySample: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedSampleDetails: EventEmitter<any> = new EventEmitter<any>();
  selectedSamples: any[] = [];
  @Output() samplesForAction: EventEmitter<any[]> = new EventEmitter<any[]>();

  samples$: Observable<{ pager: any; results: any[] }>;
  labEquipments$: Observable<any[]>;
  sampleReferralSettings$: Observable<any>;

  pageCounts: any[] = [1, 5, 10, 20, 25, 50, 100, 200];

  searchingTestField: any;
  searchingSpecimenSourceField: any;
  searchingEquipmentsField: any;
  keyedSelectedSamples: any = {};
  instrumentUuid: string;
  testUuid: string;
  specimenUuid: string;
  dapartment: string;
  connection: any;

  itemsToShow: any = {};
  currentUser$: Observable<any>;
  currentUserUuid: string = "";
  listType: string = "patients";

  currentSamplesByVisits$: Observable<any[]>;
  currentVisit: any;
  sampleVisitParameters: any;
  allCurrentPatientSamplesSelected: boolean = false;
  currentPatientSelectedSamples: any = {};
  currentPatientSelectedSamplesCount: number = 0;
  showModal: boolean = false;

  constructor(
    private sampleService: SamplesService,
    private dialog: MatDialog,
    private store: Store<AppState>,
    private visitsService: VisitsService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private sampleReferralService: SampleReferralService
  ) {}

  ngAfterViewInit(): void {
    this.connection = webSocket(this.barcodeSettings?.socketUrl);
    this.connection.subscribe({
      next: (msg) => console.log("message received: ", msg),
      error: (err) => console.log(err),
      complete: () => console.log("complete"),
    });
    // [tabType]="'completed-samples'"
    if (this.listType === "samples") {
      this.getSamples({
        category: this.category,
        hasStatus: this.hasStatus,
        pageSize: this.pageSize,
        page: this.page,
      });
    } else {
      this.getPatients();
    }
    this.cdr.detectChanges();
  }

  async ngOnInit(): Promise<void> {
    this.listType = !this.LISConfigurations?.isLIS ? "patients" : "samples";
    this.pageSize = this.tabType == "completed-samples" ? 200 : 100;
    this.sampleVisitParameters = {
      hasStatus: this.hasStatus,
      sampleCategory:
        this.category === "COLLECTED" && this.tabType !== "sample-tracking"
          ? "NOT ACCEPTED"
          : this.category,
    };

    await this.sampleReferralService.getReferralSettings().toPromise()

    this.searchingTestField = new Dropdown({
      id: "test",
      key: "test",
      label: "Search by Test",
      searchControlType: "concept",
      searchTerm: "TEST_ORDERS",
      conceptClass: "Test",
      shouldHaveLiveSearchForDropDownFields: true,
    });

    this.searchingSpecimenSourceField = new Dropdown({
      id: "specimen",
      key: "specimen",
      label: "Search by Specimen type",
      searchControlType: "concept",
      searchTerm: "SPECIMEN_SOURCE",
      conceptClass: "Specimen",
      shouldHaveLiveSearchForDropDownFields: true,
    });
    // TODO: Consider to put class name for instruments on global property
    this.searchingEquipmentsField = new Dropdown({
      id: "instrument",
      key: "instrument",
      label: "Search by Instrument/Method",
      searchControlType: "concept",
      searchTerm: "LIS_INSTRUMENT",
      conceptClass: "LIS instrument",
      shouldHaveLiveSearchForDropDownFields: true,
    });

    this.currentUser$ = this.store.select(getCurrentUserDetails);
    this.currentUser$.subscribe((user) => {
      this.currentUserUuid = user?.uuid || "";
    });
  }

  canUserAuthorize(sample: any): boolean {
    if (!this.LISConfigurations?.isLIS) return true;
    return !sample?.orders?.some((order: any) =>
      order?.testAllocations?.some((alloc: any) =>
        alloc?.results?.some(
          (r: any) => r?.creator?.uuid === this.currentUserUuid,
        ),
      ),
    );
  }

  toggleCurrentPatientSamples(event: MatCheckboxChange, samples: any[]): void {
    if (event.checked) {
      this.allCurrentPatientSamplesSelected = true;
      this.currentPatientSelectedSamples = keyBy(samples, "uuid");
    } else {
      this.allCurrentPatientSamplesSelected = false;
      this.currentPatientSelectedSamples = {};
    }
    this.currentPatientSelectedSamplesCount = Object.keys(
      this.currentPatientSelectedSamples,
    )?.length;
  }

  toggleCurrentPatientSample(
    event: MatCheckboxChange,
    sample: any,
    allSamples: any[],
  ): void {
    if (event.checked) {
      this.currentPatientSelectedSamples[sample?.uuid] = sample;
      this.allCurrentPatientSamplesSelected =
        allSamples?.length ===
        Object.keys(this.currentPatientSelectedSamples)?.length;
    } else {
      this.currentPatientSelectedSamples = omit(
        this.currentPatientSelectedSamples,
        sample?.id,
      );
      this.allCurrentPatientSamplesSelected = false;
    }
    this.currentPatientSelectedSamplesCount = Object.keys(
      this.currentPatientSelectedSamples,
    )?.length;
  }

  onRejectAllCurrentPatientSamples(event: Event): void {
    event.stopPropagation();
    this.selectedSampleDetails.emit({
      data: Object.keys(this.currentPatientSelectedSamples).map(
        (key) => this.currentPatientSelectedSamples[key],
      ),
      actionType: "reject",
    });
    this.allCurrentPatientSamplesSelected = false;
    this.currentPatientSelectedSamples = {};
    this.currentPatientSelectedSamplesCount = 0;
  }

  onAcceptAllCurrentPatientSamples(event: Event): void {
    event.stopPropagation();

    this.selectedSampleDetails.emit({
      data: Object.keys(this.currentPatientSelectedSamples).map(
        (key) => this.currentPatientSelectedSamples[key],
      ),
      actionType: "accept",
    });
    this.allCurrentPatientSamplesSelected = false;
    this.currentPatientSelectedSamples = {};
    this.currentPatientSelectedSamplesCount = 0;
  }

  toggleListType(event: MatRadioChange): void {
    this.listType = event.value;
    if (this.listType === "samples") {
      this.getSamples({
        pageSize: this.pageSize,
        page: this.page,
        category:
          this.category === "COLLECTED" && this.tabType !== "sample-tracking"
            ? "NOT ACCEPTED"
            : this.category,
        hasStatus: this.hasStatus,
      });
    } else {
      this.getPatients();
    }
  }

  toggleItemToShow(event: MatCheckboxChange, item: string): void {
    if (event?.checked) {
      this.itemsToShow[item] = true;
    } else {
      this.itemsToShow[item] = false;
    }
  }

  getPatients(): void {
    this.samples$ = this.visitsService
      .getAllVisits(
        null,
        false,
        false,
        null,
        0,
        this.pageSize,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        this.category,
        this.excludedSampleCategories,
      )
      .pipe(
        map((response) => {
          return {
            pager: null,
            results: response?.map((visitData) => visitData?.visit),
          };
        }),
      );
  }

  getSamplesListByVisit(event: Event, visit: any, parameters: any): void {
    event.stopPropagation();
    this.currentVisit = visit;
    this.showModal = true;
    this.currentSamplesByVisits$ = this.visitsService.getSamplesByVisitUuid(
      visit?.uuid,
      parameters,
    );
  }

  getSamples(params?: any): void {
    const category =
      params.category === "COLLECTED" && this.tabType !== "sample-tracking"
        ? "NOT ACCEPTED"
        : params.category;
    this.samples$ = this.sampleService.getLabSamplesByCollectionDates(
      this.datesParameters,
      category,
      params?.hasStatus,
      this.excludeAllocations,
      this.tabType ? this.tabType : null,
      this.excludedSampleCategories ? this.excludedSampleCategories : null,
      {
        pageSize: params?.pageSize,
        page: params?.page,
      },
      {
        departments: this.labSamplesDepartments,
        specimenSources: this.sampleTypes,
        codedRejectionReasons: this.codedSampleRejectionReasons,
      },
      this.acceptedBy,
      params?.q,
      params?.dapartment,
      params?.testUuid,
      params?.instrument,
      params?.specimenUuid,
      this.LISConfigurations?.isLIS
        ? localStorage?.getItem("currentLocation").indexOf("{") > -1
          ? JSON.parse(localStorage?.getItem("currentLocation"))?.uuid
          : null
        : null,
    ).pipe(
      map((response: any) => {
        const referralOrderConcept = this.sampleReferralService.referralSettings()?.referralOrderConcept;

        return {
          ...response,
          results: response?.results?.map((sample: any) => {
            return {
              ...sample,
              orders: sample?.orders?.filter((order: any) => order?.order?.concept?.uuid !== referralOrderConcept)
            }
          })
        }
      })
    );
  }

  onPageChange(event: any): void {
    this.page = this.page + (event?.pageIndex - event?.previousPageIndex);
    this.pageSize = event?.pageSize;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: this.page,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      instrument: this.instrumentUuid,
      dapartment: this.dapartment,
    });
  }

  onToggleViewSampleDetails(event: Event, sample: any): void {
    event.stopPropagation();
    if (!this.samplesToViewMoreDetails[sample?.uuid]) {
      this.samplesToViewMoreDetails[sample?.uuid] = sample;
    } else {
      this.samplesToViewMoreDetails = omit(
        this.samplesToViewMoreDetails,
        sample?.uuid,
      );
    }
  }

  isSampleStored(sample: any): boolean {
    if (!sample) {
      return false;
    }

    return (
      this.hasLifecycleCategoryStatus(sample, "STORAGE", "STORED") ||
      this.hasAffirmativeLifecycleStatus(sample?.storedStatus, "stored") ||
      this.hasAffirmativeLifecycleStatus(sample?.storageStatus, "stored") ||
      this.hasAffirmativeLifecycleStatus(sample?.sampleStorageStatus, "stored") ||
      this.hasAffirmativeLifecycleStatus(sample?.storageAllocationStatus, "stored") ||
      this.hasMeaningfulLifecycleValue(sample?.storageAllocation) ||
      this.hasMeaningfulLifecycleValue(sample?.currentStorageAllocation) ||
      this.hasMeaningfulLifecycleValue(sample?.activeStorageAllocation) ||
      this.hasMeaningfulLifecycleValue(sample?.latestStorageAllocation) ||
      this.hasMeaningfulLifecycleValue(sample?.storageAllocations) ||
      this.hasMeaningfulLifecycleValue(sample?.sampleStorageAllocations) ||
      this.hasMeaningfulLifecycleValue(sample?.storageLocation) ||
      this.hasMeaningfulLifecycleValue(sample?.currentStorage) ||
      this.hasMeaningfulLifecycleValue(sample?.storageDetails)
    );
  }

  isSampleDisposed(sample: any): boolean {
    if (!sample) {
      return false;
    }

    return (
      this.hasLifecycleCategoryStatus(sample, "DISPOSAL", "DISPOSED") ||
      this.hasLifecycleCategoryStatus(sample, "DISPOSE", "DISPOSED") ||
      this.hasAffirmativeLifecycleStatus(sample?.disposedStatus, "disposed") ||
      this.hasAffirmativeLifecycleStatus(sample?.disposalStatus, "disposed") ||
      this.hasAffirmativeLifecycleStatus(sample?.sampleDisposalStatus, "disposed") ||
      this.hasMeaningfulLifecycleValue(sample?.disposedOnStatus) ||
      this.hasMeaningfulLifecycleValue(sample?.disposedByStatus) ||
      this.hasMeaningfulLifecycleValue(sample?.disposal) ||
      this.hasMeaningfulLifecycleValue(sample?.disposalDetails) ||
      this.hasMeaningfulLifecycleValue(sample?.disposalRecord)
    );
  }

  getSampleLifecycleBorderClasses(sample: any): any {
    const isDisposed = this.isSampleDisposed(sample);
    const isStored = this.isSampleStored(sample);

    return {
      "sample-row-status-cell--stored-and-disposed": isStored && isDisposed,
      "sample-row-status-cell--disposed": isDisposed && !isStored,
      "sample-row-status-cell--stored": isStored && !isDisposed,
    };
  }

  getSampleLifecycleTitle(sample: any): string {
    const isDisposed = this.isSampleDisposed(sample);
    const isStored = this.isSampleStored(sample);

    if (isStored && isDisposed) {
      return "Stored and disposed";
    }

    if (isDisposed) {
      return "Disposed";
    }

    if (isStored) {
      return "Stored";
    }

    return "No storage/disposal status";
  }

  getSampleDetailsPanelClasses(sample: any): any {
    const isDisposed = this.isSampleDisposed(sample);
    const isStored = this.isSampleStored(sample);

    return {
      "sample-details-panel--stored-and-disposed": isStored && isDisposed,
      "sample-details-panel--disposed": isDisposed && !isStored,
      "sample-details-panel--stored": isStored && !isDisposed,
    };
  }

  getSampleLifecyclePillClass(sample: any): any {
    const isDisposed = this.isSampleDisposed(sample);
    const isStored = this.isSampleStored(sample);

    return {
      "sample-details-status-pill--stored-and-disposed": isStored && isDisposed,
      "sample-details-status-pill--disposed": isDisposed && !isStored,
      "sample-details-status-pill--stored": isStored && !isDisposed,
      "sample-details-status-pill--neutral": !isStored && !isDisposed,
    };
  }

  getSampleLifecycleIcon(sample: any): string {
    const isDisposed = this.isSampleDisposed(sample);
    const isStored = this.isSampleStored(sample);

    if (isStored && isDisposed) {
      return "rule";
    }

    if (isDisposed) {
      return "delete_outline";
    }

    if (isStored) {
      return "inventory_2";
    }

    return "info";
  }

  getSampleResultStatusLabel(sample: any): string {
    if (sample?.authorized) {
      return "Authorized";
    }

    if (sample?.atLestOneOrderWithRejectedResults) {
      return "Rejected results";
    }

    if (sample?.approved) {
      return this.LISConfigurations?.isLIS ? "Authorized" : "Waiting second approval";
    }

    if (sample?.hasResults) {
      return "Has results";
    }

    return "No results";
  }

  getSampleResultStatusPillClass(sample: any): any {
    return {
      "sample-details-status-pill--authorized": sample?.authorized || (sample?.approved && this.LISConfigurations?.isLIS),
      "sample-details-status-pill--approved": sample?.approved && !this.LISConfigurations?.isLIS,
      "sample-details-status-pill--rejected": sample?.atLestOneOrderWithRejectedResults,
      "sample-details-status-pill--has-results": sample?.hasResults && !sample?.authorized && !sample?.approved,
      "sample-details-status-pill--neutral": !sample?.hasResults && !sample?.authorized && !sample?.approved && !sample?.atLestOneOrderWithRejectedResults,
    };
  }

  getPatientFullName(sample: any): string {
    const patient = sample?.patient || {};
    const names = [patient?.givenName, patient?.middleName, patient?.familyName]
      .filter((name) => this.hasMeaningfulLifecycleValue(name))
      .join(" ");

    return this.getSampleDisplayValue(
      names || patient?.person?.display || patient?.display || patient?.name,
      "Not set"
    );
  }

  getPatientIdentifier(sample: any): string {
    return this.getSampleDisplayValue(
      sample?.mrn ||
        sample?.patient?.mrn ||
        sample?.patient?.identifier ||
        sample?.patient?.identifiers?.[0]?.identifier,
      "Not set"
    );
  }

  getPatientGender(sample: any): string {
    return this.getSampleDisplayValue(
      sample?.patient?.gender || sample?.patient?.person?.gender,
      "Not set"
    );
  }

  getSampleDepartmentDisplay(sample: any): string {
    return this.getSampleDisplayValue(
      sample?.department?.display || sample?.department?.name || sample?.department,
      "Not set"
    );
  }

  getSampleSpecimenDisplay(sample: any): string {
    return this.getSampleDisplayValue(
      sample?.specimenSource?.display || sample?.specimenSource?.name || sample?.specimenSource,
      "Not set"
    );
  }

  getSampleRegisteredBy(sample: any): string {
    return this.getSampleDisplayValue(
      sample?.collectedBy?.display ||
        sample?.collectedBy?.name ||
        sample?.creator?.display ||
        sample?.creator?.name ||
        sample?.receivedByStatus?.user?.name,
      "Not set"
    );
  }

  getSampleRegisteredOn(sample: any): any {
    return sample?.dateCreated || sample?.created || sample?.createdAt || sample?.collectedOn;
  }

  getSamplePriority(sample: any): string {
    if (!this.LISConfigurations?.isLIS) {
      return sample?.priorityHigh ? "Urgent" : "Routine";
    }

    return this.getSampleDisplayValue(sample?.priorityStatus?.status, "Routine");
  }

  getSampleOrders(sample: any): any[] {
    return Array.isArray(sample?.orders) ? sample?.orders : [];
  }

  getSampleOrdersCount(sample: any): number {
    return this.getSampleOrders(sample)?.length || 0;
  }

  getOrderTestName(order: any): string {
    return this.getSampleDisplayValue(
      order?.order?.concept?.display ||
        order?.concept?.display ||
        order?.order?.display ||
        order?.display,
      "Test not set"
    );
  }

  getOrderReference(order: any): string {
    return this.getSampleDisplayValue(
      order?.order?.orderNumber || order?.orderNumber || order?.order?.uuid || order?.uuid,
      "No order reference"
    );
  }

  getOrderRequestedBy(order: any): string {
    return this.getSampleDisplayValue(
      order?.order?.orderer?.name || order?.orderer?.name || order?.order?.provider?.display,
      "Requester not set"
    );
  }

  getSampleIdentitySummaryFields(sample: any): any[] {
    return [
      { label: "Patient name", value: this.getPatientFullName(sample) },
      { label: "Patient ID / MRN", value: this.getPatientIdentifier(sample) },
      { label: "Gender", value: this.getPatientGender(sample) },
      { label: "Department / Section", value: this.getSampleDepartmentDisplay(sample) },
      { label: "Sample / Specimen", value: this.getSampleSpecimenDisplay(sample) },
      { label: "Priority", value: this.getSamplePriority(sample) },
      { label: this.LISConfigurations?.isLIS ? "Registered by" : "Collected by", value: this.getSampleRegisteredBy(sample) },
      { label: this.LISConfigurations?.isLIS ? "Registered on" : "Collected on", value: this.getSampleRegisteredOn(sample), isDate: true },
    ];
  }

  getSampleStorageSummaryFields(sample: any): any[] {
    const sources = this.getLifecycleSourceCandidates(sample, "storage");

    return [
      {
        label: "Storage status",
        value: this.isSampleStored(sample) ? "Stored" : "Not stored",
        valueClass: this.isSampleStored(sample) ? "sample-detail-value--stored" : "sample-detail-value--muted",
      },
      {
        label: "Storage location",
        value: this.getFirstValueFromSources(sources, [
          "storageLocation.display",
          "storageLocation.name",
          "currentStorage.display",
          "currentStorage.name",
          "location.display",
          "location.name",
          "storage.display",
          "storage.name",
        ]),
      },
      {
        label: "Device / Unit",
        value: this.getFirstValueFromSources(sources, [
          "storageDevice.display",
          "storageDevice.name",
          "storageUnit.display",
          "storageUnit.name",
          "device.display",
          "device.name",
          "unit.display",
          "unit.name",
          "container.display",
          "container.name",
        ]),
      },
      {
        label: "Rack / Shelf",
        value: this.combineLifecycleValues(
          this.getFirstValueFromSources(sources, ["rack.display", "rack.name", "rackLabel", "rack"]),
          this.getFirstValueFromSources(sources, ["shelf.display", "shelf.name", "shelfLabel", "shelf"])
        ),
      },
      {
        label: "Box / Slot",
        value: this.combineLifecycleValues(
          this.getFirstValueFromSources(sources, ["box.display", "box.name", "boxLabel", "box"]),
          this.getFirstValueFromSources(sources, ["slot.display", "slot.name", "slotLabel", "position", "positionLabel", "slot"])
        ),
      },
      {
        label: "Stored by",
        value: this.getFirstValueFromSources(sources, [
          "storedBy.display",
          "storedBy.name",
          "storedByStatus.user.name",
          "user.display",
          "user.name",
          "creator.display",
          "creator.name",
        ]),
      },
      {
        label: "Stored on",
        value: this.getFirstValueFromSources(sources, [
          "storedOn",
          "storedAt",
          "dateStored",
          "storedDate",
          "storedOnStatus.timestamp",
          "timestamp",
        ]),
        isDate: true,
      },
      {
        label: "Storage remarks",
        value: this.getFirstValueFromSources(sources, ["remarks", "comment", "comments", "note", "notes"]),
      },
    ];
  }

  getSampleDisposalSummaryFields(sample: any): any[] {
    const sources = this.getLifecycleSourceCandidates(sample, "disposal");

    return [
      {
        label: "Disposal status",
        value: this.isSampleDisposed(sample) ? "Disposed" : "Not disposed",
        valueClass: this.isSampleDisposed(sample) ? "sample-detail-value--disposed" : "sample-detail-value--muted",
      },
      {
        label: "Disposal method",
        value: this.getFirstValueFromSources(sources, [
          "method.display",
          "method.name",
          "disposalMethod.display",
          "disposalMethod.name",
          "method",
          "disposalMethod",
        ]),
      },
      {
        label: "Disposed by",
        value: this.getFirstValueFromSources(sources, [
          "disposedBy.display",
          "disposedBy.name",
          "disposedByStatus.user.name",
          "user.display",
          "user.name",
          "creator.display",
          "creator.name",
        ]),
      },
      {
        label: "Disposed on",
        value: this.getFirstValueFromSources(sources, [
          "disposedOn",
          "disposedAt",
          "dateDisposed",
          "disposedDate",
          "disposedOnStatus.timestamp",
          "timestamp",
        ]),
        isDate: true,
      },
      {
        label: "Disposal reason",
        value: this.getFirstValueFromSources(sources, [
          "reason.display",
          "reason.name",
          "disposalReason.display",
          "disposalReason.name",
          "reason",
          "disposalReason",
        ]),
      },
      {
        label: "Disposal remarks",
        value: this.getFirstValueFromSources(sources, ["remarks", "comment", "comments", "note", "notes"]),
      },
    ];
  }

  getSampleDisplayValue(value: any, fallback: string = "Not set"): string {
    if (value === true) {
      return "Yes";
    }

    if (value === false) {
      return "No";
    }

    if (value === null || value === undefined) {
      return fallback;
    }

    if (Array.isArray(value)) {
      const values = value
        .map((item) => this.getSampleDisplayValue(item, ""))
        .filter((item) => !!item);
      return values?.length ? values.join(", ") : fallback;
    }

    if (typeof value === "object") {
      return this.getSampleDisplayValue(
        value?.display ||
          value?.name ||
          value?.label ||
          value?.identifier ||
          value?.code ||
          value?.status ||
          value?.value ||
          value?.uuid ||
          value?.id,
        fallback
      );
    }

    const displayValue = String(value).trim();
    return displayValue ? displayValue : fallback;
  }

  trackBySummaryField(index: number, item: any): string {
    return item?.label || `${index}`;
  }

  trackByOrder(index: number, order: any): string {
    return order?.order?.uuid || order?.uuid || order?.order?.orderNumber || `${index}`;
  }

  private getLifecycleSourceCandidates(sample: any, type: "storage" | "disposal"): any[] {
    const sources =
      type === "storage"
        ? [
            sample?.currentStorageAllocation,
            sample?.activeStorageAllocation,
            sample?.latestStorageAllocation,
            this.getLatestLifecycleItem(sample?.storageAllocations),
            this.getLatestLifecycleItem(sample?.sampleStorageAllocations),
            sample?.storageAllocation,
            sample?.storageDetails,
            sample?.currentStorage,
            sample?.storageLocation,
            sample,
          ]
        : [
            sample?.disposalRecord,
            sample?.disposalDetails,
            sample?.disposal,
            sample?.sampleDisposalStatus,
            sample?.disposalStatus,
            sample?.disposedStatus,
            sample,
          ];

    return sources.filter((source) => this.hasMeaningfulLifecycleValue(source));
  }

  private getLatestLifecycleItem(value: any): any {
    if (!Array.isArray(value)) {
      return value;
    }

    const meaningfulItems = value.filter((item) => this.hasMeaningfulLifecycleValue(item));
    return meaningfulItems?.length ? meaningfulItems[meaningfulItems.length - 1] : null;
  }

  private getFirstValueFromSources(sources: any[], paths: string[]): any {
    for (const source of sources || []) {
      for (const path of paths || []) {
        const value = this.getValueByPath(source, path);
        if (this.hasMeaningfulLifecycleValue(value)) {
          return value;
        }
      }
    }

    return null;
  }

  private getValueByPath(source: any, path: string): any {
    if (!source || !path) {
      return null;
    }

    return path.split(".").reduce((currentValue, key) => {
      if (currentValue === null || currentValue === undefined) {
        return null;
      }

      return currentValue[key];
    }, source);
  }

  private combineLifecycleValues(firstValue: any, secondValue: any): string {
    const firstDisplayValue = this.getSampleDisplayValue(firstValue, "");
    const secondDisplayValue = this.getSampleDisplayValue(secondValue, "");
    const values = [firstDisplayValue, secondDisplayValue].filter((value) => !!value);

    return values?.length ? values.join(" / ") : "Not set";
  }

  private hasLifecycleCategoryStatus(
    value: any,
    expectedCategory: string,
    expectedStatus: string,
    depth: number = 0
  ): boolean {
    if (value === false || value === null || value === undefined || depth > 6) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((item) =>
        this.hasLifecycleCategoryStatus(item, expectedCategory, expectedStatus, depth + 1)
      );
    }

    if (typeof value !== "object") {
      return false;
    }

    if (value?.voided || value?.retired || value?.deleted || value?.inactive) {
      return false;
    }

    const normalizedCategory = this.normalizeLifecycleText(value?.category);
    const normalizedStatus = this.normalizeLifecycleText(value?.status);
    const normalizedExpectedCategory = this.normalizeLifecycleText(expectedCategory);
    const normalizedExpectedStatus = this.normalizeLifecycleText(expectedStatus);

    if (
      normalizedCategory === normalizedExpectedCategory &&
      normalizedStatus === normalizedExpectedStatus
    ) {
      return true;
    }

    const likelyStatusContainers = [
      value?.status,
      value?.statuses,
      value?.sampleStatus,
      value?.sampleStatuses,
      value?.statusDetails,
      value?.sampleStatusDetails,
      value?.latestStatus,
      value?.latestStatuses,
      value?.currentStatus,
      value?.currentStatuses,
      value?.statusHistory,
      value?.statusHistories,
      value?.storageStatus,
      value?.storedStatus,
      value?.disposalStatus,
      value?.disposedStatus,
    ];

    return likelyStatusContainers.some((candidate) =>
      this.hasLifecycleCategoryStatus(
        candidate,
        expectedCategory,
        expectedStatus,
        depth + 1
      )
    );
  }

  private normalizeLifecycleText(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "object") {
      return this.normalizeLifecycleText(
        value?.uuid || value?.id || value?.code || value?.name || value?.display || value?.value
      );
    }

    return String(value).toLowerCase().replace(/[_-]+/g, " ").trim();
  }

  private hasAffirmativeLifecycleStatus(value: any, expectedStatus?: string): boolean {
    if (value === true) {
      return true;
    }

    if (value === false || value === null || value === undefined) {
      return false;
    }

    if (typeof value === "number") {
      return value > 0;
    }

    if (typeof value === "string") {
      const normalizedValue = this.normalizeLifecycleText(value);

      if (!normalizedValue || this.isNegativeLifecycleStatus(normalizedValue)) {
        return false;
      }

      if (expectedStatus) {
        return normalizedValue.indexOf(this.normalizeLifecycleText(expectedStatus)) > -1;
      }

      return [
        "true",
        "yes",
        "stored",
        "disposed",
        "active",
        "allocated",
        "completed",
        "done",
      ].some((status) => normalizedValue.indexOf(status) > -1);
    }

    if (Array.isArray(value)) {
      return value.some((item) =>
        this.hasAffirmativeLifecycleStatus(item, expectedStatus)
      );
    }

    if (typeof value === "object") {
      if (value?.voided || value?.retired || value?.deleted || value?.inactive) {
        return false;
      }

      const statusCandidate =
        value?.status || value?.value || value?.name || value?.display || value?.state;

      if (statusCandidate !== undefined && statusCandidate !== null) {
        return this.hasAffirmativeLifecycleStatus(statusCandidate, expectedStatus);
      }

      return this.hasMeaningfulLifecycleValue(value);
    }

    return false;
  }

  private hasMeaningfulLifecycleValue(value: any): boolean {
    if (value === true) {
      return true;
    }

    if (value === false || value === null || value === undefined) {
      return false;
    }

    if (typeof value === "number") {
      return value > 0;
    }

    if (typeof value === "string") {
      const normalizedValue = this.normalizeLifecycleText(value);
      return !!normalizedValue && !this.isNegativeLifecycleStatus(normalizedValue);
    }

    if (Array.isArray(value)) {
      return value.some((item) => this.hasMeaningfulLifecycleValue(item));
    }

    if (typeof value === "object") {
      if (value?.voided || value?.retired || value?.deleted || value?.inactive) {
        return false;
      }

      const statusCandidate =
        value?.status || value?.value || value?.name || value?.display || value?.state;

      if (
        typeof statusCandidate === "string" &&
        this.isNegativeLifecycleStatus(this.normalizeLifecycleText(statusCandidate))
      ) {
        return false;
      }

      return Object.keys(value)?.length > 0;
    }

    return false;
  }

  private isNegativeLifecycleStatus(value: string): boolean {
    return [
      "false",
      "no",
      "none",
      "not set",
      "not available",
      "n/a",
      "na",
      "not stored",
      "not disposed",
      "not allocated",
      "unallocated",
      "inactive",
      "voided",
      "retired",
      "deleted",
      "cancelled",
      "canceled",
    ].some((status) => value.indexOf(status) > -1);
  }

  private markSampleAsStored(sample: any, result?: any): void {
    if (!sample) {
      return;
    }

    sample.storedStatus =
      result?.storedStatus ||
      result?.status ||
      result?.data?.status ||
      result?.response?.status ||
      {
        category: "STORAGE",
        status: "STORED",
      };
  }

  private markSampleAsDisposed(sample: any, result?: any): void {
    if (!sample) {
      return;
    }

    sample.disposedStatus =
      result?.disposedStatus ||
      result?.status ||
      result?.data?.status ||
      result?.response?.status ||
      {
        category: "DISPOSAL",
        status: "DISPOSED",
      };
  }

  onStore(event: Event, sample: any): void {
    event.stopPropagation();
    this.dialog
      .open(SampleStoreDialogComponent, {
        width: "auto",
        minWidth: "1120px",
        maxWidth: "80vw",
        maxHeight: "90vh",
        disableClose: true,
        panelClass: "custom-dialog-container",
        data: {
          sample,
          LISConfigurations: this.LISConfigurations,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.saved) {
          this.markSampleAsStored(sample, result);
          this.refreshVisibleSamples();
        }
      });
  }

  onOpenDisposeDialog(event: Event, sample: any): void {
    event.stopPropagation();
    if (this.isSampleDisposed(sample)) {
      return;
    }

    this.dialog
      .open(SampleDisposeDialogComponent, {
        width: "auto",
        minWidth: "1120px",
        maxWidth: "80vw",
        maxHeight: "90vh",
        disableClose: true,
        panelClass: "custom-dialog-container",
        data: {
          sample,
          LISConfigurations: this.LISConfigurations,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.saved) {
          this.markSampleAsDisposed(sample, result);
          this.refreshVisibleSamples();
        }
      });
  }

  private refreshVisibleSamples(): void {
    if (this.listType === "samples") {
      this.getSamples({
        category: this.category,
        hasStatus: this.hasStatus,
        pageSize: this.pageSize,
        page: this.page,
        q: this.searchingText,
        testUuid: this.testUuid,
        specimenUuid: this.specimenUuid,
        instrument: this.instrumentUuid,
        dapartment: this.dapartment,
      });
    } else if (this.currentVisit?.uuid) {
      this.currentSamplesByVisits$ = this.visitsService.getSamplesByVisitUuid(
        this.currentVisit?.uuid,
        this.sampleVisitParameters
      );
    }
  }

  onSelectDepartment(event: MatSelectChange): void {
    this.dapartment = event?.value?.uuid;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      instrument: this.instrumentUuid,
      dapartment: this.dapartment,
    });
  }

  onResultsEntryAndReview(e: Event, sample: any): void {
    e.stopPropagation();
    this.resultEntrySample.emit(sample);
  }

  onPrint(event: Event, sample: any): void {
    event.stopPropagation();
    this.selectedSampleDetails.emit(sample);
  }

  onAccept(event: Event, samples: any[], actionType?: string): void {
    event.stopPropagation();
    this.selectedSampleDetails.emit({ data: samples, actionType });
  }
  onReject(event: Event, samples: any[], actionType?: string): void {
    event.stopPropagation();
    this.selectedSampleDetails.emit({ data: samples, actionType });
  }

  onGetSelectedSampleDetails(event: Event, sample: any, action: string): void {
    event.stopPropagation();
    this.selectedSampleDetails.emit({ data: sample, action: action });
  }

  onSelectItem(event: MatCheckboxChange, sample: any): void {
    this.selectedSamples = event?.checked
      ? [...this.selectedSamples, sample]
      : this.selectedSamples?.filter(
          (selectedSample) => selectedSample?.label !== sample?.label,
        ) || [];
    this.keyedSelectedSamples[sample?.id] = sample;
    this.samplesForAction.emit(this.selectedSamples);
  }

  onSelectAll(event: MatCheckboxChange, samples: any[]): void {
    this.selectedSamples = [];
    if (event?.checked) {
      const eligible =
        this.tabType === "authorization"
          ? (samples || []).filter((s) => this.canUserAuthorize(s))
          : samples || [];
      this.selectedSamples = [...eligible];

      if (this.tabType === "authorization" && eligible.length < (samples || []).length) {
        const skipped = (samples || []).length - eligible.length;
        this.snackBar.open(
          `${skipped} sample(s) skipped — you cannot authorise results processed by you`,
          "OK",
          {
            horizontalPosition: "center",
            verticalPosition: "bottom",
            duration: 4000,
            panelClass: ["snack-color"],
          },
        );
      }
    }
    this.keyedSelectedSamples =
      this.selectedSamples?.length > 0 ? keyBy(this.selectedSamples, "id") : {};
    this.samplesForAction.emit(this.selectedSamples);
  }

  onSearchSamples(event): void {
    this.searchingText = (event.target as HTMLInputElement)?.value;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
    });
  }

  onSearchByTest(formValue: FormValue): void {
    this.testUuid = formValue.getValues()?.test?.value;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      instrument: this.instrumentUuid,
      dapartment: this.dapartment,
    });
  }

  onSearchBySpecimen(formValue: FormValue): void {
    this.specimenUuid = formValue.getValues()?.specimen?.value;
    this.getSamples({
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      instrument: this.instrumentUuid,
      dapartment: this.dapartment,
    });
  }

  onSearchByEquipment(formValue: FormValue): void {
    this.instrumentUuid = formValue.getValues()?.instrument?.value;
    this.getSamples({
      instrument: this.instrumentUuid,
      category: this.category,
      hasStatus: this.hasStatus,
      pageSize: this.pageSize,
      page: 1,
      q: this.searchingText,
      testUuid: this.testUuid,
      specimenUuid: this.specimenUuid,
      dapartment: this.dapartment,
    });
  }

  onDispose(event: Event, sample: any): void {
    this.onOpenDisposeDialog(event, sample);
  }

  onPrintBarcode(event: Event, sample: any): void {
    const data = {
      identifier: sample?.label,
      sample: sample,
      sampleLabelsUsedDetails: [sample],
      isLis: this.LISConfigurations?.isLIS,
    };

    this.dialog
      .open(BarCodeModalComponent, {
        height: "200px",
        width: "20%",
        data,
        disableClose: false,
        panelClass: "custom-dialog-container",
      })
      .afterClosed()
      .subscribe((results) => {
        if (results) {
          let tests = [];
          results?.sampleData?.orders?.forEach((order) => {
            tests = [
              ...tests,
              order?.order?.shortName?.split("TEST_ORDERS:")?.join(""),
            ];
          });

          const message = {
            SampleID: results?.sampleData?.label,
            Tests: tests?.join(","),
            PatientNames: `${results?.sampleData?.patient?.givenName} ${
              results?.sampleData?.patient?.middleName?.length
                ? results?.sampleData?.patient?.middleName
                : ""
            } ${results?.sampleData?.patient?.familyName}`,
            Date: formatDateToYYMMDD(
              new Date(results?.sampleData?.created),
              true,
            ),
            Storage: "",
            Department:
              results?.sampleData?.department?.shortName
                ?.split("LAB_DEPARTMENT:")
                .join("") || "",
            BarcodeData: results?.sampleData?.label
              ?.split(this.barcodeSettings?.textToIgnore)
              .join(""),
          };

          this.connection.next({
            Message: message,
            Description: "Message of data to be printed",
            Type: "print",
          });
        }
      });
  }

  closeModal() {
    this.showModal = false;
  }
}
