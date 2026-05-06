import {
  Component,
  ViewChild,
  OnInit,
  Input,
  Output,
  EventEmitter,
  input,
  ElementRef,
} from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatSelect, MatSelectChange } from "@angular/material/select";

import { ReplaySubject, Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";

interface Bank {
  id: string;
  name: string;
}

@Component({
  selector: "app-multiple-results-entry",
  templateUrl: "./multiple-results-entry.component.html",
  styleUrls: ["./multiple-results-entry.component.scss"],
})
export class MultipleResultsEntryComponent implements OnInit {
  version = null;
  @Input() options: any[];
  @Input() value: any;
  @Input() label: string = "";
  @Input() loading: boolean = false;

  @Output() selectedList: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() loadMore: EventEmitter<void> = new EventEmitter<void>();

  multipleSelectionFormControl: UntypedFormControl = new UntypedFormControl();
  list: any[];

  /** control for the selected item */
  public listCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword */
  public listFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the selected item for multi-selection */
  public listMultiCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword multi-selection */
  public listMultiFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of items filtered by search keyword */
  public filteredList: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);

  /** list of items filtered by search keyword for multi-selection */
  public filteredMultiList: ReplaySubject<any> = new ReplaySubject<any>(1);

  @ViewChild("singleSelect") singleSelect: MatSelect;
  @ViewChild("multiSelect", { static: false }) multiSelect: MatSelect;
  @ViewChild("panel", { static: false }) panel: ElementRef;

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();
  private scrollListener: (() => void) | null = null;

  ngOnInit() {
    // this.selectedList.emit(this.value);
    this.setList(this.options);
  }

  setList(list: any[]) {
    this.list = list;
    const defaultValues =
      this.list?.filter(
        (item) =>
          (this.value?.filter((val) => val === (item?.value || item?.id)) || [])
            ?.length > 0
      ) || [];
    // set default selection
    this.listMultiCtrl.setValue(defaultValues);
    this.selectedList.emit(this.listMultiCtrl.value);

    // load the initial list
    this.filteredList.next(this.list.slice());
    this.filteredMultiList.next(this.list.slice());

    // listen for search field value changes
    this.listFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterList();
      });
    this.listMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListMulti();
      });
  }

  ngAfterViewInit() {
    // this.setInitialValue();
    if (this.multiSelect) {
      this.multiSelect.openedChange.pipe(takeUntil(this._onDestroy)).subscribe(
        (opened) => {
          if (opened) {
            setTimeout(() => this.attachScrollListener(), 100);
          } else {
            this.detachScrollListener();
          }
        }
      );
    }
  }

  private attachScrollListener() {
    if (this.scrollListener) return;

    const panel = document.querySelector('.mat-select-panel');
    if (!panel) return;

    this.scrollListener = () => {
      const element = panel as HTMLElement;
      const scrollThreshold = 100;
      
      if (
        element.scrollTop + element.clientHeight >= 
        element.scrollHeight - scrollThreshold &&
        !this.loading
      ) {
        this.loadMore.emit();
      }
    };

    panel.addEventListener('scroll', this.scrollListener);
  }

  private detachScrollListener() {
    const panel = document.querySelector('.mat-select-panel');
    if (panel && this.scrollListener) {
      panel.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
  }

  getSelectedValues(event: MatSelectChange): void {
    this.selectedList.emit(this.listMultiCtrl.value);
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredList are loaded initially
   */
  private setInitialValue() {
    this.filteredList
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.singleSelect.compareWith = (a: any, b: any) => a?.key === b?.key;
      });
  }

  private filterList() {
    if (!this.list) {
      return;
    }
    // get the search keyword
    let search = this.listFilterCtrl.value;
    if (!search) {
      this.filteredList.next(this.list.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the list
    this.filteredList.next(
      this.list.filter((item) => item?.name.toLowerCase().indexOf(search) > -1)
    );
  }

  private filterListMulti() {
    if (!this.list) {
      return;
    }
    // get the search keyword
    let search = this.listMultiFilterCtrl.value;
    if (!search) {
      this.filteredMultiList.next(this.list.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredMultiList.next(
      this.list.filter((item) => item?.name.toLowerCase().indexOf(search) > -1)
    );
  }
}
