import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LaboratoryRoutingModule } from "./laboratory-routing.module";
import { labPages } from "./pages";
import { SharedModule } from "src/app/shared/shared.module";
import { labComponents } from "./components";
import { EffectsModule } from "@ngrx/effects";
import { labEffects } from "./store/effects";
import { labReducers } from "./store/reducers";
import { LaboratoryComponent } from "./laboratory.component";

@NgModule({
  declarations: [...labPages, ...labComponents, LaboratoryComponent],
  imports: [
    CommonModule,
    LaboratoryRoutingModule,
    SharedModule,
    ...labReducers,
    EffectsModule.forFeature(labEffects),
  ],
  bootstrap: [LaboratoryComponent],
})
export class LaboratoryModule {}
