import {
  Component,
  ViewChild,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
} from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatSelect, MatSelectChange } from "@angular/material/select";

import { ReplaySubject, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";

@Component({
  selector: "app-multiple-results-entry",
  templateUrl: "./multiple-results-entry.component.html",
  styleUrls: ["./multiple-results-entry.component.scss"],
})
export class MultipleResultsEntryComponent implements OnInit, OnDestroy, OnChanges {
  @Input() options: any[];
  @Input() value: any[];
  @Input() label: string = "";
  @Input() loading: boolean = false;
  @Input() noEntriesFoundLabel: string = "";

  @Output() selectedList: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() loadMore: EventEmitter<void> = new EventEmitter<void>();
  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();

  list: any[];
  private previousSelectedValues: any[] = [];

  public listCtrl: UntypedFormControl = new UntypedFormControl();
  public listFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public listMultiCtrl: UntypedFormControl = new UntypedFormControl();
  public listMultiFilterCtrl: UntypedFormControl = new UntypedFormControl();

  public filteredList: ReplaySubject<any> = new ReplaySubject<any>(1);
  public filteredMultiList: ReplaySubject<any> = new ReplaySubject<any>(1);

  panelElement?: HTMLElement;

  @ViewChild("singleSelect") singleSelect: MatSelect;
  @ViewChild("multiSelect", { static: false }) multiSelect: MatSelect;

  private _onDestroy = new Subject<void>();
  private scrollListener: (() => void) | null = null;

  ngOnInit() {
    this.setupSearchSubscription();
    this.setList(this.options || []);
  }

  ngOnChanges(changes: any) {
    if (changes['options'] && !changes['options'].firstChange) {
      this.setList(this.options || []);
    }
    if (changes['value'] && !changes['value'].firstChange) {
      this.updateSelectionFromValue();
    }
  }

  private updateSelectionFromValue() {
    if (this.value && this.value.length > 0 && this.list) {
      const valueSet = new Set(this.value);
      const defaultValues = this.list.filter((item) => valueSet.has(item.value));
      if (defaultValues.length !== this.listMultiCtrl.value?.length) {
        this.listMultiCtrl.setValue(defaultValues);
        this.selectedList.emit(this.listMultiCtrl.value);
      }
    }
  }

  private setupSearchSubscription() {
    this.listMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy), debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm: string) => {
        this.searchChange.emit(searchTerm);
      });
  }

  setList(list: any[]) {
    this.list = list;
    
    if (this.previousSelectedValues && this.previousSelectedValues.length > 0) {
      const existingValues = new Set(this.previousSelectedValues);
      const stillValid = this.list.filter(
        (item) => existingValues.has(item.value || item)
      );
      if (stillValid.length > 0) {
        this.listMultiCtrl.setValue(stillValid);
      } else if (this.value && this.value.length > 0) {
        const valueSet = new Set(this.value);
        const defaultValues = this.list.filter((item) => valueSet.has(item.value));
        this.listMultiCtrl.setValue(defaultValues);
      }
    } else if (this.value && this.value.length > 0) {
      const valueSet = new Set(this.value);
      const defaultValues = this.list.filter((item) => valueSet.has(item.value));
      this.listMultiCtrl.setValue(defaultValues);
    }
    
    this.selectedList.emit(this.listMultiCtrl.value);
    this.filteredList.next(this.list.slice());
    this.filteredMultiList.next(this.list.slice());
  }

  ngAfterViewInit() {
    if (this.multiSelect) {
      this.multiSelect.openedChange.pipe(takeUntil(this._onDestroy)).subscribe(
        (opened) => {
          if (opened) {
            setTimeout(() => this.attachScrollListener(), 150);
          } else {
            this.detachScrollListener();
          }
        }
      );
    }
  }

  private attachScrollListener() {
    if (this.scrollListener) return;

    const panel = document.querySelector('.infinite-scroll-panel.mat-mdc-select-panel') as HTMLElement;
    if (!panel) return;

    this.panelElement = panel;

    this.scrollListener = () => {
      const threshold = 100;

      if (
        panel.scrollTop + panel.clientHeight >=
        panel.scrollHeight - threshold &&
        !this.loading
      ) {
        this.loadMore.emit();
      }
    };

    panel.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private detachScrollListener() {
    const panel = document.querySelector('.infinite-scroll-panel.mat-mdc-select-panel');
    if (panel && this.scrollListener) {
      panel.removeEventListener('scroll', this.scrollListener);
    }
    this.scrollListener = null;
    this.panelElement = null;
  }

  getSelectedValues(event: MatSelectChange): void {
    this.previousSelectedValues = this.listMultiCtrl.value?.map(v => v.value || v) || [];
    this.selectedList.emit(this.listMultiCtrl.value);
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
    this.detachScrollListener();
  }

  private filterListMulti() {
    if (!this.list) {
      return;
    }
    const search = this.listMultiFilterCtrl.value;
    if (!search) {
      this.filteredMultiList.next(this.list.slice());
      return;
    }
    const searchLower = search.toLowerCase();
    this.filteredMultiList.next(
      this.list.filter((item) => item?.name?.toLowerCase().includes(searchLower))
    );
  }
}