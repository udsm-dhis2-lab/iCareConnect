import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePaymentCategoryComponent } from './update-payment-category.component';

describe('UpdatePaymentCategoryComponent', () => {
  let component: UpdatePaymentCategoryComponent;
  let fixture: ComponentFixture<UpdatePaymentCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatePaymentCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePaymentCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
