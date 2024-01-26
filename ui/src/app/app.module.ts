import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core";
import { DoctorPatientDataComponent } from "./shared/components/doctor-patient-data/doctor-patient-data.component";
export const config: any = {
  sizeUnit: "Octet",
};

@NgModule({
  declarations: [AppComponent, DoctorPatientDataComponent],
  imports: [
    CoreModule.forRoot({
      namespace: "icare",
      version: 1,
      models: {
        prescriptions: "id",
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
