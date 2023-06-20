import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumeStockItemComponent } from './consume-stock-item.component';

describe('ConsumeStockItemComponent', () => {
  let component: ConsumeStockItemComponent;
  let fixture: ComponentFixture<ConsumeStockItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumeStockItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumeStockItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
