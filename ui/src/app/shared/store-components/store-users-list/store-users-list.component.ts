import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CaptureSignatureComponent } from "../../components/capture-signature/capture-signature.component";
import { MatLegacyTableDataSource as MatTableDataSource } from "@angular/material/legacy-table";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MatLegacyPaginator as MatPaginator } from "@angular/material/legacy-paginator";

@Component({
  selector: "app-store-users-list",
  templateUrl: "./store-users-list.component.html",
  styleUrls: ["./store-users-list.component.scss"],
})
export class StoreUsersListComponent implements OnInit {
  displayedColumns: string[] = [
    "index",
    "display",
    "fullName",
    "username",
    "systemId",
    "actions",
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public data = {};
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Input() currentUser: any;
  @Input() users: any[];
  @Input() pageCount: number;
  @Input() page: number;
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<any>(this.users);
    this.dataSource.paginator = this.paginator;
  }

  getRecord(event: Event, user: any): void {
    this.edit.emit(user);
  }

  onCaptureSignature(event: Event, currentUser: any, user: any): void {
    this.dialog.open(CaptureSignatureComponent, {
      width: "40%",
      data: {
        ...currentUser,
        userUuid: user?.uuid,
        user,
      },
    });
  }
}
