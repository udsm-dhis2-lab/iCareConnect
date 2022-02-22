import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { ItemPriceService } from "../../services/item-price.service";

@Component({
  selector: "app-maintenance-side-menu",
  templateUrl: "./maintenance-side-menu.component.html",
  styleUrls: ["./maintenance-side-menu.component.scss"],
})
export class MaintenanceSideMenuComponent implements OnInit {
  @Input() pages: any[];
  currentMenu: any;
  @ViewChild("sidenav") sidenav: MatSidenav;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;
  currentMenuDepartments$: Observable<any[]>;
  constructor(
    private itemPriceService: ItemPriceService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.currentMenu = this.pages[0];
    this.getDepartmentsForTheCurrentMenu(this.currentMenu);
  }

  getDepartmentsForTheCurrentMenu(currentMenu: any): void {
    if (currentMenu?.searchCode) {
      this.currentMenuDepartments$ =
        this.itemPriceService.getDepartmentsByMappingSearchQuery(
          currentMenu?.searchCode
        );
    } else {
      this.currentMenuDepartments$ = of(null);
    }
  }

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  setCurrentMenu(event: Event, menu: any): void {
    event.stopPropagation();
    console.log(menu);
    this.currentMenu = this.currentMenu?.id === menu?.id ? null : menu;
  }

  navigateToThis(event: Event, id: string, department: any): void {
    event.stopPropagation();
    // console.log(department);
    // console.log(id);
    this.store.dispatch(
      go({
        path: ["maintenance/" + id + "/" + department?.uuid],
      })
    );
  }
}
