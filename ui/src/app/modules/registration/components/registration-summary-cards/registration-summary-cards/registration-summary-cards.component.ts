import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-registration-summary-cards',
  templateUrl: './registration-summary-cards.component.html',
  styleUrls: ['./registration-summary-cards.component.scss']
})
export class RegistrationSummaryCardsComponent implements OnInit {
  @Input() roomNo: number;
  @Input() doctorName: string;
  @Input() totalActivePatients: number;

  constructor() { }

  ngOnInit(): void {
  }

}
