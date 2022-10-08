import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { SystemUsersService } from "src/app/core/services/system-users.service";

@Component({
  selector: "app-manage-users",
  templateUrl: "./manage-users.component.html",
  styleUrls: ["./manage-users.component.scss"],
})
export class ManageUsersComponent implements OnInit {
  userId: string;
  user$: Observable<any>;
  constructor(
    private route: ActivatedRoute,
    private usersService: SystemUsersService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams["id"];
    console.log(this.userId);

    this.user$ = this.usersService.getUserById(this.userId);
  }
}
