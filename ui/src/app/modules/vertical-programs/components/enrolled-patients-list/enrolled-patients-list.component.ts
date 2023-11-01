import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ProgramsService } from "../../services/programs.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-enrolled-patients-list",
  templateUrl: "./enrolled-patients-list.component.html",
  styleUrls: ["./enrolled-patients-list.component.scss"],
})
export class EnrolledPatientsListComponent implements OnInit {
  @Input() isTabularList: boolean;
  @Input() currentLocation: any;
  @Output() selectedPatient: EventEmitter<any> = new EventEmitter<any>();
  enrolledPatients$: Observable<any>;
  constructor(private programsService: ProgramsService) {}

  ngOnInit(): void {
    this.enrolledPatients$ = this.programsService.getPatientsWithEnrollments();
  }
}
