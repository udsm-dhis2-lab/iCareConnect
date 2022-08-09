import { Component, Inject, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { FormValue } from "../../modules/form/models/form-value.model";
import { TextArea } from "../../modules/form/models/text-area.model";
import { Textbox } from "../../modules/form/models/text-box.model";
import {
  PrivilegeGet,
  PrivilegeGetFull,
  RoleCreate,
} from "../../resources/openmrs";
import { PrivilegesAndRolesService } from "../../services/privileges-and-roles.service";

@Component({
  selector: "app-manage-roles",
  templateUrl: "./manage-roles.component.html",
  styleUrls: ["./manage-roles.component.scss"],
})
export class ManageRolesComponent implements OnInit {
  dialogData: any;
  isFormValid: boolean = false;

  formFields: any[];
  formValues: any = {};

  saving: boolean = false;
  message: string;

  privileges$: Observable<PrivilegeGetFull[]>;
  privilegePage: number = 1;
  privilegePageSize: number = 10;

  selectedPrivileges: string[] = [];
  constructor(
    private dialogRef: MatDialogRef<ManageRolesComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private privilegesAndRolesService: PrivilegesAndRolesService
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.getPrivilegesList();
    this.formFields = [
      new Textbox({
        id: "name",
        key: "name",
        label: "Name",
        placeholder: "Name",
        required: true,
      }),
      new TextArea({
        id: "description",
        key: "description",
        label: "Description",
        placeholder: "Description",
        required: true,
      }),
    ];
  }

  getPrivilegesList(): void {
    this.privileges$ = this.privilegesAndRolesService.getPrivileges({
      limit: this.privilegePageSize,
      startIndex: (this.privilegePage - 1) * this.privilegePageSize,
    });
  }

  checkBoxSelectionChange(event: MatCheckboxChange, id: string): void {
    this.selectedPrivileges = event?.checked
      ? [...this.selectedPrivileges, id]
      : (this.selectedPrivileges || [])?.filter(
          (privilege) => privilege != id
        ) || [];
  }

  onFormUpdate(formValues: FormValue): void {
    this.isFormValid = formValues.isValid;
    this.formValues = formValues.getValues();
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event): void {
    event.stopPropagation();
    this.saving = true;
    const role: RoleCreate = {
      name: this.formValues["name"]?.value,
      description: this.formValues["description"]?.value,
      privileges: this.selectedPrivileges.map((privilegeId) => {
        return {
          uuid: privilegeId,
        };
      }),
    };
    this.privilegesAndRolesService
      .addNewRole(role)
      .subscribe((response: any) => {
        if (response && !response?.error) {
          this.saving = false;
          this.message = null;
          this.dialogRef.close(true);
        } else {
          this.saving = false;
          this.message = response?.error?.message;
        }
      });
  }

  getItems(event: Event, actionType: string): void {
    event.stopPropagation();
    this.privilegePage =
      actionType === "next" ? this.privilegePage + 1 : this.privilegePage - 1;

    this.getPrivilegesList();
  }
}
