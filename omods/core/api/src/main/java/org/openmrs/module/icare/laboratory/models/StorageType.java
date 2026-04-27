package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "lb_storage_type")
public class StorageType extends BaseOpenmrsData implements Serializable, JSONConverter {
	
	@Id
	@GeneratedValue()
	@Column(name = "storage_type_id", unique = true, nullable = false)
	private int id;
	
	@Column(name = "name", length = 32)
	private String name;
	
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "storageType")
	private List<Storage> storages = new ArrayList<Storage>(0);
	
	public static StorageType fromMap(Map<String, Object> storageTypeMap) {
		StorageType storageType = new StorageType();
		if (storageTypeMap == null) {
			return storageType;
		}
		if (storageTypeMap.get("uuid") != null && !storageTypeMap.get("uuid").toString().trim().equals("")) {
			storageType.setUuid(storageTypeMap.get("uuid").toString());
		}
		if (storageTypeMap.get("id") != null && !storageTypeMap.get("id").toString().trim().equals("")
		        && !"null".equalsIgnoreCase(storageTypeMap.get("id").toString().trim())) {
			storageType.setId(Integer.parseInt(storageTypeMap.get("id").toString()));
		}
		if (storageTypeMap.get("name") != null) {
			storageType.setName(storageTypeMap.get("name").toString());
		}
		return storageType;
	}
	
	public Map<String, Object> toMap() {
		Map<String, Object> storageTypeObject = new HashMap<String, Object>();
		storageTypeObject.put("uuid", this.getUuid());
		storageTypeObject.put("display", this.getName());
		storageTypeObject.put("name", this.getName());
		storageTypeObject.put("voided", this.getVoided());
		return storageTypeObject;
	}
	
	public String getName() {
		return this.name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public List<Storage> getStorages() {
		return storages;
	}
	
	public void setStorages(List<Storage> storages) {
		this.storages = storages;
	}
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		this.id = id;
	}
}
