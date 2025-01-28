import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { select, Store } from "@ngrx/store";
import { AppState } from "src/app/store/reducers";
import { loadSamplesByVisit } from "../../store/actions";
import { Observable, of } from "rxjs";
import {
  getLabSamplesLoadingState,
  getSamplesToCollect,
} from "../../store/selectors/samples.selectors";

import * as _ from "lodash";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { VisitObject } from "src/app/shared/resources/visits/models/visit-object.model";
import { ConceptCreateFull } from "src/app/shared/resources/openmrs";
import { SampleObject } from "../../resources/models";
import { getActiveVisitPendingVisitServiceBillStatus, getPatientPendingBillStatus } from "src/app/store/selectors/bill.selectors";
import { collectSample } from "src/app/store/actions";
import { SamplesService } from "src/app/shared/services/samples.service";
import { BarCodeModalComponent } from "../../../../shared/dialogs/bar-code-modal/bar-code-modal.component";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";
import { MatDialog } from "@angular/material/dialog";
import { LabOrdersService } from "../../resources/services/lab-orders.service";
import { OrdersService } from "src/app/shared/resources/order/services/orders.service";
import { getPatientsSamplesToCollect } from "src/app/store/selectors/new-lab-samples.selectors";
import { BillingService } from "src/app/modules/billing/services/billing.service";
import { map, tap } from "rxjs/operators";
import { Bill } from "src/app/modules/billing/models/bill.model";

@Component({
  selector: "app-samples-to-collect",
  templateUrl: "./samples-to-collect.component.html",
  styleUrls: ["./samples-to-collect.component.scss"],
})
export class SamplesToCollectComponent implements OnInit, OnChanges {
  @Input() specimenSources: ConceptCreateFull;
  @Input() labDepartments: any;
  @Input() labOrders: any[];
  @Input() patient: Patient;
  @Input() visit: VisitObject;
  @Input() payments: any[];
  @Input() labConfigs: any;
  @Input() containers: [];
  @Input() patients: any[];
  @Input() datesParameters: any;
  groupedTestOrders: any[];
  sampleIdentifiers$: Observable<any>;
  currentSamplesToCollect = {};
  samplesPriorityDetails = {};
  collectionStatus = {};
  bills$:Observable<any>;
  samplesToCollect$: Observable<SampleObject[]>;
  labSamplesLoadingState$: Observable<boolean>;
  samplePriority: any = {};
  isdiscounted:boolean = false;
  patientHasPendingBills$: Observable<boolean>;
  paidItems = {};
  thereIsUnSavedSample: boolean = false;
  @Output() isSaveCollectedSample: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() samplesToCollect: EventEmitter<number> = new EventEmitter<number>();
  updateLabOrderResponse$: Observable<any>;
  constructor(
    private store: Store<AppState>,
    private sampleService: SamplesService,
    private dialog: MatDialog,
    private billingService: BillingService,
    private labOrdersService: LabOrdersService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.samplesToCollect$.subscribe((sample)=>{
      console.log("samplesToCollect.........................",sample);
    })
  }

  ngOnChanges() {
    this.patientHasPendingBills$ = this.store.pipe(
      select(getPatientPendingBillStatus)
    );

    console.log("payments response ......",this.payments);
    _.each(this.payments, (payment) => {
      _.each(payment?.items, (item) => {
        this.paidItems[item?.name] = item;
        this.paidItems[item?.paymentItem?.order?.uuid] = item;
      });
    });
    this.store.dispatch(
      loadSamplesByVisit({
        visitUuid: this.visit?.uuid,
        orderedLabOrders: this.labOrders,
        specimenSources: this.specimenSources?.setMembers,
        containers: this.containers,
        labDepartments: this.labDepartments?.setMembers,
        patient: this.patient,
        paidItems: this.paidItems,
        isAdmitted: this.visit?.isAdmitted,
        visit: this.visit,
      })
    );

    this.samplesToCollect$ = this.store.select(getSamplesToCollect);
    console.log("patient uuid......",this.patient.personUuid)
    console.log("patient visit ...",this.visit)
    // this.samplesToCollect$ = this.store.select(getPatientsSamplesToCollect, {
    //   patient_uuid: this.patient.personUuid,
    // });

    this.samplesToCollect$.subscribe((data) => {
      if (data) {
        console.log("sample collected -----",data);
        this.samplesToCollect.emit(data?.length);
        console.log(data)
      }
    });
    this.labSamplesLoadingState$ = this.store.select(getLabSamplesLoadingState);

    console.log("this.patient.personUuid ....",this.patient.personUuid);
    // this.bills$ = this.billingService.getAllPatientInvoices(this.patient.personUuid,false);
   
    this.billingService.getAllPatientInvoices(this.patient.personUuid, false).subscribe((bills: Bill[]) => {
      
      if (bills.length > 0) {
        const lastBill = bills[bills.length - 1];
        if (lastBill && lastBill.discounted) {
          this.isdiscounted = true;
        }
        if (lastBill.discounted) {
          this.isdiscounted = true;
          console.log("Last bill is discounted:", lastBill.discounted);
        }
      }
      this.bills$ = of(bills);
    });
  }

