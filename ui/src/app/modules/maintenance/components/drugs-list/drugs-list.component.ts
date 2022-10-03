import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { DrugsService } from "src/app/shared/resources/drugs/services/drugs.service";

@Component({
  selector: "app-drugs-list",
  templateUrl: "./drugs-list.component.html",
  styleUrls: ["./drugs-list.component.scss"],
})
export class DrugsListComponent implements OnInit {
  @Input() conceptUuid: string;
  drugs$: Observable<any>;
  startIndex: number = 0;
  limit: number = 10;

  page: number = 1;
  constructor(private drugService: DrugsService) {}

  ngOnInit(): void {
    this.getDrugs();
  }

  getDrugs(): void {
    if (this.conceptUuid) {
      this.drugs$ = this.drugService.getDrugsUsingConceptUuid(this.conceptUuid);
    } else {
      this.drugs$ = this.drugService.getAllDrugs({
        startIndex: this.startIndex,
        limit: this.limit,
      });
    }
  }

  onGetList(event: Event, actionType: string): void {
    event.stopPropagation();
    this.page = actionType === "next" ? this.page + 1 : this.page - 1;
    this.startIndex = this.limit * this.page - 1 + 1;
    this.getDrugs();
  }
}
