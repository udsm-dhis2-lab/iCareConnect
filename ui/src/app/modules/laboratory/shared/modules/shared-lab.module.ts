import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { materialModules } from "src/app/shared/material-modules";
import { labSharedComponents } from "../../components";
import { SharedModule } from "src/app/shared/shared.module";
import { sharedModals } from "../../modals";
@NgModule({
  imports: [CommonModule, ...materialModules, SharedModule],
  exports: [CommonModule, ...labSharedComponents, ...sharedModals],
  entryComponents: [...sharedModals],
  declarations: [...labSharedComponents, ...sharedModals],
  providers: [],
})
export class SharedLabModule {}
