package org.openmrs.module.icare.billing.services.insurance;

import org.openmrs.module.icare.billing.services.insurance.nhif.claim.Folio;

public class ClaimResult {
	
	private String status;
	
	private String message;
	
	private Folio folio;
	
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getMessage() {
		return message;
	}
	
	public void setMessage(String message) {
		this.message = message;
	}
	
	public Folio getFolio() {
		return folio;
	}
	
	public void setFolio(Folio folio) {
		this.folio = folio;
	}
}
