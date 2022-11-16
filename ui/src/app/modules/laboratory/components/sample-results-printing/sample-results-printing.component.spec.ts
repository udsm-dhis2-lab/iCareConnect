import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleResultsPrintingComponent } from './sample-results-printing.component';

describe('SampleResultsPrintingComponent', () => {
  let component: SampleResultsPrintingComponent;
  let fixture: ComponentFixture<SampleResultsPrintingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SampleResultsPrintingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleResultsPrintingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
