import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core";
//Import services to app.module.ts
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { NoCacheInterceptor } from "./non_cache.inteceptor";
import { browser } from "protractor";
export const config: any = {
  sizeUnit: "Octet",
};

@NgModule({
  declarations: [AppComponent],
//use services imported
  imports: [
    BrowserModule, HttpClientModule,
    CoreModule.forRoot({
      namespace: "icare",
      version: 1,
      models: {
        prescriptions: "id",
      },
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass:NoCacheInterceptor, 
      multi:true,
    },
  ],

  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
