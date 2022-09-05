import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { RegistrationService } from "../../services/registration.services";

@Component({
  selector: "app-register-new-client-home",
  templateUrl: "./register-new-client-home.component.html",
  styleUrls: ["./register-new-client-home.component.scss"],
})
export class RegisterNewClientHomeComponent implements OnInit {
  registrationMRNSourceReference$: Observable<any>;
  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.registrationMRNSourceReference$ =
      this.registrationService.getRegistrationMRNSource();
  }
}
