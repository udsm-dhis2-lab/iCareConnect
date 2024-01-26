import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-shared-patient-dashboard",
    template: `
    <button
      *ngIf="!isInpatient"
      class="mr-2"
      (click)="onToggleVitalsSummary($event)"
      [ngStyle]="getVitalsButtonStyles()"
      mat-stroked-button
    >
      View Vital
    </button>
  `,
    styleUrls: ["./shared-patient-dashboard.component.scss"],
})
export class SharedPatientDashboardComponentAdded implements OnInit {
    countOfVitalsElementsFilled: any;
    showVitalsSummary: boolean;
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
    // ... (existing properties and methods)

    // Add the getVitalsButtonStyles method here
    getVitalsButtonStyles(): { [key: string]: string } {
        const countOfVitalsFilled = this.countOfVitalsElementsFilled;

        if (countOfVitalsFilled === 0) {
            return {
                'background-color': '#F00',
                color: '#FFF'
                
            };
        } else if (1 == 1) {
            // Add more conditions as needed
            return {
                'background-color': '#008000',
                color: '/* Your text color for this condition */'
            };
        } else if (1 == 1) {
            // Add more conditions as needed
            return {
                'background-color': '#FFFF00',
                color: '/* Your text color for this condition */'
            };
        }
        else if (1 == 1) {
            // Add more conditions as needed
            return {
                'background-color': '#F00',
                color: '/* Your text color for this condition */'
            };
        }
        else {
            // Default styles when none of the conditions are met
            return {
                'background-color': '#F00',
                color: '#222'
            };
        }
    }

    // ... (existing ngOnInit and other methods)

    onToggleVitalsSummary(event: Event): void {
        event.stopPropagation();
        this.showVitalsSummary = !this.showVitalsSummary;
    }
}