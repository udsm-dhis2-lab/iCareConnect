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
    this.forms?.map((form) => {
      let observations = []
      form?.formFields?.forEach((field) => {
          if (field?.formFields?.length) {
            field?.formFields?.forEach((formField) => {
                this.visit?.obs?.forEach((obs) => {
                  if (obs?.concept?.uuid === formField?.key) {
                    observations = [
                      ...observations,
                      obs
                    ];
                  }
                })
            });
          } else {
            this.visit?.obs?.forEach((obs) => {
                if (obs?.concept?.uuid === field?.formField?.key) {
                  observations = [
                    ...observations,
                    obs
                  ];
                }
              })
          } 
        });

      let obsbasedOnForms = {
        form: form?.name,
        obs: observations?.reduce(
            (obs, ob) => ({
              ...obs,
              [`${ob?.concept?.display}/${ob?.obsDatetime}`]:
                `${ob?.concept?.display}/${ob?.obsDatetime}` in obs
                  ? obs[`${ob?.concept?.display}/${ob?.obsDatetime}`].concat(ob)
                  : [ob],
            }),
            []
          ),
      };

      // let orders = this.visit?.orders.map((order) => {
      //   if(order?.orderType?.uuid === "settingsOrderUuid"){
      //     return {
      //       ...order,
      //       obs: this.visit?.obs?.filter((obs) => obs?.order === order?.uuid)
      //     }
      //   }
      // })

      console.log("==> Observations: ", obsbasedOnForms);
    }) 
    this.visit;
  }
}