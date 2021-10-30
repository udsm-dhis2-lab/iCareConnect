import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OpenmrsHttpClientService } from '../../modules/openmrs-http-client/services/openmrs-http-client.service';

@Component({
  selector: 'app-confirm-saving-order-observation-modal',
  templateUrl: './confirm-saving-order-observation-modal.component.html',
  styleUrls: ['./confirm-saving-order-observation-modal.component.scss'],
})
export class ConfirmSavingOrderObservationModalComponent implements OnInit {
  dialogData: any;
  matchedEncounter: any;
  savingData: boolean = false;
  constructor(
    private httpClient: OpenmrsHttpClientService,
    private dialogRef: MatDialogRef<ConfirmSavingOrderObservationModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.matchedEncounter = (this.dialogData?.encounters.filter(
      (encounter) =>
        encounter?.orders?.length > 0 &&
        (
          encounter.orders.filter(
            (order) =>
              order?.orderNumber === this.dialogData?.order?.orderNumber
          ) || []
        )?.length > 0
    ) || [])[0];
  }

  onConfirm(event: Event, data): void {
    event.stopPropagation();
    this.savingData = true;
    const encounterData = {
      uuid: this.matchedEncounter?.uuid,
      obs: [
        {
          concept: data?.order?.concept?.uuid,
          value: data?.value,
          comment: data?.comments,
        },
      ],
    };

    this.httpClient
      .post(`encounter/${encounterData?.uuid}`, encounterData)
      .subscribe((response) => {
        if (response) {
          setTimeout(() => {
            this.savingData = false;
            setTimeout(() => {
              this.dialogRef.close();
            }, 500);
          }, 200);
        }
      });
  }
}
