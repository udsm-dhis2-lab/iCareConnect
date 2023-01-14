import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { Dropdown } from "../../modules/form/models/dropdown.model";

@Component({
  selector: "app-visit-data",
  templateUrl: "./visit-data.component.html",
  styleUrls: ["./visit-data.component.scss"],
})
export class VisitDataComponent implements OnInit {
  @Input() visit: any;
  @Input() settings: any;
  @Input() forms: any;

  constructor() {}

  ngOnInit(): void {
    console.log("==> Visit: ", this.visit);
    this.forms?.map((form) => {
      let obsObject = {
        form: form?.name,
        obs: form?.formFields?.map((field) => {
          return this.visit?.obs
          ?.filter((obs) =>{
              // console.log("==> Obs: ", obs?.concept?.uuid);
              // console.log("==> field: ", field?.uuid)
              if(obs?.concept?.uuid === field?.uuid){
                return obs
              }
            })
            // ?.reduce(
            //   (obs, ob) => ({
            //     ...obs,
            //     [`${ob?.concept?.display}/${ob?.obsDatetime}`]:
            //       `${ob?.concept?.display}/${ob?.obsDatetime}` in obs
            //         ? obs[`${ob?.concept?.display}/${ob?.obsDatetime}`].concat(
            //             ob
            //           )
            //         : [ob],
            //   }),
            //   []
            // );
        })
      };

      // console.log("==> Observations: ", obsObject);
    }) 
    this.visit;
  }
}