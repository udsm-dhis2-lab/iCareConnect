import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-login-help',
  templateUrl: './login-help.component.html',
  styleUrls: ['./login-help.component.scss']
})
export class LoginHelpComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<LoginHelpComponent>) {}

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
  }
}
