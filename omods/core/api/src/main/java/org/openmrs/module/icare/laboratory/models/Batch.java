package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.User;
import org.openmrs.Visit;
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

	public BatchSet getBatchSet() {
		return batchSet;
	}

	public void setBatchSet(BatchSet batchSet) {
		this.batchSet = batchSet;
	}

	public static Batch fromMap(Map<String, Object> batchMap) {
		
		Batch batch = new Batch();
		batch.setBatchName(batchMap.get("name").toString());
		batch.setFields(batchMap.get("fields").toString());
		batch.setDescription(batchMap.get("description").toString());
		batch.setLabel(batchMap.get("label").toString());

		if(batchMap.get("batchset")!= null){
			BatchSet batchSet = new BatchSet();
			batchSet.setUuid(((Map) batchMap.get("batchset")).get("uuid").toString());
			batch.setBatchSet(batchSet);
		}
		
		return batch;
		
	}
	
	public Map<String, Object> toMap() {
		
		HashMap<String, Object> batchObject = new HashMap<String, Object>();
		
		batchObject.put("label", this.getLabel());
		batchObject.put("description", this.getDescription());
		batchObject.put("fields", this.getFields());
		batchObject.put("name", this.getBatchSetName());
		batchObject.put("uuid", this.getUuid());
		if (this.getDateCreated() != null) {
			batchObject.put("dateCreated", this.getDateCreated());
		}

		Map<String, Object> creatorObject = new HashMap<String, Object>();

		if (this.getCreator() != null) {
			creatorObject.put("uuid", this.getCreator().getUuid());
			creatorObject.put("display", this.getCreator().getDisplayString());
		}
		batchObject.put("creator", creatorObject);

		Map<String, Object> batchSetOject = new HashMap<String, Object>();
		if(this.getBatchSet() != null){
			batchSetOject.put("uuid",this.getBatchSet().getUuid());
			batchSetOject.put("name",this.getBatchSet().getBatchSetName());
			batchObject.put("batchSet",batchSetOject);
		}
		
		return batchObject;
		
	}
}
