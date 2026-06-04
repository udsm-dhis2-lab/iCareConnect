import { ComponentFixture, TestBed,  } from '@angular/core/testing';

import { ReferredSamplesComponent } from './referred-samples.component';

describe('ReferredSamplesComponent', () => {
  let component: ReferredSamplesComponent;
  let fixture: ComponentFixture<ReferredSamplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferredSamplesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferredSamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
