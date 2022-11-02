import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleValueContainerComponent } from './single-value-container.component';

describe('SingleValueContainerComponent', () => {
  let component: SingleValueContainerComponent;
  let fixture: ComponentFixture<SingleValueContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleValueContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleValueContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
