import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
import { CaptureSignatureComponent } from "../../../components/capture-signature/capture-signature.component";
import { UserCreateModel } from "../../../models/user.model";
import { UserService } from "../../../services/users.service";

@Component({
  selector: "app-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
})
export class UserManagementComponent implements OnInit, AfterViewInit {
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
  dataSource: MatTableDataSource<UserCreateModel>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private store: Store<AppState>,
    private service: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // TODO: current user to be used for privilages control
    this.currentUser$ = this.store.select(getCurrentUserDetails);
    this.service.getUsers().subscribe((users) => {
      this.dataSource = new MatTableDataSource<UserCreateModel>(
        users["results"]
      );
      this.dataSource.paginator = this.paginator;
      this.loading = false;
    });
  }
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }
  public data = {};
  getRecord(row: UserCreateModel) {
    this.data = row;
    localStorage.setItem("selectedUser", JSON.stringify(row));
    this.router.navigate(["edit-user"], {
      state: this.data,
      relativeTo: this.route,
      queryParams: { id: row.uuid },
    });
  }
  onEditChild(e) {}
  onDelete(e) {}
  onOpenDetails(e) {}
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onCaptureSignature(event: Event, currentUser: any): void {
    event.stopPropagation();
    this.dialog.open(CaptureSignatureComponent, {
      width: "40%",
      data: {
        ...currentUser,
        userUuid: currentUser?.uuid,
      },
    });
  }
}
