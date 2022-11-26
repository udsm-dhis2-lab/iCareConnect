import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleRejectionReasonComponent } from './sample-rejection-reason.component';
import {
  matDialogProviderMock,
  matDialogRefMock,
  matDialogDataMock
} from 'src/test-mocks/material.mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatLegacyTextareaAutosize as MatTextareaAutosize } from '@angular/material/legacy-input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

describe('SampleRejectionReasonComponent', () => {
  let component: SampleRejectionReasonComponent;
  let fixture: ComponentFixture<SampleRejectionReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [
        SampleRejectionReasonComponent,
        MatTextareaAutosize,
        CdkTextareaAutosize
      ],
      providers: [matDialogProviderMock, matDialogRefMock, matDialogDataMock]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleRejectionReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
