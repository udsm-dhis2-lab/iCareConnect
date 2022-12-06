package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.User;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

import static javax.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "lb_batch")
public class Batch extends BaseOpenmrsData implements java.io.Serializable, JSONConverter {
	
	@Id
	@GeneratedValue(strategy = IDENTITY)
	@Column(name = "batch_id", unique = true, nullable = false)
	private Integer id;
	
	@Column(name = "label", length = 65535)
	private String label;
	
	@Column(name = "name", length = 30)
	private String batchName;
	
	@Column(name = "description", length = 65535)
	private String description;
	
	@Column(name = "fields", length = 100000)
	private String fields;
	
	@ManyToOne
	@JoinColumn(name = "batch_set_id", nullable = false)
	private BatchSet batchSet;
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		
		this.id = id;
	}
	
	public void setBatchName(String batchName) {
		this.batchName = batchName;
	}
	
	public String getBatchSetName() {
		return batchName;
	}
	
	public void setLabel(String label) {
		this.label = label;
	}
	
	public String getLabel() {
		return label;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	public String getDescription() {
		return description;
	}
	
	public void setFields(String fields) {
		this.fields = fields;
	}
	
	public String getFields() {
		return fields;
	}
	
	public static BatchSet fromMap(Map<String, Object> batchMap) {
		
		BatchSet batchSet = new BatchSet();
		batchSet.setBatchSetName(batchMap.get("name").toString());
		batchSet.setFields(batchMap.get("fields").toString());
		batchSet.setDescription(batchMap.get("description").toString());
		batchSet.setLabel(batchMap.get("label").toString());
		
		return batchSet;
		
	}
	
	public Map<String, Object> toMap() {
		
		HashMap<String, Object> batchObject = new HashMap<String, Object>();
		
		batchObject.put("label", this.getLabel());
		batchObject.put("description", this.getDescription());
		batchObject.put("fields", this.getFields());
		batchObject.put("name", this.getBatchSetName());
		
		return batchObject;
		
	}
}
