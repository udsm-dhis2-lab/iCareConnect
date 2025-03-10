package org.openmrs.module.icare.billing.services.insurance.nhif.claim;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

public class Signature {
	
	@JsonProperty("Signatory")
	private String signatory;
	
	@JsonProperty("SignatoryID")
	private String signatoryID;
	
	@JsonProperty("SignatureData")
	private String signatureData;
	
	@JsonProperty("DateCreated")
	private Date dateCreated;
	
	@JsonProperty("CreatedBy")
	private String createdBy;
	
	@JsonProperty("LastModified")
	private Date lastModified;
	
	@JsonProperty("LastModifiedBy")
	private String lastModifiedBy;
	
	// Getters and Setters
	
	public String getSignatory() {
		return signatory;
	}
	
	public void setSignatory(String signatory) {
		this.signatory = signatory;
	}
	
	public String getSignatoryID() {
		return signatoryID;
	}
	
	public void setSignatoryID(String signatoryID) {
		this.signatoryID = signatoryID;
	}
	
	public String getSignatureData() {
		return signatureData;
	}
	
	public void setSignatureData(String signatureData) {
		this.signatureData = signatureData;
	}
	
	public Date getDateCreated() {
		return dateCreated;
	}
	
	public void setDateCreated(Date dateCreated) {
		this.dateCreated = dateCreated;
	}
	
	public String getCreatedBy() {
		return createdBy;
	}
	
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	
	public Date getLastModified() {
		return lastModified;
	}
	
	public void setLastModified(Date lastModified) {
		this.lastModified = lastModified;
	}
	
	public String getLastModifiedBy() {
		return lastModifiedBy;
	}
	
	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}
}
