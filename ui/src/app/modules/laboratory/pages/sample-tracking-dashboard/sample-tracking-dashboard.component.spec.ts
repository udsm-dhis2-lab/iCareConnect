import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleTrackingDashboardComponent } from './sample-tracking-dashboard.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { storeDataMock } from 'src/test-mocks/store-data.mock';
import { AppState } from 'src/app/store/reducers';

describe('SampleTrackingDashboardComponent', () => {
  let component: SampleTrackingDashboardComponent;
  let fixture: ComponentFixture<SampleTrackingDashboardComponent>;
  let store: MockStore<AppState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SampleTrackingDashboardComponent],
      providers: [provideMockStore(storeDataMock)]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleTrackingDashboardComponent);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
