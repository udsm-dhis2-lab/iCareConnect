import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';

@Component({
  selector: "app-print-button",
  templateUrl: "./print-button.component.html",
  styleUrls: ["./print-button.component.scss"],
})
export class PrintButtonComponent implements OnInit {
  classes: string = "";

  @Input() showText: string;
  @Input() toolTipText: string;
  @Input() iconName: string;
  @Input() classesList: string[];
  @Input() ElementToBePrinted: any;

  @Output() print = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    this.classesList.forEach((className) => (this.classes += ` ${className}`));
  }

  onPrint() {
    this.print.emit(this.ElementToBePrinted)
  }
}
