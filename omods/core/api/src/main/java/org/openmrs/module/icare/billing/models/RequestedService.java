package org.openmrs.module.icare.billing.models;

public class RequestedService {
	
	private String itemCode;
	
	private String usage;
	
	private String effectiveDate;
	
	private String endDate;
	
	private int quantityRequested;
	
	private String remarks;
	
	public boolean isValid() {
		if (itemCode == null || itemCode.trim().isEmpty()) {
			return false;
		}
		if (usage == null || usage.trim().isEmpty()) {
			return false;
		}
		if (effectiveDate == null || effectiveDate.trim().isEmpty()) {
			return false;
		}
		if (endDate == null || endDate.trim().isEmpty()) {
			return false;
		}
		if (quantityRequested <= 0) {
			return false;
		}
		if (remarks == null || remarks.trim().isEmpty()) {
			return false;
		}
		return true;
	}
}
