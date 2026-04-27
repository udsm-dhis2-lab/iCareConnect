import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleManagementComponent } from './sample-management.component';

describe('SampleManagementComponent', () => {
  let component: SampleManagementComponent;
  let fixture: ComponentFixture<SampleManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SampleManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
