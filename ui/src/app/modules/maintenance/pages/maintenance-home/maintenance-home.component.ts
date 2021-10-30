import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-maintenance-home',
  templateUrl: './maintenance-home.component.html',
  styleUrls: ['./maintenance-home.component.scss'],
})
export class MaintenanceHomeComponent implements OnInit {
  pages: any[];
  constructor() {}

  ngOnInit(): void {
    this.pages = [
      { id: 'price-list', name: 'Price List' },
      { id: 'users', name: 'User Management' },
      { id: 'location', name: 'Location Management' },
    ];
  }
}
