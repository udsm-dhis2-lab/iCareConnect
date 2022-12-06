package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;

import java.util.HashMap;
import java.util.Map;

import static javax.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "lb_batch_set")
public class BatchSet extends BaseOpenmrsData implements java.io.Serializable, JSONConverter {
	
	@Id
	@GeneratedValue(strategy = IDENTITY)
	@Column(name = "batch_set_id", unique = true, nullable = false)
	private Integer id;
	
	@Column(name = "label", length = 65535)
	private String label;
	
	@Column(name = "name", length = 30)
	private String batchSetName;
	
	@Column(name = "description", length = 65535)
	private String description;
	
	@Column(name = "fields", length = 100000)
	private String fields;
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		
		this.id = id;
	}
	
	public void setBatchSetName(String batchName) {
		this.batchSetName = batchName;
	}
	
	public String getBatchSetName() {
		return batchSetName;
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
	
	public static BatchSet fromMap(Map<String, Object> batchSetMap) {
		
		BatchSet batchSet = new BatchSet();
		batchSet.setBatchSetName(batchSetMap.get("name").toString());
		batchSet.setFields(batchSetMap.get("fields").toString());
		batchSet.setDescription(batchSetMap.get("description").toString());
		batchSet.setLabel(batchSetMap.get("label").toString());
		
		return batchSet;
		
	}
	
	public Map<String, Object> toMap() {
		
		HashMap<String, Object> batchSetObject = new HashMap<String, Object>();
		
		batchSetObject.put("label", this.getLabel());
		batchSetObject.put("description", this.getDescription());
		batchSetObject.put("fields", this.getFields());
		batchSetObject.put("name", this.getBatchSetName());
		batchSetObject.put("uuid", this.getUuid());

		if (this.getDateCreated() != null) {
			batchSetObject.put("dateCreated", this.getDateCreated());
		}

		Map<String, Object> creatorObject = new HashMap<String, Object>();

		if (this.getCreator() != null) {
			creatorObject.put("uuid", this.getCreator().getUuid());
			creatorObject.put("display", this.getCreator().getDisplayString());
		}
		batchSetObject.put("creator", creatorObject);


		return batchSetObject;
		
	}
}
