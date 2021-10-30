import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Location } from 'src/app/core/models';
import { authenticateUser, logoutUser } from 'src/app/store/actions';
import { AppState } from 'src/app/store/reducers';
import {
  getChildLocationsOfTheFirstLevelParentLocation,
  getCurrentLocation,
} from 'src/app/store/selectors';
import {
  getCurrentUserDetails,
  getUserAssignedLocations,
} from 'src/app/store/selectors/current-user.selectors';
import { UserGet } from 'src/app/shared/resources/openmrs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LocationSelectModalComponent } from 'src/app/shared/components/location-select-modal/location-select-modal.component';
import { showSearchPatientOnMenu } from 'src/app/store/selectors/ui.selectors';
import { ChangePasswordComponent } from '../change-password/change-password.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  matDialogRef: MatDialogRef<ChangePasswordComponent>;
  name: string = '';
  currentUser$: Observable<UserGet>;
  locationsForCurrentUser$: Observable<Location[]>;
  currentLocation$: Observable<Location>;
  showPatientSearch$: Observable<boolean>;
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    // if (!JSON.parse(localStorage.getItem('currentLocation'))) {
    //   this.onOpenLocation(null);
    // }
    this.currentUser$ = this.store.select(getCurrentUserDetails);
    this.locationsForCurrentUser$ = this.store.select(getUserAssignedLocations);
    this.currentLocation$ = this.store.pipe(select(getCurrentLocation));
    this.showPatientSearch$ = this.store.pipe(select(showSearchPatientOnMenu));
  }

  onRouteHome(e: Event): void {
    e.stopPropagation();
    this.router.navigate(['']);
  }

  onLogOut(): void {
    localStorage.clear();
    window.localStorage.clear();
    sessionStorage.clear();
    this.store.dispatch(logoutUser());
  }

  onOpenLocation(e: Event): void {
    if (e) {
      e.stopPropagation();
    }
    this.dialog.open(LocationSelectModalComponent, {
      width: '20%',
      disableClose: true,
      panelClass: 'custom-dialog-container',
    });
  }
  oncChangePassword() {
    this.matDialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '25%',
      disableClose: true,
    });
  }
}
