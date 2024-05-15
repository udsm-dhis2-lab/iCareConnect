import { NgModule, isDevMode } from "@angular/core";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core";
import { BrowserModule } from "@angular/platform-browser";
import { GoogleAnalyticsService } from "./google-analytics.service";
import { ServiceWorkerModule } from '@angular/service-worker';
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
    BrowserModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    GoogleAnalyticsService,
    { provide: 'window', useValue: window }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
