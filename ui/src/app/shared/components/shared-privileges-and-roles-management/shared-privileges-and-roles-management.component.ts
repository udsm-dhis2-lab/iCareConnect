import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-shared-privileges-and-roles-management",
  templateUrl: "./shared-privileges-and-roles-management.component.html",
  styleUrls: ["./shared-privileges-and-roles-management.component.scss"],
})
export class SharedPrivilegesAndRolesManagementComponent implements OnInit {
  @Input() currentUser: any;
  constructor() {}

  ngOnInit(): void {}
}
