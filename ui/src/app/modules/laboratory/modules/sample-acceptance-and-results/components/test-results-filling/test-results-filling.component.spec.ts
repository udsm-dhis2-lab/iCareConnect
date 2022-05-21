import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestResultsFillingComponent } from './test-results-filling.component';

describe('TestResultsFillingComponent', () => {
  let component: TestResultsFillingComponent;
  let fixture: ComponentFixture<TestResultsFillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestResultsFillingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestResultsFillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
