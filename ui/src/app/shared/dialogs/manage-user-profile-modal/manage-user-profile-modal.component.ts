import { Component, Input, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { UserService } from "src/app/modules/maintenance/services/users.service";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";

@Component({
  selector: "app-manage-user-profile-modal",
  templateUrl: "./manage-user-profile-modal.component.html",
  styleUrls: ["./manage-user-profile-modal.component.scss"],
})
export class ManageUserProfileModalComponent implements OnInit {
  @Input() currentUser$: Observable<any>;
  isFormValid: boolean = false;
  userProperties: any;
  saving: boolean = false;
  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private dialogRef: MatDialogRef<ManageUserProfileModalComponent>
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.store.select(getCurrentUserDetails);
  }

  onSave(event: Event, currentUser: any): void {
    event.stopPropagation();
    const user = {
      userProperties: {
        ...currentUser?.userProperties,
        ...this.userProperties,
      },
    };
    this.saving = true;
    this.userService
      .updateUser({ data: user, uuid: currentUser?.uuid })
      .subscribe((response) => {
        if (response) {
          this.saving = false;
        }
      });
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onGetPropertiesToSave(userPropertiesToSave: any): void {
    this.userProperties = {
      pimaCOVIDUsername: userPropertiesToSave?.username?.trim()?.toLowerCase(),
      pimaCOVIDPassword: userPropertiesToSave?.password?.trim(),
    };
  }

  onGetFormValid(isValid: boolean): void {
    this.isFormValid = isValid;
  }
}
