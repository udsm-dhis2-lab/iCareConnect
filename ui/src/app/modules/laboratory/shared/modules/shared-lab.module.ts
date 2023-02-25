import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { materialModules } from "src/app/shared/material-modules";
import { labSharedComponents } from "../../components";
import { SharedModule } from "src/app/shared/shared.module";
@NgModule({
  imports: [CommonModule, ...materialModules, SharedModule],
  exports: [CommonModule, ...labSharedComponents],
  entryComponents: [],
  declarations: [...labSharedComponents],
  providers: [],
})
export class SharedLabModule {}
