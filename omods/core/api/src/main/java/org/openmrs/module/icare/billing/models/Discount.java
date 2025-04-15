package org.openmrs.module.icare.billing.models;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.codehaus.jackson.annotate.JsonSetter;
import org.openmrs.BaseChangeableOpenmrsData;
import org.openmrs.Concept;
import org.openmrs.Obs;
import org.openmrs.Patient;
import org.openmrs.module.icare.core.Item;

// Generated Oct 7, 2020 12:48:40 PM by Hibernate Tools 5.2.10.Final

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * BlDiscount generated by hbm2java
 */
@Entity
@Table(name = "bl_discount")
public class Discount extends BaseChangeableOpenmrsData {
	
	public static final long serialVersionUID = 93123L;
	
	@Id
	@GeneratedValue()
	@Column(name = "discount_id", unique = true, nullable = false)
	private int id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "discount_criteria_id", nullable = false)
	private Concept criteria;
	
	@JoinColumn(name = "attachment_id")
	@OneToOne(fetch = FetchType.LAZY)
	private Obs attachment;
	
	@Column(name = "is_full_exempted")
	@JsonProperty("exempted")
	private Boolean exempted;
	
	@Column(name = "remarks")
	private String remarks;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id")
	// @JsonSerialize(using = ChildIdOnlySerializer.class)
	// @JsonDeserialize(using = ChildIdOnlyDeserializer.class)
	private Patient patient;
	
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "id.discount", cascade = { CascadeType.PERSIST })
	private List<DiscountInvoiceItem> items = new ArrayList<DiscountInvoiceItem>(0);
	
	public Discount() {
	}
	
	public Discount(@JsonProperty("patient") String patient) {
		
	}
	
	public Integer getId() {
		return this.id;
	}
	
	public void setId(Integer id) {
		this.id = id;
	}
	
	public String getRemarks() {
		return this.remarks;
	}
	
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
	
	public Patient getPatient() {
		return patient;
	}
	
	public void setPatient(Patient patient) {
		this.patient = patient;
	}
	
	public List<DiscountInvoiceItem> getItems() {
		return items;
	}
	
	public void setItems(List<DiscountInvoiceItem> items) {
		this.items = items;
	}
	
	public Concept getCriteria() {
		return criteria;
	}
	
	public void setCriteria(Concept criteria) {
		this.criteria = criteria;
	}
	
	public Boolean getExempted() {
		return exempted;
	}
	
	public void setExempted(Boolean fullExempted) {
		this.exempted = fullExempted;
		
	}
	
	public Map<String, Object> toMap() {
		HashMap<String, Object> discountMap = new HashMap<String, Object>();
		
		discountMap.put("uuid", this.getUuid());
		discountMap.put("remarks", this.getRemarks());
		
		if (this.exempted != null) {
			discountMap.put("isFullExempted", this.getExempted());
			
		}
		HashMap<String, Object> criteria = new HashMap<String, Object>();
		criteria.put("uuid", this.getCriteria().getUuid());
		discountMap.put("criteria", criteria);
		
		if (this.getAttachment() != null) {
			HashMap<String, Object> attachment = new HashMap<String, Object>();
			attachment.put("uuid", this.getAttachment().getUuid());
			discountMap.put("attachment", attachment);
		}
		
		HashMap<String, Object> patient = new HashMap<String, Object>();
		patient.put("uuid", this.getPatient().getUuid());
		discountMap.put("patient", patient);
		
		Map<String, Object> creatorObject = new HashMap<String, Object>();
		
		if (this.getCreator() != null) {
			creatorObject.put("uuid", this.getCreator().getUuid());
			creatorObject.put("display", this.getCreator().getDisplayString());
		}
		
		discountMap.put("creator", creatorObject);
		
		discountMap.put("created", this.getDateCreated());
		
		discountMap.put("voided", this.getVoided());
		
		List<HashMap<String, Object>> discountItems = new ArrayList<HashMap<String, Object>>();
		for (DiscountInvoiceItem discountItem : this.getItems()) {
			HashMap<String, Object> discountItemObject = new HashMap<String, Object>();
			discountItemObject.put("amount", discountItem.getAmount());
			
			HashMap<String, Object> discountItemInvoiceObject = new HashMap<String, Object>();
			discountItemInvoiceObject.put("uuid", discountItem.getInvoice().getUuid());
			discountItemObject.put("invoice", discountItemInvoiceObject);
			
			HashMap<String, Object> discountItemItemObject = new HashMap<String, Object>();
			discountItemItemObject.put("uuid", discountItem.getItem().getUuid());
			discountItemObject.put("item", discountItemItemObject);
			
			discountItems.add(discountItemObject);
		}
		
		discountMap.put("items", discountItems);
		
		return discountMap;
	}
	
	@JsonSetter("patient")
	public void setPatient(Map<String, Object> patientMap) {
		Patient patient = new Patient();
		patient.setUuid((String) patientMap.get("uuid"));
		this.setPatient(patient);
	}
	
	@JsonSetter("attachment")
	public void setAttachment(Map<String, Object> attachmentMap) {
		Obs obs = new Obs();
		obs.setUuid((String) attachmentMap.get("uuid"));
		this.setAttachment(obs);
	}
	
	@JsonSetter("criteria")
	public void setCriteria(Map<String, Object> criteriaMap) {
		Concept criteria = new Concept();
		criteria.setUuid((String) criteriaMap.get("uuid"));
		this.setCriteria(criteria);
	}
	
	@JsonSetter("items")
	public void setDiscountItems(List<Map<String, Object>> items) {
		List<DiscountInvoiceItem> newItems = new ArrayList<DiscountInvoiceItem>();
		for (Map<String, Object> item : items) {
			DiscountInvoiceItem i = new DiscountInvoiceItem();
			Item itemObj = new Item();
			itemObj.setUuid((String) ((Map<String, Object>) item.get("item")).get("uuid"));
			i.setItem(itemObj);
			
			Invoice invoice = new Invoice();
			invoice.setUuid((String) ((Map<String, Object>) item.get("invoice")).get("uuid"));
			i.setInvoice(invoice);
			
			i.setAmount(Double.valueOf(item.get("amount").toString()));
			newItems.add(i);
		}
		this.setItems(newItems);
	}
	
	public Obs getAttachment() {
		return attachment;
	}
	
	public void setAttachment(Obs attachment) {
		this.attachment = attachment;
	}
}
