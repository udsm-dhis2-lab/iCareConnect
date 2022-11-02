import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-single-value-container",
  templateUrl: "./single-value-container.component.html",
  styleUrls: ["./single-value-container.component.scss"],
})
export class SingleValueContainerComponent implements OnInit {
  @Input() datesParams: { startDate: Date; endDate: Date };
  constructor() {}

  ngOnInit(): void {}
}
