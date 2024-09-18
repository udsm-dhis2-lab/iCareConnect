import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core";
import { BrowserModule } from "@angular/platform-browser";
import { GoogleAnalyticsService } from "./google-analytics.service";
import { CommonModule } from "@angular/common";
import { FormModule } from "./shared/modules/form/form.module";
export const config: any = {
  sizeUnit: "Octet",
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    CoreModule.forRoot({
      namespace: "icare",
      version: 1,
      models: {
        prescriptions: "id",
      },
    }),
    BrowserModule
  ],
  providers: [
    GoogleAnalyticsService,
    { provide: 'window', useValue: window }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
