import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-pharmacist-notification',
  template: `
    <div *ngIf="newPrescription">
      <div class="dashboard-banner">
        <span class="patient-name">{{ newPrescription.patientName }}</span>
        <span class="notification-message">{{ 'New prescription available' }}</span>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-banner {
      background-color: #2196f3;
      color: #ffffff;
      padding: 15px;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      animation: fade-in 0.5s ease-in-out;
    }

    .patient-name {
      margin-right: 10px;
    }
  `],
})
export class PharmacistNotificationComponent implements OnInit, OnDestroy {
  newPrescription: { patientName: string } | null = null;
  private subscription: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Subscribe to the new prescription observable
    this.subscription = this.notificationService.newPrescription$.subscribe(
      (prescription) => {
        // Display the new prescription in the dashboard banner
        this.newPrescription = prescription;
        // Hide the banner after a delay (e.g., 5 seconds)
        setTimeout(() => {
          this.newPrescription = null;
        }, 5000);
      }
    );
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    this.subscription.unsubscribe();
  }
}
