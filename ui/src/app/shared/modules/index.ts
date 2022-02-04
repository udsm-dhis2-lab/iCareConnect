import { NgxBarcodeModule } from "ngx-barcode";
import { FormModule } from "./form/form.module";
import { NgxOpenmrsLocationTreeModule } from "./location-tree/location-tree.module";
import { NgxOpenmrsHttpclientServiceModule } from "./openmrs-http-client/ngx-openmrs-httpclient-service.module";
export const modules: any[] = [
  NgxOpenmrsHttpclientServiceModule,
  FormModule,
  NgxBarcodeModule,
  NgxOpenmrsLocationTreeModule,
];
