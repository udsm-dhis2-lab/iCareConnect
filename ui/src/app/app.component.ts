import { Component, OnDestroy, OnInit, VERSION } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { Observable, fromEvent, merge, of, Subscription, timer } from "rxjs";
import { map } from 'rxjs/operators';
import { LoginDialogComponent } from "./core/dialogs/login-dialog/login-dialog.component";
import { AuthService } from "./core/services/auth.service";
import { loadDHIS2ReportsConfigs } from "./store/actions";
import { AppState } from "./store/reducers";
import { getIfNonLoginRoute } from "./store/selectors";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {

  title = "iCare";

  isNonLoginRoute$: Observable<boolean>;
  isDialogOpen: boolean;
  networkStatus: boolean = false;
  networkStatus$: Subscription = Subscription.EMPTY;
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkNetworkStatus();
    this.monitorSession();
    this.isNonLoginRoute$ = this.store.pipe(select(getIfNonLoginRoute));
  }

  ngOnDestroy(): void {
    this.networkStatus$.unsubscribe();
}

// To check for internet connection stability
checkNetworkStatus() {
  this.networkStatus = navigator.onLine;
  this.networkStatus$ = merge(
    of(null),
    fromEvent(window, 'online'),
fromEvent(window, 'offline')
  )
  .pipe(map(() => navigator.onLine))
      .subscribe(status => {
            console.log('status', status);
        this.networkStatus = status;
      });
      window.alert(this.networkStatus
        ? 'IS CONNECTED': 'NOT CONNECTED');
    }
  monitorSession() {
    timer(2000, 10000).subscribe(() => {
      this.auth.session().subscribe((session) => {
        if (
          !session?.authenticated &&
          !this.isDialogOpen &&
          !window.location.href.includes("login")
        ) {
          this.isDialogOpen = true;
          const dialog = this.dialog.open(LoginDialogComponent, {
            width: "25%",
            panelClass: "custom-dialog-container",
            disableClose: true,
          });

          dialog.afterClosed().subscribe(() => {
            this.isDialogOpen = false;
          });
        }
      });
    });
  }
}
