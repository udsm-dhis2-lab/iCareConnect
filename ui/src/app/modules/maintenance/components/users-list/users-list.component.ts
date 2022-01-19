import {
  Component,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  Input,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { UserCreateModel } from "../../models/user.model";
import { CaptureSignatureComponent } from "../capture-signature/capture-signature.component";

@Component({
  selector: "app-users-list",
  templateUrl: "./users-list.component.html",
  styleUrls: ["./users-list.component.scss"],
})
export class UsersListComponent implements OnInit {
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
  public data = {};
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Input() currentUser: any;
  @Input() users: any[];
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<UserCreateModel>(this.users);
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
