/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DiscountsComponent } from "./discounts.component";

describe('DiscountsComponent', () => {
  let component: DiscountsComponent;
  let fixture: ComponentFixture<DiscountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DiscountsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
