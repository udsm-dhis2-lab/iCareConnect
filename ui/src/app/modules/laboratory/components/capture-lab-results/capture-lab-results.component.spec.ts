import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureLabResultsComponent } from './capture-lab-results.component';

describe('CaptureLabResultsComponent', () => {
  let component: CaptureLabResultsComponent;
  let fixture: ComponentFixture<CaptureLabResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaptureLabResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptureLabResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
