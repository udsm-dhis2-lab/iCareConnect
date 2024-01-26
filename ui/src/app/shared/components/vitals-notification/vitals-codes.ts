// app-capture-data.component.ts

import { MatDialog } from '@angular/material/dialog';
import { VitalSavePopupComponent } from 'src/app/shared/services/VitalPopupComponent.service';
import { NotificationService } from "src/app/shared/services/notification.service";


export class AppCaptureDataComponent {
  // ... (existing component code)

  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  openSaveConfirmationPopup(): void {
    const dialogRef = this.dialog.open(VitalSavePopupComponent, {
      width: '400px', // Adjust the width according to your design
      data: { patientName: params?.patient?.name || 'Unknown Patient' },
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle the result if needed
    });

    // If you prefer to use NotificationService:
    this.notificationService.notify(
      `${params?.patient?.name || 'Unknown Patient'}'s vitals are in! ✅`
    );
  }

  // ... (existing component code)
}