  saveAsSample(
    specimenType: any,
    count: any,
    patient: any,
    department?: any
  ): void {
    const identifierElement: any = document.getElementById(
      specimenType.specimenSourceUuid + count
    );
    const sampleIdentifier = identifierElement.value;
    this.currentSamplesToCollect = {
      id: sampleIdentifier,
      ...specimenType,
      visit: this.visit,
      user: null,
      comments: null,
      sampleIdentifier: sampleIdentifier,
      priority: this.samplesPriorityDetails[specimenType.specimenSourceUuid],
    };
    this.collectionStatus[specimenType.specimenSourceUuid] = true;
    // this.store.dispatch(createSample({ sample: this.currentSamplesToCollect }));

    // JESSE TODO get uiser uid and sample uid
    const sample = {
      visit: {
        uuid: this.visit?.uuid,
      },
      label: sampleIdentifier,
      concept: {
        uuid: specimenType?.departmentUuid,
      },
      specimenSource: {
        uuid: specimenType?.specimenSourceUuid,
      },
      orders: this.getOrders(specimenType?.orders),
    };

    const priorityData =
      this.samplePriority["sampleuid"] &&
      this.samplePriority["sampleuid"] == "HIGH"
        ? {
            sample: {
              uuid: null,
            },
            user: {
              uuid: "userUuid",
            },
            remarks: "high priority",
            status: "HIGH",
            category: "PRIORITY",
          }
        : null;

    const details = {
      ...specimenType,
      collected: true,
      sampleCollectionDate: new Date().getTime(),
      searchingText: `${sampleIdentifier}-${specimenType?.patient?.person?.display}`,
    };
    const orders = details.orders.map((order) => {
      return {
        uuid: order?.uuid,
        accessionNumber: order?.orderNumber,
        fulfillerStatus: "RECEIVED",
        encounter: order?.encounterUuid,
      };
    });
    
    this.updateLabOrderResponse$ =
      this.labOrdersService.updateLabOrders(orders);

    this.store.dispatch(
      collectSample({
        sampleData: sample,
        details: details,
        priorityDetails: priorityData,
      })
    );

    this.isSaveCollectedSample.emit();
  }

  getOrders(orders) {
    return _.map(orders, (order) => {
      return {
        uuid: order?.uuid,
      };
    });
  }

  setPriority(sample, e) {
    this.samplesPriorityDetails[sample.specimenSourceUuid] = e.checked;

    //JESSE TODO set priority
    if (e.checked) {
      this.samplePriority["id"] = "HIGH";
    } else {
      this.samplePriority["id"] = "";
    }
  }

  generateSampleId(e, sample, count, patient) {
    e.stopPropagation();
    //52a447d3-a64a-11e3-9aeb-50e549534c5e Laboratory Order Type Uuid
    const orders = sample?.orders?.map((order) => {
      return {
        uuid: order.uuid,
        fulfillerStatus: "RECEIVED",
        encounter: order?.encounterUuid,
      };
    });
    
    this.ordersService.updateOrdersViaEncounter(orders).subscribe({
      next: (order) => {
        return order;
      },
      error: (error) => {
        return error;
      },
    });
    this.sampleService.getSampleLabel().subscribe((label) => {
      if (label) {
        const labelSection =
          Number(label) < 10
            ? `00${label}`
            : label["label"] < 100
            ? `0${label}`
            : `${label}`;

        this.thereIsUnSavedSample = true;

        // console.log('labelSection', labelSection);
        let now = new Date();
        const identifier =
          "MGH/" +
          formatDateToYYMMDD(now).toString().split("-").join("").substring(2) +
          "/" +
          labelSection;
        const currentSampleIdElement = document.getElementById(
          sample?.specimenSourceUuid + count
        );
        // this.sampleIdentification[sample?.id] = identifier;
        currentSampleIdElement.setAttribute("value", identifier);
        // if (
        //   (this.labConfigs?.barCode && this.labConfigs?.barCode?.use) ||
        //   !this.labConfigs?.barCode
        // )
        setTimeout(() => {
          this.saveAsSample(sample, count, patient);
          this.dialog.open(BarCodeModalComponent, {
            height: "200px",
            width: "15%",
            data: {
              identifier: identifier,
              sample: sample,
            },
            disableClose: false,
            panelClass: "custom-dialog-container",
          });
        }, 400);
      }
    });
  }
}
