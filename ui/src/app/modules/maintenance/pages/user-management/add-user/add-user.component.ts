import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { processDateFromMaterialInput } from 'src/app/shared/helpers/utils.helpers';
import { LocationGetFull, RoleCreate } from 'src/app/shared/resources/openmrs';
import {
  GlobalEventHandlersEvent,
  PersonCreateModel,
  UserCreateModel,
} from '../../../models/user.model';
import { UserService } from '../../../services/users.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnInit {
  @ViewChild('table', { static: false }) table: MatTable<any>;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  loading: boolean = true;
  userForm: FormGroup;
  hide: boolean = true;
  roles: RoleCreate[];
  selectedRoles: any[] = [];
  displayedColumns: string[] = ['display'];
  selectedUserId: any;
  checked: boolean = false;
  selectedUser: UserCreateModel;
  person: PersonCreateModel;
  rolesDataSource: MatTableDataSource<RoleCreate>;
  rolesLoading: boolean = true;
  touchtime: number = 0;
  selectedRolesDatasource: MatTableDataSource<RoleCreate>;
  moveToAvailable: any[] = [];
  moveToSelected: any[] = [];
  clickedAvailable: any[] = [];
  searchText: string = '';
  genderClicked: boolean = false;
  today: Date = new Date();
  saving: boolean = false;
  birthdate: Date | string;
  clickedRows: any[] = [];
  usernames: number = 0;
  initialization: boolean = true;
  searching: boolean = false;
  locations: any[] = [];
  selectedLocations: any = [];
  value: boolean;
  genderValues = [
    { code: 'F', value: 'Female' },
    { code: 'U', value: 'Unknown' },
    { code: 'M', value: 'Male' },
  ];

  gender: { Female: string; Male: string; Unknown: string } = {
    Female: 'F',
    Male: 'M',
    Unknown: 'U',
  };
  currentDataAvailable: RoleCreate[];
  passwordFocusOut: Boolean = false;
  passwordStrong: Boolean = true;
  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.userForm = this.generateForm();
    this.service.getRoles().subscribe((roles) => {
      this.roles = roles.results;
      this.rolesDataSource = new MatTableDataSource(this.roles);
      this.selectedRolesDatasource = new MatTableDataSource(this.selectedRoles);
      this.loading = false;
    });
    this.service.getLoginLocations().subscribe((res) => {
      this.locations = res.results;
    });
  }
  generateForm() {
    return this.fb.group({
      username: new FormControl('', Validators.required),
      password: ['', [Validators.required, Validators.minLength(8)]],
      gender: new FormControl(''),
      middleName: new FormControl(''),
      firstName: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      confirmpassword: new FormControl(''),
      addressDisplay: new FormControl(''),
      country: new FormControl('', Validators.required),
      district: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      postalCode: new FormControl(''),
      addressDisplay2: new FormControl(''),
      checked: false,
      birthdate: new FormControl('', Validators.required),
      MCTNumber: new FormControl(''),
      phoneNumber: new FormControl(''),
      qualification: new FormControl(''),
    });
  }
  get passwordInput() {
    return this.userForm.get('password');
  }
  get confirmpassword() {
    return this.userForm.get('confirmpassword');
  }

  onClickGender(e: GlobalEventHandlersEvent) {
    e.stopPropagation();
    this.genderClicked = !this.genderClicked;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.rolesDataSource.filter = filterValue.trim().toLowerCase();
    this.selectedRolesDatasource.filter = filterValue.trim().toLowerCase();
  }
  saveData() {
    this.saving = true;
    const data = this.userForm.value;
    const years = moment().diff(data.birthdate, 'years', false);
    const prefferedLocation = {
      display: data.addressDisplay,
      preferred: true,
      address1: data.addressDisplay,
      address2: data.addressDisplay2,
      cityVillage: data.district,
      stateProvince: data.city,
      country: data.country,
      postalCode: data.postalCode,
      countyDistrict: data.district,
      startDate: data.addressStartDate ? data.addressStartDate : null,
      endDate: data.addressEndDate ? data.addressEndDate : null,
      latitude: data.longitude ? data.longitude : null,
      longitude: data.longitude ? data.longitude : null,
    };

    const person = {
      names: [
        {
          givenName: data?.firstName,
          middleName: data?.middleName,
          familyName: data?.surname,
        },
      ],
      age: years.toString(),
      birthdateEstimated: false,
      dead: false,
      display: data.firstName,
      addresses: [prefferedLocation],
      birthdate: processDateFromMaterialInput(data.birthdate),
      gender: this.gender[data.gender],
    };
    const user = {
      userProperties: {
        locations: JSON.stringify(
          this.selectedLocations.map(({ uuid }) => uuid)
        ),
      },
      username: data.username,
      password: data.password,
      roles: this.selectedRoles,
      person
    };
    this.service.createUser({ user }).subscribe(
      (user) => {
        if (user) {
          this._snackBar.open(
            `User ${person.display} created successfully`,
            'OK',
            {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 10000,
              panelClass: ['snack-color'],
            }
          );
          window.location.href = '#/maintenance/users/';
          this.saving = false;
        }
      },
      (error: { error: any }) => {
        console.log(error)
        this._snackBar.open(
          `An error ocurred. Please try again. Hint: ${error.error?.error?.message || error.error.message}`,
          'CLOSE',
          {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000,
            panelClass: ['snack-color-error'],
          }
        );
        this.saving = false;
      }
    );
  }

  get fullName() {
    return (
      (this.userForm.get('firstName') && this.userForm.get('firstName').value
        ? this.userForm.get('firstName').value
        : '') +
      ' ' +
      (this.userForm.get('middleName') && this.userForm.get('middleName').value
        ? this.userForm.get('middleName').value
        : '') +
      ' ' +
      (this.userForm.get('surname') && this.userForm.get('surname').value
        ? this.userForm.get('surname').value
        : '')
    );
  }
  selectedRowAvailable(role: RoleCreate) {
    const clicked = this.clickedAvailable.find(
      ({ uuid }) => role.uuid === uuid
    );
    return clicked
      ? { background: '#2a8fd1', color: 'white !important' }
      : { background: '', color: 'black' };
  }

  assignAll() {
    this.moveToAvailable = [];
    this.moveToSelected = [];
    this.clickedAvailable = [];
    this.selectedRoles = [...this.selectedRoles, ...this.roles];
    this.selectedRolesDatasource = new MatTableDataSource(this.selectedRoles);
    this.roles = [];
    this.rolesDataSource = new MatTableDataSource(this.roles);
  }
  unAssignAll() {
    this.moveToAvailable = [];
    this.moveToSelected = [];
    this.clickedAvailable = [];
    this.roles = [...this.roles, ...this.selectedRoles];
    this.rolesDataSource = new MatTableDataSource(this.roles);
    this.selectedRoles = [];
    this.selectedRolesDatasource = new MatTableDataSource(this.selectedRoles);
  }
  getRoleSingleClick(
    e: GlobalEventHandlersEvent,
    role: RoleCreate,
    action: string
  ) {
    if (action === 'selected') {
      this.moveToSelected = [];
      this.getSelected({ e, role });
    } else {
      this.moveToAvailable = [];
      this.getAvailable({ e, role });
    }
  }
  getRoleDoubleClick(
    e: GlobalEventHandlersEvent,
    role: RoleCreate,
    action: string
  ) {
    if (action === 'selected') {
      if (!e.metaKey && !e.crtlKey && !e.shiftKey) {
        this.clickedRows = [];
        this.moveToAvailable = [];
        this.selectedRoles = this.selectedRoles.filter(
          ({ uuid }) => role.uuid !== uuid
        );
        this.roles = [...this.roles, role];
        this.rolesDataSource = new MatTableDataSource(this.roles);
        this.selectedRolesDatasource = new MatTableDataSource(
          this.selectedRoles
        );
      }
    } else {
      if (!e.metaKey && !e.crtlKey && !e.shiftKey) {
        this.clickedRows = [];
        this.moveToSelected = [];
        this.roles = this.roles.filter(({ uuid }) => role.uuid !== uuid);
        this.rolesDataSource = new MatTableDataSource(this.roles);
        this.selectedRoles = [...this.selectedRoles, role];
        this.selectedRolesDatasource = new MatTableDataSource(
          this.selectedRoles
        );
      }
    }
  }
  onClickMoveToAvailable() {
    this.roles = [...this.roles, ...this.moveToAvailable];
    this.selectedRoles = this.selectedRoles.filter(
      (selectedrole: RoleCreate) =>
        !this.moveToAvailable.find(({ uuid }) => selectedrole.uuid === uuid)
    );
    this.selectedRolesDatasource = new MatTableDataSource(this.selectedRoles);
    this.rolesDataSource = new MatTableDataSource(this.roles);
    this.moveToAvailable = [];
  }
  onClickMoveToSelected() {
    this.selectedRoles = [...this.selectedRoles, ...this.moveToSelected];
    this.roles = this.roles.filter(
      (selectedrole: RoleCreate) =>
        !this.moveToSelected.find(({ uuid }) => selectedrole.uuid === uuid)
    );
    this.selectedRolesDatasource = new MatTableDataSource(this.selectedRoles);
    this.rolesDataSource = new MatTableDataSource(this.roles);
    this.moveToSelected = [];
  }
  getSelected({ e, role }) {
    this.clickedAvailable = [];
    e.stopPropagation();
    if ((e.metaKey || e.crtlKey) && !e.shiftKey) {
      this.moveToSelected = [];
      const alreadySelected = this.clickedRows.find(
        ({ uuid }) => role.uuid === uuid
      );
      if (alreadySelected) {
        this.clickedRows = this.clickedRows.filter(
          ({ uuid }) => role.uuid !== uuid
        );
        this.moveToAvailable = this.moveToAvailable.filter(
          ({ uuid }) => role.uuid !== uuid
        );
        this.selectedRow(role);
      } else {
        this.clickedRows = [...this.clickedRows, role];
        this.moveToAvailable = [...this.moveToAvailable, role];
      }
    } else if (e.shiftKey) {
      //this.ShiftKeyDown(e, role);
    } else {
      this.clickedRows = [];
      this.moveToAvailable = [];
      this.moveToAvailable = [role];
      this.clickedRows = [...this.clickedRows, role];
    }
  }
  getAvailable({ e, role }) {
    e.stopPropagation();
    this.moveToAvailable = [];
    this.clickedRows = [];
    if ((e.metaKey || e.crtlKey) && !e.shiftKey) {
      this.moveToAvailable = [];
      const alreadySelected = this.clickedAvailable.find(
        ({ uuid }) => role.uuid === uuid
      );
      if (alreadySelected) {
        this.clickedAvailable = this.clickedAvailable.filter(
          ({ uuid }) => role.uuid !== uuid
        );
        this.moveToSelected = this.moveToSelected.filter(
          ({ uuid }) => role.uuid !== uuid
        );
        this.selectedRow(role);
      } else {
        this.clickedAvailable = [...this.clickedAvailable, role];
        this.moveToSelected = [...this.moveToSelected, role];
      }
    } else if (e.shiftKey) {
    } else {
      this.clickedAvailable = [];
      this.moveToSelected = [];
      this.moveToSelected = [role];
      this.clickedAvailable = [...this.clickedAvailable, role];
    }
  }
  selectedRow(role: RoleCreate) {
    const clicked = this.clickedRows.find(({ uuid }) => role.uuid === uuid);
    return clicked
      ? { background: '#2a8fd1', color: 'white' }
      : { background: '', color: 'black' };
  }
  search(e: GlobalEventHandlersEvent) {
    this.searching = true;
    this.initialization = false;
    e.stopPropagation();
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue === '') {
      this.searching = false;
    } else {
      this.service.searchUser(filterValue).subscribe((res) => {
        this.usernames = res.results.length;
        if (this.usernames === 0) {
          this.searching = false;
        }
      });
    }
  }
  searchLocation(e: GlobalEventHandlersEvent) {
    this.searching = true;
    this.initialization = false;
    e.stopPropagation();
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue === '') {
      this.searching = false;
    } else {
      this.service.getLoginLocations().subscribe((res) => {
        this.locations = res.results;
        if (this.locations.length === 0) {
          this.searching = true;
        }
      });
    }
  }
  getLocations(e: GlobalEventHandlersEvent, row: LocationGetFull) {
    e.stopPropagation();
    this.locations = this.locations.filter(({ uuid }) => row.uuid !== uuid);
    this.selectedLocations = [...this.selectedLocations, row];
  }
  removeLocation(e: GlobalEventHandlersEvent, row: LocationGetFull) {
    e.stopPropagation();
    this.selectedLocations = this.selectedLocations.filter(
      ({ uuid }) => row.uuid !== uuid
    );
  }
  get passwordMatch() {
    if (this.hide) {
      if (this.passwordInput.value === this.confirmpassword.value) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  confirmStrongPassword(e: GlobalEventHandlersEvent) {
    this.passwordFocusOut = true;
    e.stopPropagation();
    if (this.passwordInput.value && this.passwordInput.value !== '') {
      const strongPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\w{6,}$/;
      const test = strongPassword.test(this.passwordInput.value);
      this.passwordFocusOut = true;
      if (test) {
        this.passwordStrong = true;
      } else {
        this.passwordStrong = false;
      }
    }
  }
  providerAccount(value: boolean) {
    this.value = value;
  }
  providerAttributes = {
    attributes: [
      {
        attributeType: '79fa49fc-d584-4b74-9dcd-eb265372ade1',
        value: '',
      },
      {
        attributeType: '685a0d80-25e5-4ed4-8a03-974a1d161bf3',
        value: '',
      },
      {
        attributeType: '9c4420fa-5a22-4249-978c-da6e0f24880b',
        value: '',
      },
    ],
    retired: false,
  };
}
