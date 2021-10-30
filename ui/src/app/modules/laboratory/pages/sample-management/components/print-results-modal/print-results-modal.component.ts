import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isThisSecond } from 'date-fns';

// import { jsPDF } from 'jspdf';

import * as _ from 'lodash';
import { sample } from 'rxjs/operators';

@Component({
  selector: 'app-print-results-modal',
  templateUrl: './print-results-modal.component.html',
  styleUrls: ['./print-results-modal.component.scss'],
})
export class PrintResultsModalComponent implements OnInit {
  samples: any;
  patient: any;
  labConfigs: any;
  currentDateTime: Date;
  samplesByDepartments: any[];
  currentDepartmentSamples: any[];

  constructor(
    private dialogRef: MatDialogRef<PrintResultsModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.samples = data;
    this.patient = data?.samples[0]?.patient_names;
    this.labConfigs = data?.labConfigs;
  }

  ngOnInit(): void {
    this.currentDateTime = new Date();

    // console.log('heree', this.samples);
    // console.log('ungrouped samples :: ', this.samples?.samples);

    const groupedSamples = _.groupBy(this.samples?.samples, 'departmentName');

    // console.log('grouped samples :: ', groupedSamples);

    this.samplesByDepartments = _.map(Object.keys(groupedSamples), (key) => {
      return {
        department: key,
        samples: _.uniqBy(
          _.map(groupedSamples[key], (groupedSample) => {
            return {
              ...groupedSample,
              orders: _.map(groupedSample?.orders, (groupedSampleOrder) => {
                return {
                  ...groupedSampleOrder,
                  allocations: _.map(
                    groupedSampleOrder?.allocations,
                    (sampleOrderAllocation) => {
                      return {
                        ...sampleOrderAllocation,
                        results: _.map(
                          sampleOrderAllocation?.results,
                          (orderAllocationResult) => {
                            let remarksArr = _.filter(
                              sampleOrderAllocation?.statuses,
                              (status) => {
                                return status?.status == 'ANSWER DESCRIPTION'
                                  ? true
                                  : false;
                              }
                            );

                            return {
                              ...orderAllocationResult,
                              remark:
                                remarksArr.length > 0
                                  ? remarksArr[0]['remarks']
                                  : '',
                              value:
                                groupedSampleOrder?.concept?.datatype
                                  ?.display == 'Coded'
                                  ? _.filter(
                                      groupedSampleOrder?.concept?.answers,
                                      (answer) => {
                                        return answer?.uuid ==
                                          orderAllocationResult?.value
                                          ? true
                                          : false;
                                      }
                                    )[0]?.display
                                  : orderAllocationResult?.value,
                            };
                          }
                        ),
                      };
                    }
                  ),
                };
              }),
            };
          }),
          'sampleIdentifier'
        ),
      };
    });

    // console.log('mapped samples by depts :: ', this.samplesByDepartments);
    this.currentDepartmentSamples = this.samplesByDepartments[0];

    // console.log('samplesByDepartments', this.samplesByDepartments);
  }

  setPanel(e, samplesGroupedByDepartment) {
    e.stopPropagation();
    this.currentDepartmentSamples = samplesGroupedByDepartment;
  }

  onPrint(e, samplesGroupedByDepartment): void {
    e.stopPropagation();

    // const doc = new jsPDF();
    // doc.text('MRN: ' + this.samples['samples'][0]['mrNo'], 20, 20);
    // _.each(this.samples['samples'], (sample) => {
    //   _.ech(sample?.orders, (order, index) => {
    //     doc.text(order?.orderNumber, 40, 40);
    //     doc.text(order?.concept?.display, 40, 40);
    //     doc.text(order?.result, 40, 40);
    //     doc.text(order?.remarks, 40, 40);
    //   });
    // });
    // doc.save('results_for' + this.samples['samples'][0]['mrNo'] + '.pdf');

    var contents = document.getElementById(
      samplesGroupedByDepartment?.department
    ).innerHTML;
    const frame1: any = document.createElement('iframe');
    frame1.name = 'frame3';
    frame1.style.position = 'absolute';
    frame1.style.width = '100%';
    frame1.style.top = '-1000000px';
    document.body.appendChild(frame1);
    var frameDoc = frame1.contentWindow
      ? frame1.contentWindow
      : frame1.contentDocument.document
      ? frame1.contentDocument.document
      : frame1.contentDocument;
    frameDoc.document.open();
    frameDoc.document.write(
      '<html><head> <style>button {display:none;}</style>'
    );
    frameDoc.document.write('</head><body>');
    frameDoc.document.write(contents);
    frameDoc.document.write('</body></html>');
    frameDoc.document.close();
    setTimeout(function () {
      window.frames['frame3'].focus();
      window.frames['frame3'].print();
      document.body.removeChild(frame1);
    }, 500);

    //window.print();
  }

  onClose(e) {
    e.stopPropagation();
    this.dialogRef.close();
  }

  getParameterConceptName(answers, conceptId) {
    const concept = _.filter(answers, (answer) => {
      return answer?.uuid == conceptId ? true : false;
    });

    //  console.log("the concept :: ",concept);

    return concept?.length > 0 ? concept[0]['display'] : '';
  }
}
