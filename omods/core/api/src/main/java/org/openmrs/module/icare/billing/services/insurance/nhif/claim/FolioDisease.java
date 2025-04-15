package org.openmrs.module.icare.billing.services.insurance.nhif.claim;

import org.codehaus.jackson.annotate.JsonProperty;
import org.openmrs.ConceptMap;
import org.openmrs.Diagnosis;
import org.openmrs.Order;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.billing.services.BillingService;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class FolioDisease {
	
	@JsonProperty("FolioDiseaseID")
	public String folioDiseaseID;
	
	@JsonProperty("DiseaseCode")
	public String diseaseCode;
	
	@JsonProperty("FolioID")
	public String folioID;
	
	@JsonProperty("Remarks")
	public Object remarks;
	
	@JsonProperty("CreatedBy")
	public String createdBy;
	
	@JsonProperty("DateCreated")
	public String dateCreated;
	
	@JsonProperty("LastModifiedBy")
	public String lastModifiedBy;
	
	@JsonProperty("LastModified")
	public String lastModified;
	
	public static FolioDisease fromDiagnosis(Folio folio, Diagnosis diagnosis) {
		FolioDisease folioDisease = new FolioDisease();
		// folioDisease.setFolioID(folio.getFolioID());
		folioDisease.setFolioDiseaseID(diagnosis.getUuid());
		//diagnosis.getDiagnosis().
		String diagnosisString = diagnosis.getDiagnosis().getCoded().getDisplayString();
		String diagnosisCode = diagnosisString.split(" ")[0].replace("(", "").replace(")", "").toUpperCase();
		
		folioDisease.setDiseaseCode(diagnosisCode);
		folioDisease.setRemarks(diagnosis.getDiagnosis().getNonCoded());
		folioDisease.setCreatedBy(diagnosis.getCreator().getDisplayString());
		folioDisease.setDateCreated(formatDate(diagnosis.getDateCreated()));
		if (diagnosis.getChangedBy() != null) {
			folioDisease.setLastModifiedBy(diagnosis.getChangedBy().getDisplayString());
		} else {
			folioDisease.setLastModifiedBy(diagnosis.getCreator().getDisplayString());
		}
		if (diagnosis.getDateChanged() != null) {
			folioDisease.setLastModified(formatDate(diagnosis.getDateChanged()));
		} else {
			folioDisease.setLastModified(formatDate(diagnosis.getDateCreated()));
		}
		return folioDisease;
	}
	
	private static String formatDate(Date date) {
		if (date == null) {
			return null;
		}
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);
		return formatter.format(Instant.ofEpochMilli(date.getTime()));
	}
	
	public String getFolioDiseaseID() {
		return folioDiseaseID;
	}
	
	public void setFolioDiseaseID(String folioDiseaseID) {
		this.folioDiseaseID = folioDiseaseID;
	}
	
	public String getDiseaseCode() {
		return diseaseCode;
	}
	
	public void setDiseaseCode(String diseaseCode) {
		this.diseaseCode = diseaseCode;
	}
	
	public String getFolioID() {
		return folioID;
	}
	
	public Object getRemarks() {
		return remarks;
	}
	
	public void setRemarks(Object remarks) {
		this.remarks = remarks;
	}
	
	public String getCreatedBy() {
		return createdBy;
	}
	
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	
	public String getDateCreated() {
		return dateCreated;
	}
	
	public void setDateCreated(String dateCreated) {
		this.dateCreated = dateCreated;
	}
	
	public String getLastModifiedBy() {
		return lastModifiedBy;
	}
	
	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}
	
	public String getLastModified() {
		return lastModified;
	}
	
	public void setLastModified(String lastModified) {
		this.lastModified = lastModified;
	}
	
	public void setFolioID(String folioID) {
		this.folioID = folioID;
	}
}
