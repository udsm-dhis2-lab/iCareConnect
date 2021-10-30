import { DropdownOption } from "./dropdown-option.model";

export class Field<T> {
  value: T;
  id: string;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  type: string;
  disabled: boolean;
  options: DropdownOption[];
  placeholder: string;
  min: number;
  max: number;
  hidden: boolean;
  units: string;
  rows?: number;
  conceptClass?: any;
  otherType?: string;
  shouldHaveLiveSearchForDropDownFields?: boolean;
  filteringItems?: any[];

  constructor(
    options: {
      value?: T;
      key?: string;
      id?: string;
      label?: string;
      required?: boolean;
      order?: number;
      controlType?: string;
      type?: string;
      disabled?: boolean;
      placeholder?: string;
      options?: DropdownOption[];
      min?: number;
      max?: number;
      hidden?: boolean;
      units?: string;
      conceptClass?: any;
      otherType?: string;
      shouldHaveLiveSearchForDropDownFields?: boolean;
      filteringItems?: any[];
    } = {}
  ) {
    this.value = options.value;
    this.key = options.key || "";
    this.id = options.id || "";
    this.label = options.label || "";
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || "";
    this.type = options.type || "";
    this.options = options.options || [];
    this.disabled = options.disabled || false;
    this.placeholder = options.placeholder;
    this.min = options.min;
    this.max = options.max;
    this.hidden = options.hidden || false;
    this.units = options.units || "";
    (this.shouldHaveLiveSearchForDropDownFields =
      options.shouldHaveLiveSearchForDropDownFields),
      (this.otherType = options.otherType);
  }
}
