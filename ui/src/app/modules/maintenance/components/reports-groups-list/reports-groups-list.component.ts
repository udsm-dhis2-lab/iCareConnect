import { Component, Input, OnInit } from "@angular/core";
import { flatten, keyBy, groupBy } from "lodash";

@Component({
  selector: "app-reports-groups-list",
  templateUrl: "./reports-groups-list.component.html",
  styleUrls: ["./reports-groups-list.component.scss"],
})
export class ReportsGroupsListComponent implements OnInit {
  @Input() accessConfigs: any[];
  @Input() userRoles: any[];
  @Input() reports: any[];
  formattedReportGroups: any[];
  privileges: any = {};
  constructor() {}

  ngOnInit(): void {
    this.privileges = keyBy(
      flatten(
        this.userRoles?.map((userRole) => {
          return userRole?.privileges?.map((priv) => {
            return {
              ...priv,
              role: userRole,
            };
          });
        })
      ),
      "uuid"
    );
    const accessConfigsKeyedByReportOrReportGroup = keyBy(
      this.accessConfigs,
      "id"
    );
    const groupedReports = groupBy(
      this.reports?.map((report) => {
        return {
          ...report,
          privilege:
            this.privileges[
              accessConfigsKeyedByReportOrReportGroup[report?.id]?.privilege
            ],
        };
      }),
      "group"
    );
    this.formattedReportGroups = Object.keys(groupedReports).map((key) => {
      return {
        group: {
          name: key,
          privilege:
            this.privileges[
              accessConfigsKeyedByReportOrReportGroup[key]?.privilege
            ],
        },
        reports: groupedReports[key],
      };
    });
  }
}
