import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinCardComponent } from './bin-card.component';

describe('BinCardComponent', () => {
  let component: BinCardComponent;
  let fixture: ComponentFixture<BinCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BinCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
