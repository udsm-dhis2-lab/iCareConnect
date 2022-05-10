import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { SampleCollectionRoutingModule } from "./sample-collection-routing.module";
import { collectionPages } from "./pages";
import { collectionComponents } from "./components";

@NgModule({
  declarations: [...collectionPages, ...collectionComponents],
  imports: [CommonModule, SampleCollectionRoutingModule, SharedModule],
})
export class SampleCollectionModule {}
