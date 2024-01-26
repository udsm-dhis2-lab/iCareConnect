// Import the necessary modules and services
import { Component } from '@angular/core';
import { NotificationService } from './path-to-your-notification-service/notification.service';

@Component({
  selector: 'app-your-component',
  template: `
    <!-- Your component's template -->
    <button (click)="sendNotificationToDoctor()">Send Notification</button>
  `,
})
export class YourComponent {
  constructor(private notificationService: NotificationService) {}

  sendNotificationToDoctor(): void {
    this.notificationService.sendPharmacistToDoctorNotification('Message from pharmacist to doctor.');
  }
}
