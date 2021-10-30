import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  selectedTab = new FormControl(0);
  constructor(private router: Router) {}

  ngOnInit(): void {}

  changeRoute(e, val, path) {
    e.stopPropagation();
    this.selectedTab.setValue(val);
  }

  onChangeRoute(e) {
    // console.log(e);
    if (e.index == 0) {
      this.router.navigate(['/laboratory/settings/tests-control']);
    } else if (e.index == 1) {
      this.router.navigate(['/laboratory/settings/tests-settings']);
    } else if (e.index == 2) {
      this.router.navigate(['/laboratory/settings/lab-configurations']);
    }
  }
}
