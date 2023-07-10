import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LaboratoryRoutingModule } from "./laboratory-routing.module";
import { labPages } from "./pages";
import { SharedModule } from "src/app/shared/shared.module";
import { EffectsModule } from "@ngrx/effects";
import { labEffects } from "./store/effects";
import { labReducers } from "./store/reducers";
import { LaboratoryComponent } from "./laboratory.component";
import { GroupParametersByHeadersPipe } from "./pipes/group-parameters-by-headers.pipe";
import { IdentifyParametersWithoutHeadersPipe } from "./pipes/identify-parameters-without-headers.pipe";

@NgModule({
  declarations: [...labPages, LaboratoryComponent],
  exports: [],
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
