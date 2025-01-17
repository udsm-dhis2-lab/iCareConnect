// import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
// import { Store } from "@ngrx/store";
// import { Observable } from "rxjs";
// import { AppState } from "src/app/store/reducers";
// import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";

// @Component({
//   selector: "app-print-button",
//   templateUrl: "./print-button.component.html",
//   styleUrls: ["./print-button.component.scss"],
// })
// export class PrintButtonComponent implements OnInit {
//   classes: string = "";

//   @Input() showText: string;
//   @Input() toolTipText: string;
//   @Input() iconName: string;
//   @Input() classesList: string[];
//   @Input() ElementToBePrinted: any;
//   @Input() serviceRecords: any[]; //service record added to be printed


//   @Output() print = new EventEmitter();
//   currentUser: any;
//   todaysDate: string;

//   constructor(private store: Store<AppState>) {}

//   ngOnInit(): void {
//     this.classesList.forEach((className) => (this.classes += ` ${className}`));

//     this.store.select(getCurrentUserDetails).subscribe({
//       next: (currentUser) => {
//         this.currentUser = currentUser;
//       },

//       error: (error) => {
//         throw error;
//       },
//     });
//     //Construct printing date string
//     let today = new Date();
//     let year = today.getFullYear();
//     let month =
//       today.getMonth().toString().length > 1
//         ? today.getMonth() + 1
//         : `0${today.getMonth() + 1}`;
//     let day =
//       today.getDate().toString().length > 1
//         ? today.getDate()
//         : `0${today.getDate()}`;
//     let hour = today.getHours();
//     let minutes = today.getMinutes();
//     this.todaysDate = `${day}/${month}/${year} ${hour}:${minutes}`;
//   }

//   onPrint() {
//     if (this.ElementToBePrinted) {
//       this.ElementToBePrinted["CurrentUser"] = this.currentUser;
//       this.ElementToBePrinted["PrintingDate"] = this.todaysDate;
//       this.ElementToBePrinted["ServiceRecords"] = this.serviceRecords; //service records to be printed
//     } else {
//       this.ElementToBePrinted = {
//         CurrentUser: this.currentUser,
//         PrintingDate: this.todaysDate,
//       };
//     }
//     //console.log("the elemets ", this.ElementToBePrinted);
//     this.print.emit(this.ElementToBePrinted);
//   }
// }


import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";

// Define a type for service records (optional)
interface ServiceRecord {
  id: string;
  description: string;
  // Other properties for service records
}

interface ElementToPrint {
  CurrentUser: any;
  PrintingDate: string;
  ServiceRecords?: ServiceRecord[]; // Optional service records field
}

@Component({
  selector: "app-print-button",
  templateUrl: "./print-button.component.html",
  styleUrls: ["./print-button.component.scss"],
})
export class PrintButtonComponent implements OnInit {
  classes: string = "";

  @Input() showText: string = '';
  @Input() toolTipText: string = '';
  @Input() iconName: string = '';
  @Input() classesList: string[] = [];
  @Input() ElementToBePrinted: ElementToPrint | null = null;
  @Input() serviceRecords: ServiceRecord[] = []; // Declare serviceRecords as input

  @Output() print = new EventEmitter<ElementToPrint>();
  currentUser: any;
  todaysDate: string = '';

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // Initialize classes if classesList is provided
    if (this.classesList?.length) {
      this.classesList.forEach((className) => (this.classes += ` ${className}`));
    }

    this.store.select(getCurrentUserDetails).subscribe({
      next: (currentUser) => {
        this.currentUser = currentUser;
      },
      error: (error) => {
        throw error;
      },
    });

    // Construct printing date string
    let today = new Date();
    let year = today.getFullYear();
    let month =
      today.getMonth().toString().length > 1
        ? today.getMonth() + 1
        : `0${today.getMonth() + 1}`;
    let day =
      today.getDate().toString().length > 1
        ? today.getDate()
        : `0${today.getDate()}`;
    let hour = today.getHours();
    let minutes = today.getMinutes();
    this.todaysDate = `${day}/${month}/${year} ${hour}:${minutes}`;
  }

  onPrint() {
    // Ensure ElementToBePrinted is not null and add default values
    if (this.ElementToBePrinted) {
      this.ElementToBePrinted["CurrentUser"] = this.currentUser;
      this.ElementToBePrinted["PrintingDate"] = this.todaysDate;
      this.ElementToBePrinted["ServiceRecords"] = this.serviceRecords.length
        ? this.serviceRecords
        : []; // Default to empty array if no service records
    } else {
      this.ElementToBePrinted = {
        CurrentUser: this.currentUser,
        PrintingDate: this.todaysDate,
      };
    }
    // Emit the data to be printed
    this.print.emit(this.ElementToBePrinted);
  }
}

