import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MatLegacyPaginator as MatPaginator } from "@angular/material/legacy-paginator";
import { MatLegacyTableDataSource as MatTableDataSource } from "@angular/material/legacy-table";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SystemUsersService } from "src/app/core/services/system-users.service";
import { UserService } from "src/app/modules/maintenance/services/users.service";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
import { AddNewUserComponent } from "../add-new-user/add-new-user.component";
import { LabEditUserModalComponent } from "../lab-edit-user-modal/lab-edit-user-modal.component";

@Component({
  selector: "app-user-management-dashboard",
  templateUrl: "./user-management-dashboard.component.html",
  styleUrls: ["./user-management-dashboard.component.scss"],
})
export class UserManagementDashboardComponent implements OnInit, AfterViewInit {
  itemSearchTerm: string;
  addingUserItem: boolean;
  currentUser$: Observable<any>;
  loading: boolean = true;
  displayedColumns: string[] = [
    "index",
    "display",
    "fullName",
    "username",
    "systemId",
    "actions",
  ];
  dataSource: MatTableDataSource<any>;
  users$: Observable<any>;
  page: number = 1;
  pageCount: number = 25;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filterValue: string = "";
  public data = {};

  constructor(
    private store: Store<AppState>,
    private service: SystemUsersService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // TODO: current user to be used for privilages control
    this.currentUser$ = this.store.select(getCurrentUserDetails);
    this.getUsers();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  getRecord(row: any): void {
    localStorage.setItem("selectedUser", JSON.stringify(row));
    // this.router.navigate(["edit-user"], {
    //   state: this.data,
    //   relativeTo: this.route,
    //   queryParams: { id: row.uuid },
    // });
    this.service.getUserById(row?.uuid).subscribe((userResponse) => {
      if (userResponse) {
        this.data = userResponse;
        this.dialog.open(LabEditUserModalComponent, {
          width: "70%",
          data: this.data,
          maxHeight: "70vh",
        });
      }
    });
  }

  onAddUser(event: Event): void {
    event.stopPropagation();
    this.dialog.open(AddNewUserComponent, {
      width: "70%",
      maxHeight: "80vh",
    });
  }

  onEditChild(e) {}

  onDelete(e) {}

  onOpenDetails(e) {}

  applyFilter(event: Event): void {
    event.stopPropagation();
    this.filterValue = (event.target as HTMLInputElement).value;
    this.page = 1;
    this.getUsers();
  }

  getUsers(): void {
    this.users$ = this.service.getUsers({
      q: this.filterValue,
      limit: this.pageCount,
      startIndex: (this.page - 1) * this.pageCount,
    });
  }

  getUsersList(event: Event, action: string): void {
    event.stopPropagation();
    this.page = action === "next" ? this.page + 1 : this.page - 1;
    this.getUsers();
  }
}
