export class OtherOrder {
  constructor(private order: any) {}

  get uuid(): string {
    return this.order?.uuid;
  }

  get id(): string {
    return this.order?.uuid;
  }

  get display(): string {
    return this.order?.display;
  }

  get type(): string {
    return this.order?.type;
  }

  get orderNumber(): string {
    return this.order?.orderNumber;
  }

  get patientUuid(): string {
    return this.order?.patient?.uuid;
  }

  get encounterUuid(): string {
    return this.order?.encounter?.uuid;
  }

  get concept(): { uuid: string; display: string } {
    return {
      uuid: this.order?.concept?.uuid,
      display: this.order.concept.display,
    };
  }

  get orderer(): { uuid: string; display: string } {
    return {
      uuid: this.order?.orderer?.uuid,
      display: this.order.orderer.display,
    };
  }
  get orderType(): string {
    return this.order?.orderType?.display;
  }

  toJson(): any {
    return {
      id: this.uuid,
      uuid: this.uuid,
      orderNumber: this.orderNumber,
      patientUuid: this.patientUuid,
      concept: this.concept,
      encounterUuid: this.encounterUuid,
      orderer: this.orderer,
      orderType: this.orderType,
      display: this.display,
      type: this.type,
    };
  }
}
