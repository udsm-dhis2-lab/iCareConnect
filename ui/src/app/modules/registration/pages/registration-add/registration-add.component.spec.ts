import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OpenmrsHttpClientService } from 'src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service';
import { RegistrationAddComponent } from './registration-add.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/store/reducers';
import { materialModules } from 'src/app/shared/material-modules';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RegistrationAddComponent', () => {
  let component: RegistrationAddComponent;
  let fixture: ComponentFixture<RegistrationAddComponent>;
  let store: MockStore<AppState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ...materialModules,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [RegistrationAddComponent],
      providers: [
        provideMockStore({
          initialState: { locations: { currentUserCurrentLocation: null } },
        }),
        { provide: OpenmrsHttpClientService, useValue: null },
      ],
    }).compileComponents();
  });
 ngOnInit() {
    if (this.editMode && this.hasPreviousVisit()) {
      this.disablePatientTypeSelection = true;
    } else {
      this.disablePatientTypeSelection = false;
    }
  }

  private hasPreviousVisit(): boolean {
    return this.params?.patients?.length > 0;
  }

  public getPatientType(value: string, occupationInfo: any): void {
    if (this.editMode && this.hasPreviousVisit()) {
      console.log('Cannot change patient type for an existing patient with previous visits.');
      this.patient['patientType'] = this.previousPatientType;
    } else {

      this.previousPatientType = this.patient['patientType'];
    }
  }
  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationAddComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
