import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "app-generic-dialog",
  templateUrl: "./generic-dialog.component.html",
  styleUrls: ["./generic-dialog.component.scss"],
})
export class GenericDialogComponent implements OnInit {
  constructor(
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      patient: any;
    }
  ) {}

  ngOnInit() {
  }
}
