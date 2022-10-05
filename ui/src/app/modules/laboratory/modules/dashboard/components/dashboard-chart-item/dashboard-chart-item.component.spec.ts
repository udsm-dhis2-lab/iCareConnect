import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChartItemComponent } from './dashboard-chart-item.component';

describe('DashboardChartItemComponent', () => {
  let component: DashboardChartItemComponent;
  let fixture: ComponentFixture<DashboardChartItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardChartItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardChartItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
