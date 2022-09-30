import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, zip } from "rxjs";
import { map } from "rxjs/operators";
import { SystemSettingsService } from "src/app/core/services/system-settings.service";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
import { getGroupedObservationByConcept } from "src/app/store/selectors/observation.selectors";
import { StandardError } from "../../models/error-type.models";

@Component({
  selector: "app-shared-error",
  templateUrl: "./shared-error.component.html",
  styleUrls: ["./shared-error.component.scss"],
})
export class SharedErrorComponent implements OnInit {
  @Input() errors: error[];

  toggleMore: boolean = false;
  /**
   * This is the component specific for displaying erros.
   * Customize it accordingly by never delete what's already written as it may disrupt some other parts of the software
   * 
   * ***************** Declare errors array from which you would add the like of the below object ********************
      [
        {
          error: {
            message: "Your error message"
            detail?: "More details of the error if any"
            code?: "Error code if any"
          }
      ]
     *****************************************************************************************************************
   */

  constructor() {}

  ngOnInit() {}

  typeof(error) {
    return typeof error;
  }

  onClickMore(e) {
    e.stopPropagation();
    this.toggleMore = !this.toggleMore;
  }
}

interface error {
  error: StandardError;
}
