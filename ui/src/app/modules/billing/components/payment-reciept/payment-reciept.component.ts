import { Observable } from 'rxjs';
import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { each } from "lodash";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/reducers';

@Component({
  selector: "app-payment-reciept",
  templateUrl: "./payment-reciept.component.html",
  styleUrls: ["./payment-reciept.component.scss"],
})
export class PaymentReceiptComponent implements OnInit {
  totalBill: number = 0;
  facilityDetailsJson: any;
  facilityLogoBase64: string;
  currentUser: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<PaymentReceiptComponent>,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.facilityDetailsJson = this.data?.facilityDetails
      ? this.data?.facilityDetails
      : null;

    this.facilityLogoBase64 =
      this.data?.logo?.results?.length > 0
        ? this.data?.logo?.results[0]?.value
        : null;

    this.currentUser = this.store.select(getCurrentUserDetails).subscribe({
        next: (currentUser) => {
          return currentUser;
        },

        error: (error) => {
          throw error;
        }
      }
    );

    each(this.data?.billItems, (item) => {
      this.totalBill = this.totalBill + item?.amount;
    });
  }

  onCancel(e): void {
    e.stopPropagation();
    this.matDialogRef.close();
  }

  onPrint(e): void {

    var contents = document.getElementById("dialog-bill-receipt").innerHTML;
    const frame1: any = document.createElement("iframe");
    frame1.name = "frame3";
    frame1.style.position = "absolute";
    frame1.style.width = "100%";
    frame1.style.top = "-1000000px";
    document.body.appendChild(frame1);
    var frameDoc = frame1.contentWindow
      ? frame1.contentWindow
      : frame1.contentDocument.document
      ? frame1.contentDocument.document
      : frame1.contentDocument;
    frameDoc.document.open();

    frameDoc.document.write(`
      <html>
        <head> 
          <style> 
              @page { size: auto;  margin: 0mm; }
              
              body {
                padding: 30px;
              }
              #top .logo img{
                //float: left;
                height: 100px;
                width: 100px;
                background-size: 100px 100px;
              }
              #table {
                font-family: Arial, Helvetica, sans-serif;
                border-collapse: collapse;
                width: 100%;
                background-color: #000;
              } 
              #table td, #table  th {
                border: 1px solid #ddd;
                padding: 5px;
              } 
              
              #table tbody tr:nth-child(even){
                background-color: #f2f2f2;
              } 

              #table thead tr th { 
                padding-top: 12px; 
                padding-bottom: 12px; 
                text-align: left; 
                // background-color: #2a8fd1; 
                background-color: #000; 
                color: #fff;
              }
              thead tr {
                background: #000;
                color: #fff;
              }
              .footer {
                position: fixed;
                bottom: 0;
                display: flex;
              }
              .footer .userDetails {
                float: right;
                margin-right: 30vw;
              }
          </style>
        </head>
        <body>`);

    // Change image from base64 then replace some text with empty string to get an image
    let image = "";

    this.facilityDetailsJson.attributes.map((attribute) => {
      let attributeTypeName =
        attribute && attribute.attributeType
          ? attribute?.attributeType?.name.toLowerCase()
          : "";
      if (attributeTypeName === "logo") {
        image = attribute?.value;
      }
    });

    frameDoc.document.write(`
        
          <center id="top">
            <div class="logo">
              <img src="${image}" alt="Facility's Logo"> 
            </div>
            

            <div class="info">
              <h2>${this.facilityDetailsJson.display}</h2>
              <h4>P.O Box ${this.facilityDetailsJson.postalCode} ${
      this.facilityDetailsJson.stateProvince
    }</h4>
              <h4>${this.facilityDetailsJson.country}</h4>
            </div>
            <!--End Info-->
          </center>
          <!--End Document top-->
          
          
          <div id="mid">
            <div class="info">
              <p> 
                  Patient MRN : ${
                    this.data?.currentPatient?.MRN ||
                    this.data?.currentPatient?.patient?.identifiers[0]
                      ?.identifier
                  }</br>
              </p>
              <p> 
                  Patient Name : ${this.data?.currentPatient?.name}</br>
              </p>
            </div>
          </div>`);

    frameDoc.document.write(contents);

    frameDoc.document.write(`
        <div class="footer">
        <div class="userDetails">
          <p>Printed By: ${e.CurrentUser?.person?.display}</p>
          <p>Signature : .........................................................</p>
        </div>

        <div class=""printDate>
          <p>Printed on: ${e.PrintingDate}</p>
        </div>
      </div>

        </body>
      </html>`);

    frameDoc.document.close();
    setTimeout(function () {
      window.frames["frame3"].focus();
      window.frames["frame3"].print();
      document.body.removeChild(frame1);
    }, 500);

    this.matDialogRef.close();
  }
}
