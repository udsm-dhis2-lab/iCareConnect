package org.openmrs.module.icare.billing.models;

public class Disease {
	
	private String diseaseCode;
	
	private String status;
	
	public boolean isValid() {
		if (diseaseCode == null || diseaseCode.trim().isEmpty()) {
			return false;
		}
		if (status == null || status.trim().isEmpty()) {
			return false;
		}
		return true;
	}
}
