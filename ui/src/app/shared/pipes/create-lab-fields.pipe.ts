import { Pipe, PipeTransform } from "@angular/core";
import { keyBy } from "lodash";
import { Dropdown } from "../modules/form/models/dropdown.model";
import { Textbox } from "../modules/form/models/text-box.model";

@Pipe({
  name: "createLabFields",
})
export class CreateLabFieldsPipe implements PipeTransform {
  transform(allRegistrationFields: any, ...args: any[]): any {
      if(allRegistrationFields && args.length === 3){
        let fields = {
            ...allRegistrationFields, 
            specimenDetailFields: {
              ...allRegistrationFields.specimenDetailFields,
                agency: new Dropdown({
                  id: "agency",
                  key: "agency",
                  label: "urgency/Priority",
                  options: args[1]?.setMembers.map((member) => {
                    return {
                      key: member?.uuid,
                      value: member?.display,
                      label: member?.display,
                      name: member?.display,
                    };
                  }),
                  shouldHaveLiveSearchForDropDownFields: false,
                })
            },
            referringDoctorFields: keyBy(args[0]?.map(
              (attribute) => {
                return new Textbox({
                    id: "attribute-" + attribute?.value,
                    key: "attribute-" + attribute?.value,
                    label: attribute?.name,
                    type: "text",
                  })
              }
            ), "id"),
            personFields: {
              ...allRegistrationFields.personFields,
              ["attribute-" + args[2]]: new Dropdown({
                id: "attribute-" + args[2],
                key: "attribute-" + args[2],
                options: [],
                label: "Facility Name",
                shouldHaveLiveSearchForDropDownFields: true,
                searchControlType: "healthFacility",
                searchTerm: "Health Facility",
                controlType: "location",
              }),
            }
          }
          return fields;
      } else {
        return allRegistrationFields;
      }
    }
}
