import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-shared-sample-details",
  templateUrl: "./shared-sample-details.component.html",
  styleUrls: ["./shared-sample-details.component.scss"],
})
export class SharedSampleDetailsComponent implements OnInit {
  @Input() sample: any;
  isClinical: boolean;
  constructor() {}

  ngOnInit(): void {
    // console.log(this.sample);
    this.isClinical =
      (
        this.sample?.statuses?.filter(
          (status) => status?.status === "CLINICAL"
        ) || []
      )?.length > 0;
  }
}
