import {
  Component,
  ViewChild,
  OnInit,
  Input,
  Output,
  EventEmitter,
  input,
  ElementRef,
  SimpleChanges,
} from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatSelect, MatSelectChange } from "@angular/material/select";

import { ReplaySubject, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, take, takeUntil } from "rxjs/operators";

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
  @Input() noEntriesFoundLabel: string = "";

  @Output() selectedList: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() loadMore: EventEmitter<void> = new EventEmitter<void>();
  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();

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
    this.setupSearchSubscription();
    this.setList(this.options || []);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && !changes['options'].firstChange) {
      this.setList(this.options || []);
    }
  }

  private setupSearchSubscription() {
    this.listMultiFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((searchTerm: string) => {
        
        this.searchChange.emit(searchTerm);
      });
  }


  setList(list: any[]) {
    this.list = list;
    const defaultValues =
      this.list?.filter(
        (item) =>
          (this.value?.filter((val) => val === (item?.value || item?.id)) || [])
            ?.length > 0
      ) || [];
    this.listMultiCtrl.setValue(defaultValues);
    this.selectedList.emit(this.listMultiCtrl.value);

    this.filteredList.next(this.list.slice());
    this.filteredMultiList.next(this.list.slice());

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

  private filterList() {
    if (!this.list) {
      return;
    }
    let search = this.listFilterCtrl.value;
    if (!search) {
      this.filteredList.next(this.list.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredList.next(
      this.list.filter((item) => item?.name.toLowerCase().indexOf(search) > -1)
    );
  }

  private filterListMulti() {
    if (!this.list) {
      return;
    }
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

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private setInitialValue() {
    this.filteredList
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.singleSelect.compareWith = (a: any, b: any) => a?.key === b?.key;
      });
  }
}
