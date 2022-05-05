import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { map, take } from "rxjs/operators";
import { AppState } from "src/app/store/reducers";
import {
  getAllUSerRoles,
  getCurrentUserInfo,
  getCurrentUserPrivileges,
} from "src/app/store/selectors/current-user.selectors";
import { formatDateToYYMMDD } from "src/app/shared/helpers/format-date.helper";
import {
  loadLabConfigurations,
  setVisitsParameters,
  clearLoadedLabSamples,
  loadActiveVisitsWithLabOrders,
  loadCurrentUserDetails,
  loadSampleTypes,
  loadSessionDetails,
  clearLoadedLabOrders,
  loadRolesDetails,
  loadOrderTypes,
} from "src/app/store/actions";
import { loadSpecimenSources } from "./store/actions/specimen-sources-and-tests-management.actions";
import { getAllSampleTypes } from "src/app/store/selectors";

@Component({
  selector: "lab-root",
  templateUrl: "./laboratory.component.html",
  styleUrls: ["./laboratory.component.scss"],
})
export class LaboratoryComponent implements OnInit {
  title = "Laboratory";
  billingInformation$: Observable<any>;
  results$: Observable<any>;
  labOrders$: Observable<any>;
  entities$: Observable<any>;
  currentUserUuid: string;
  currentUser$: Observable<any>;
  parameters: any = {};
  privileges$: Observable<any>;
  roles$: Observable<any>;
  currentUserLoadedState$: Observable<boolean>;
  selectedDay: Date = new Date();
  today: Date = new Date();
  url$: Observable<any>;
  showDate: Boolean = true;
  startDate: any;
  endDate: any;
  datesRangeDifference: number = 5;
  currentSubModule: string;

  sampleTypes$: Observable<any>;
  specimenSources$: Observable<any>;
  userRoles$: Observable<any>;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.store.dispatch(loadRolesDetails());
    this.store.dispatch(loadOrderTypes());
    router.events.subscribe((currentRoute) => {
      // console.log('this :: ', currentRoute instanceof NavigationEnd);
      if (currentRoute instanceof NavigationEnd) {
        // console.log(currentRoute);

        if (currentRoute?.url?.includes("/sample-acceptance-and-results")) {
          this.enableDate(this.datesRangeDifference);
          this.currentSubModule = "acceptance";
        } else if (currentRoute?.url?.includes("/sample-tracking")) {
          this.enableDate(this.datesRangeDifference);
          this.currentSubModule = "tracking";
        } else if (currentRoute?.url?.includes("/lab-investigation-home")) {
          this.disableDate();
          this.currentSubModule = "order-tests";
        } else if (currentRoute?.url?.includes("/reports")) {
          this.disableDate();
          this.currentSubModule = "reports";
        } else if (currentRoute?.url?.includes("/settings")) {
          this.disableDate();
          this.currentSubModule = "settings";
        } else if (currentRoute?.url?.includes("/sample-collection")) {
          this.currentSubModule = "collection";
          this.disableDate();
        } else if (currentRoute?.url === "/laboratory") {
          this.router.navigate(["laboratory"]);
        }
      }
    });
  }

  ngOnInit() {
    this.url$ = this.route.url.pipe(map((segments) => segments.join("")));
    this.userRoles$ = this.store.select(getAllUSerRoles);
    // this.store.dispatch(loadSessionDetails());
    this.store.dispatch(loadSpecimenSources());

    let today = formatDateToYYMMDD(new Date());

    this.parameters = {
      ...this.parameters,
      startDate: formatDateToYYMMDD(
        new Date(
          Number(today.split("-")[0]),
          Number(today.split("-")[1]) - 1,
          Number(today.split("-")[2]) - this.datesRangeDifference
        )
      ),
      endDate: formatDateToYYMMDD(
        new Date(
          Number(today.split("-")[0]),
          Number(today.split("-")[1]) - 1,
          Number(today.split("-")[2])
        )
      ),
    };

    this.startDate = this.parameters?.startDate;
    this.endDate = this.parameters?.endDate;

    this.store.dispatch(
      loadLabConfigurations({ periodParameters: this.parameters })
    );

    this.store.dispatch(setVisitsParameters({ parameters: this.parameters }));
    this.privileges$ = this.store.select(getCurrentUserPrivileges);

    this.currentUser$ = this.store.select(getCurrentUserInfo);
    this.store.dispatch(loadSampleTypes());

    this.sampleTypes$ = this.store.select(getAllSampleTypes);
  }

  disableDate() {
    this.showDate = false;
  }

  enableDate(dateRange) {
    this.showDate = true;
    let endDate =
      dateRange == 6
        ? formatDateToYYMMDD(new Date())
        : this.parameters?.endDate;

    this.parameters = {
      ...this.parameters,
      startDate: formatDateToYYMMDD(
        new Date(
          Number(endDate?.split("-")[0]),
          Number(endDate?.split("-")[1]) - 1,
          Number(endDate?.split("-")[2]) - dateRange
        )
      ),
      endDate: formatDateToYYMMDD(
        new Date(
          Number(endDate?.split("-")[0]),
          Number(endDate?.split("-")[1]) - 1,
          Number(endDate?.split("-")[2])
        )
      ),
    };

    this.startDate = this.parameters?.startDate;
    this.endDate = this.parameters?.endDate;

    this.store.dispatch(setVisitsParameters({ parameters: this.parameters }));
  }

  onDateChange(reload?: boolean) {
    if (reload && this.endDate) {
      this.store.dispatch(clearLoadedLabOrders());

      this.store.dispatch(clearLoadedLabSamples());

      this.parameters = {
        ...this.parameters,
        startDate: `${this.startDate.getFullYear()}-${
          this.startDate.getMonth() + 1
        }-${this.startDate.getDate()}`,
        endDate: `${this.endDate.getFullYear()}-${
          this.endDate.getMonth() + 1
        }-${this.endDate.getDate()}`,
      };

      this.store.dispatch(
        loadLabConfigurations({ periodParameters: this.parameters })
      );

      this.store.dispatch(setVisitsParameters({ parameters: this.parameters }));

      // this.store.dispatch(loadActiveVisits({ parameters: this.parameters }));

      if (this.currentSubModule == "collection") {
        // console.log('here');
        // this.store.dispatch(
        //   loadActiveVisitsWithLabOrders({
        //     startDate: this.parameters?.startDate,
        //     endDate: this.parameters?.endDate,
        //   })
        // );
      } else {
        // console.log('not collection');
      }
      //this.refreshPage()
    }
  }
}
