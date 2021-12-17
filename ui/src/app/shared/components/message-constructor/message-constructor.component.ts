import { Component, Input, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { formatDateToYYMMDD } from "../../helpers/format-date.helper";
import { ConceptsService } from "../../resources/concepts/services/concepts.service";
import { OrdersService } from "../../resources/order/services/orders.service";

@Component({
  selector: "app-message-constructor",
  templateUrl: "./message-constructor.component.html",
  styleUrls: ["./message-constructor.component.scss"],
})
export class MessageConstructorComponent implements OnInit {
  @Input() data: any;
  @Input() durationUnitsConceptUuid: string;
  selectedDateTime: any;
  numberOfDays: number;
  selectedFrequency: any;
  doseInfo: string;
  durationUnits$: Observable<any>;
  orderFrequencies$: Observable<any>;
  allFrequencies: any[];
  messages: any[];
  constructor(
    private conceptService: ConceptsService,
    private orderService: OrdersService
  ) {}

  ngOnInit(): void {
    // this.durationUnits$ = this.conceptService.getConceptDetailsByUuid(
    //   this.durationUnitsConceptUuid,
    //   "custom:(uuid,name,setMembers,answers)"
    // );
    this.orderFrequencies$ = this.orderService.getOrdersFrequencies();
    this.orderFrequencies$.subscribe((response) => {
      if (response) {
        this.allFrequencies = response;
      }
    });
  }

  searchItem(event, frequencies): void {
    this.orderFrequencies$ = of(
      frequencies.filter(
        (option) =>
          option?.display.toLowerCase().indexOf(event.target.value) > -1
      )
    );
  }

  getSelectedItemFromOption(event: Event, selectedItem, itemType): void {
    event.stopPropagation();
    this.selectedFrequency = selectedItem;
    this.messages = this.constructMessages(
      this.numberOfDays,
      this.selectedFrequency,
      this.doseInfo,
      this.selectedDateTime
    );
  }

  onModelChange(event, key, selectedDateTime): void {
    this.selectedDateTime = selectedDateTime;
    this.messages = this.constructMessages(
      this.numberOfDays,
      this.selectedFrequency,
      this.doseInfo,
      this.selectedDateTime
    );
  }

  getNumberOfDays(event: Event, days): void {
    this.numberOfDays = days;
    this.messages = this.constructMessages(
      this.numberOfDays,
      this.selectedFrequency,
      this.doseInfo,
      this.selectedDateTime
    );
  }

  getDoseInfo(event: Event, doseInfo): void {
    this.doseInfo = doseInfo;
    this.messages = this.constructMessages(
      this.numberOfDays,
      this.selectedFrequency,
      this.doseInfo,
      this.selectedDateTime
    );
  }

  constructMessages(days, frequency, dosePerIntake, startingDateTime): any {
    let messages = [];
    if (days && frequency && dosePerIntake && startingDateTime) {
      for (
        let count = 0;
        count < Number(days) * Number(frequency?.frequencyPerDay);
        count++
      ) {
        const hours = count * Number(24 / Number(frequency?.frequencyPerDay));
        const currentDate = this.addHoursToTheDate(startingDateTime, hours);
        messages = [
          ...messages,
          {
            message:
              "Haloo, unakumbushwa kutumia " +
              dosePerIntake +
              " cha " +
              this.data?.drug +
              " saa " +
              currentDate.toTimeString().substring(0, 5),
            dateTime: this.addHoursToTheDate(startingDateTime, hours),
          },
        ];
      }
    }
    return messages;
  }

  addHoursToTheDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
