import { Component, OnInit } from "@angular/core";
import { Observable, from } from "rxjs";
import { map } from "rxjs/operators";
import { OpenmrsHttpClientService } from "src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service";
import { Api, ServerlogGetFull } from "src/app/shared/resources/openmrs";

@Component({
  selector: "app-server-logs",
  templateUrl: "./server-logs.component.html",
  styleUrls: ["./server-logs.component.scss"],
})
export class ServerLogsComponent implements OnInit {
  serverLogs$: Observable<ServerlogGetFull[]>;
  constructor(
    private api: Api,
    private httpClientService: OpenmrsHttpClientService
  ) {}

  ngOnInit(): void {
    this.serverLogs$ = this.httpClientService.get("icare/auditlogs");
  }
}
