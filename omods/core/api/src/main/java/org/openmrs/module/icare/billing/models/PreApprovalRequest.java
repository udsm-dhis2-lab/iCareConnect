package org.openmrs.module.icare.billing.models;

import java.util.List;
import org.openmrs.module.icare.billing.models.Disease;
import org.openmrs.module.icare.billing.models.RequestedService;

public class PreApprovalRequest {
	
	private String authorizationNo;
	
	private String firstName;
	
	private String lastName;
	
	private String gender;
	
	private String dateOfBirth;
	
	private String patientFileNo;
	
	private String clinicalNotes;
	
	private String practitionerNo;
	
	private String practitionersRemarks;
	
	private String telephoneNo;
	
	private List<Disease> diseases;
	
	private List<RequestedService> requestedServices;
	
	// Getters and Setters
	
	public boolean isValid() {
		// Manually validate each field
		if (authorizationNo == null || authorizationNo.trim().isEmpty()) {
			return false;
		}
		if (firstName == null || firstName.trim().isEmpty()) {
			return false;
		}
		if (lastName == null || lastName.trim().isEmpty()) {
			return false;
		}
		if (gender == null || gender.trim().isEmpty()) {
			return false;
		}
		if (dateOfBirth == null || dateOfBirth.trim().isEmpty()) {
			return false;
		}
		if (patientFileNo == null || patientFileNo.trim().isEmpty()) {
			return false;
		}
		if (clinicalNotes == null || clinicalNotes.trim().isEmpty()) {
			return false;
		}
		if (practitionerNo == null || practitionerNo.trim().isEmpty()) {
			return false;
		}
		if (practitionersRemarks == null || practitionersRemarks.trim().isEmpty()) {
			return false;
		}
		if (telephoneNo == null || telephoneNo.trim().isEmpty()) {
			return false;
		}
		
		// Validate diseases
		if (diseases == null || diseases.isEmpty()) {
			return false;
		}
		for (Disease disease : diseases) {
			if (!disease.isValid()) {
				return false;
			}
		}
		
		// Validate requestedServices
		if (requestedServices == null || requestedServices.isEmpty()) {
			return false;
		}
		for (RequestedService service : requestedServices) {
			if (!service.isValid()) {
				return false;
			}
		}
		
		return true;
	}
}
