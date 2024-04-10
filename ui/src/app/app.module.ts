import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core";
import { BrowserModule } from "@angular/platform-browser";
import { Angulartics2Module } from "angulartics2";

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
    Angulartics2Module.forRoot({ developerMode: false }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
