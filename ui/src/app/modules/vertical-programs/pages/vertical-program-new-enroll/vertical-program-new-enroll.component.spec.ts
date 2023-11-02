import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalProgramNewEnrollComponent } from './vertical-program-new-enroll.component';

describe('VerticalProgramNewEnrollComponent', () => {
  let component: VerticalProgramNewEnrollComponent;
  let fixture: ComponentFixture<VerticalProgramNewEnrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerticalProgramNewEnrollComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalProgramNewEnrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
