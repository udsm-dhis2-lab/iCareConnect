
import { Injectable, EventEmitter, Component, OnInit} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
class NavigationService {
  public navigateToNextPart = new EventEmitter<any>();

  constructor() {}
  public navigateToNext(part: string) {
    this.navigateToNextPart.emit(part);
  }
}

export class NavigationComponent {
  constructor(private navigationService: NavigationService) {}

  getSelectedPatient(event, patientVisitDetails) {
    event.stopPropagation();
    this.navigationService.navigateToNext('next-part');
  }
}


export class PatienResultComponent implements OnInit {
  constructor(private navigationService: NavigationService) {}

  ngOnInit() {
    this.navigationService.navigateToNextPart.subscribe((part: string) => {
      //console.log(`Navigating to ${part}`);
    });
  }
}

