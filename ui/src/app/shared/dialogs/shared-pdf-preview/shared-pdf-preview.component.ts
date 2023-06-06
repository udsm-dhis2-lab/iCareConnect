import { AfterViewInit, Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-shared-pdf-preview",
  templateUrl: "./shared-pdf-preview.component.html",
  styleUrls: ["./shared-pdf-preview.component.scss"],
})
export class SharedPdfPreviewComponent implements OnInit, AfterViewInit {
  constructor(
    private dialogRef: MatDialogRef<SharedPdfPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const previewImg = document.getElementById("previewedImage");
    previewImg.setAttribute("src", "data:application/pdf;base64," + this.data);
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }
}
