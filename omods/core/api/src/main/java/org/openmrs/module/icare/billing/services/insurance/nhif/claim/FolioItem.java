package org.openmrs.module.icare.billing.services.insurance.nhif.claim;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.openmrs.Concept;
import org.openmrs.ConceptMap;
import org.openmrs.DrugReferenceMap;
import org.openmrs.Order;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.billing.services.BillingService;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class FolioItem {
	
	@JsonProperty("FolioItemID")
	public String folioItemID;
	
	@JsonProperty("FolioID")
	public String folioID;
	
	public static FolioItem fromOrder(Order order) {
		FolioItem folioItem = new FolioItem();
		BillingService billingService = Context.getService(BillingService.class);
		InvoiceItem invoiceItem = billingService.getInvoiceItemByOrder(order);
		if (invoiceItem == null) {
			return null;
		}
		folioItem.setFolioID(order.getEncounter().getVisit().getUuid());
		folioItem.setFolioItemID(order.getUuid());
		//		if (invoiceItem.getItem().getConcept() != null) {
		//			for (ConceptMap map : invoiceItem.getItem().getConcept().getConceptMappings()) {
		//				if (map.getConceptReferenceTerm().getConceptSource().getName().toLowerCase().equals("nhif")) {
		//					if (map.getConceptReferenceTerm().getCode() == null) {
		//						folioItem.setItemCode("[Code Does not exist]");
		//					} else {
		//						folioItem.setItemCode(map.getConceptReferenceTerm().getCode());
		//					}
		//					if (map.getConceptReferenceTerm().getName() == null) {
		//						folioItem.setItemName("[Item is not mapped]");
		//					} else {
		//						folioItem.setItemName(invoiceItem.getItem().getConcept().getName().getName());
		//					}
		//				}
		//			}
		//			//folioItem.setItemCode();
		//		} else if (invoiceItem.getItem().getDrug() != null) {
		//			for (ConceptMap map : invoiceItem.getItem().getDrug().getConcept().getConceptMappings()) {
		//				if (map.getConceptReferenceTerm().getConceptSource().getName().toLowerCase().equals("nhif")) {
		//					if (map.getConceptReferenceTerm().getCode() == null) {
		//						folioItem.setItemCode("[Code Does not exist]");
		//					} else {
		//						folioItem.setItemCode(map.getConceptReferenceTerm().getCode());
		//					}
		//					if (map.getConceptReferenceTerm().getName() == null) {
		//						folioItem.setItemName("[Item is not mapped]");
		//					} else {
		//						folioItem.setItemName(invoiceItem.getItem().getDrug().getName());
		//					}
		//				}
		//			}
		/*for (DrugReferenceMap map : invoiceItem.getItem().getDrug().getDrugReferenceMaps()) {
			if (map.getConceptReferenceTerm().getConceptSource().getName().toLowerCase().equals("nhif")) {
				if (map.getConceptReferenceTerm().getCode() == null) {
					folioItem.setItemCode("[Code Does not exist]");
				} else {
					folioItem.setItemCode(map.getConceptReferenceTerm().getCode());
				}
				if (map.getConceptReferenceTerm().getName() == null) {
					folioItem.setItemName("[Item is not mapped]");
				} else {
					folioItem.setItemName(map.getConceptReferenceTerm().getName());
				}
			}
		}*/
		//}
		if (invoiceItem.getItem().getConcept() != null) {
			for (ConceptMap map : invoiceItem.getItem().getConcept().getConceptMappings()) {
				if (map.getConceptReferenceTerm().getConceptSource().getName().toLowerCase().equals("nhif")) {
					if (map.getConceptReferenceTerm().getCode().equals(null)) {
						folioItem.setItemCode("[Code Does not exist]");
					} else {
						folioItem.setItemCode(map.getConceptReferenceTerm().getCode());
					}
				}
			}
		} else {
			for (ConceptMap map : invoiceItem.getItem().getDrug().getConcept().getConceptMappings()) {
				if (map.getConceptReferenceTerm().getConceptSource().getName().toLowerCase().equals("nhif")) {
					if (map.getConceptReferenceTerm().getCode().equals(null)) {
						folioItem.setItemCode("[Code Does not exist]");
					} else {
						folioItem.setItemCode(map.getConceptReferenceTerm().getCode());
					}
				}
			}
		}
		
		folioItem.setItemName(invoiceItem.getItem().getDisplayString());
		folioItem.setItemQuantity(invoiceItem.getQuantity().intValue());
		folioItem.setUnitPrice(invoiceItem.getPrice().intValue());
		folioItem.setAmountClaimed((int) (invoiceItem.getQuantity() * invoiceItem.getPrice()));
		folioItem.setCreatedBy(order.getCreator().getDisplayString());
		Date dateCreated = order.getDateCreated();
		if (dateCreated != null) {
			// Format the dateCreated to the required format and set it
			folioItem.setDateCreated(formatDate(dateCreated));
		}
		
		folioItem.setOtherDetails("");
		//TODO adding approval refference number
		folioItem.setApprovalRefNo("");
		if (order.getChangedBy() != null) {
			// If changed by user is available, set LastModifiedBy and LastModified
			folioItem.setLastModifiedBy(order.getChangedBy().getDisplayString());
			folioItem.setLastModified(formatDate(order.getDateChanged()));
		} else {
			// If not changed by anyone, set the creator's details
			folioItem.setLastModifiedBy(order.getCreator().getDisplayString());
			Date dateChanged = order.getDateCreated(); // Reusing dateCreated here
			if (dateChanged != null) {
				folioItem.setLastModified(formatDate(dateChanged));
			}
		}
		return folioItem;
	}
	
	private static String formatDate(Date date) {
		if (date == null) {
			return null; // Handle null dates properly
		}
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);
		return formatter.format(Instant.ofEpochMilli(date.getTime()));
	}
	
	public String getFolioItemID() {
		return folioItemID;
	}
	
	public void setFolioItemID(String folioItemID) {
		this.folioItemID = folioItemID;
	}
	
	public String getFolioID() {
		return folioID;
	}
	
	public void setFolioID(String folioID) {
		this.folioID = folioID;
	}
	
	public String getItemCode() {
		return itemCode;
	}
	
	public void setItemCode(String itemCode) {
		this.itemCode = itemCode;
	}
	
	public Object getOtherDetails() {
		return otherDetails;
	}
	
	public void setOtherDetails(Object otherDetails) {
		this.otherDetails = otherDetails;
	}
	
	public int getItemQuantity() {
		return itemQuantity;
	}
	
	public void setItemQuantity(int itemQuantity) {
		this.itemQuantity = itemQuantity;
	}
	
	public float getUnitPrice() {
		return unitPrice;
	}
	
	public void setUnitPrice(int unitPrice) {
		this.unitPrice = unitPrice;
	}
	
	public float getAmountClaimed() {
		return amountClaimed;
	}
	
	public void setAmountClaimed(int amountClaimed) {
		this.amountClaimed = amountClaimed;
	}
	
	public String getApprovalRefNo() {
		return approvalRefNo;
	}
	
	public void setApprovalRefNo(String approvalRefNo) {
		this.approvalRefNo = approvalRefNo;
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
	
	@JsonProperty("ItemCode")
	public String itemCode;
	
	@JsonProperty("ItemName")
	private String itemName;
	
	@JsonProperty("OtherDetails")
	public Object otherDetails;
	
	@JsonProperty("ItemQuantity")
	public int itemQuantity;
	
	@JsonProperty("UnitPrice")
	public float unitPrice;
	
	@JsonProperty("AmountClaimed")
	public float amountClaimed;
	
	@JsonProperty("ApprovalRefNo")
	public String approvalRefNo;
	
	@JsonProperty("CreatedBy")
	public String createdBy;
	
	@JsonProperty("DateCreated")
	public String dateCreated;
	
	@JsonProperty("LastModifiedBy")
	public String lastModifiedBy;
	
	@JsonProperty("LastModified")
	public String lastModified;
	
	public String getItemName() {
		return itemName;
	}
	
	public void setItemName(String itemName) {
		this.itemName = itemName;
	}
}
