import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleValueItemComponent } from './single-value-item.component';

describe('SingleValueItemComponent', () => {
  let component: SingleValueItemComponent;
  let fixture: ComponentFixture<SingleValueItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleValueItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleValueItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
