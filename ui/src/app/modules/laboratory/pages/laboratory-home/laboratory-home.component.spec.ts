import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryHomeComponent } from './laboratory-home.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/store/reducers';
import { storeDataMock } from 'src/test-mocks/store-data.mock';

describe('LaboratoryHomeComponent', () => {
  let component: LaboratoryHomeComponent;
  let fixture: ComponentFixture<LaboratoryHomeComponent>;

  let store: MockStore<AppState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LaboratoryHomeComponent],
      providers: [provideMockStore(storeDataMock)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaboratoryHomeComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
