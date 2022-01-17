import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-capture-signature",
  templateUrl: "./capture-signature.component.html",
  styleUrls: ["./capture-signature.component.scss"],
})
export class CaptureSignatureComponent implements OnInit {
  alreadySigned: boolean = false;
  isDrawing: boolean = false;
  sigPadElement;
  context;
  signatureImg: string;
  @ViewChild("sigPad") sigPad: ElementRef;
  updatingUser: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<CaptureSignatureComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!this.signatureImg) {
      this.sigPadElement = this.sigPad.nativeElement;
      this.context = this.sigPadElement.getContext("2d");
      this.context.strokeStyle = "#3742fa";
    }
  }

  onClose(event) {
    event.stopPropagation();
    this.dialogRef.close();
  }

  @HostListener("document:mouseup", ["$event"])
  onMouseUp(e) {
    this.isDrawing = false;
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const coords = this.relativeCoords(e);
    this.context.moveTo(coords.x, coords.y);
  }

  onMouseMove(e) {
    if (this.isDrawing) {
      const coords = this.relativeCoords(e);
      this.context.lineTo(coords.x, coords.y);
      this.context.stroke();
    }
  }

  private relativeCoords(event) {
    const bounds = event.target.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    return { x: x, y: y };
  }

  clearPad() {
    this.context.clearRect(
      0,
      0,
      this.sigPadElement.width,
      this.sigPadElement.height
    );
    this.context.beginPath();
  }
}
