import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SupplierFormComponent } from "./supplier-form.component";

describe("SupplierFormComponent", () => {
  let component: SupplierFormComponent;
  let fixture: ComponentFixture<SupplierFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupplierFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
