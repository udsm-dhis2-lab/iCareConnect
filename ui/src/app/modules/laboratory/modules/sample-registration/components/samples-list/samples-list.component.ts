import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SamplesService } from "src/app/shared/services/samples.service";

@Component({
  selector: "app-samples-list",
  templateUrl: "./samples-list.component.html",
  styleUrls: ["./samples-list.component.scss"],
})
export class SamplesListComponent implements OnInit {
  samples$: Observable<any[]>;
  constructor(private samplesService: SamplesService) {}

  ngOnInit(): void {
    this.samples$ = this.samplesService.getSampleByStatusCategory("EQA");
  }
}
