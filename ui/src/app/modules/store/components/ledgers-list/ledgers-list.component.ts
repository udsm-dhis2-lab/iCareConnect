import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { LedgerTypeObject } from "src/app/shared/resources/store/models/ledger-type.model";
import { LedgerTypeService } from "src/app/shared/resources/store/services/ledger-type.service";

@Component({
  selector: "app-ledgers-list",
  templateUrl: "./ledgers-list.component.html",
  styleUrls: ["./ledgers-list.component.scss"],
})
export class LedgersListComponent implements OnInit {
  ledgerTypes$: Observable<LedgerTypeObject[]>;
  constructor(private ledgerTypesService: LedgerTypeService) {}

  ngOnInit(): void {
    this.ledgerTypes$ = this.ledgerTypesService.getLedgerTypes();
  }
}
