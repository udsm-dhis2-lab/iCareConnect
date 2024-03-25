import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from "src/app/shared/services/notification.service"; 

@Component({
  selector: 'app-nursing-notification',
  template: `
    <div *ngFor="let notification of notifications">
      {{ notification }}
    </div>
  `,
})
export class PharmacyNotificationComponent implements OnInit, OnDestroy {
  notifications: string[] = [];
  private subscription: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Subscribe to the notification observable
    this.subscription = this.notificationService.notification$.subscribe(
      (message) => {
        // Add the notification to the array
        this.notifications.push(message);
      }
    );
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    this.subscription.unsubscribe();
  }
}