import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FingerCaptureComponent } from '../finger-capture/finger-capture.component';

@Component({
  selector: 'app-finger-dialog',
  templateUrl: './finger-dialog.component.html',
  styleUrl: './finger-dialog.component.scss'
})
export class FingerDialogComponent {

  constructor(private dialog:MatDialog) { }

  addFinger(){

   

    // this.dialog.open(FingerCaptureComponent,
    //   {
    //     width:'40%' ,
    //   }
    // );

  }
}


