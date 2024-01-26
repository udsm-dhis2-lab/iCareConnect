// notification.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  show(notification: Notification): void {
    this.snackBar.open(
      notification?.message,
      notification?.action,
      {
        duration: notification?.displayDuration,
        horizontalPosition: notification?.horizontalPosition,
        verticalPosition: notification?.verticalPosition,
      }
    );
  }

  sendPharmacistToDoctorNotification(message: string): void {
    const notification: Notification = {
      type: 'PHARMACIST_TO_DOCTOR',
      message: message,
      autoClose: true, // Customize as needed
      duration: 5000, // Customize as needed
      action: 'View', // Customize as needed
      horizontalPosition: 'right', // Customize as needed
      verticalPosition: 'top', // Customize as needed
    };

    this.show(notification);
  }
}
