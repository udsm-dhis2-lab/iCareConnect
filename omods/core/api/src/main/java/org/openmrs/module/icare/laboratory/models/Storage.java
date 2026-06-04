package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "lb_storage")
public class Storage extends BaseOpenmrsData implements Serializable, JSONConverter {
	
	@Id
	@GeneratedValue()
	@Column(name = "storage_id", unique = true, nullable = false)
	private Integer id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "storage_type_id", nullable = false)
	private StorageType storageType;
	
	@Column(name = "capacity")
	private Integer capacity;
	
	@Column(name = "name", length = 128)
	private String name;
	
	public static Storage fromMap(Map<String, Object> storageMap) {
		Storage storage = new Storage();
		if (storageMap == null) {
			return storage;
		}
		if (storageMap.get("uuid") != null && !storageMap.get("uuid").toString().trim().equals("")) {
			storage.setUuid(storageMap.get("uuid").toString());
		}
		if (storageMap.get("id") != null && !storageMap.get("id").toString().trim().equals("")) {
			storage.setId(Integer.parseInt(storageMap.get("id").toString()));
		}
		if (storageMap.get("name") != null) {
			storage.setName(storageMap.get("name").toString());
		}
		if (storageMap.get("capacity") != null && !storageMap.get("capacity").toString().trim().equals("")) {
			storage.setCapacity(Integer.parseInt(storageMap.get("capacity").toString()));
		}
		if (storageMap.get("storageType") != null && storageMap.get("storageType") instanceof Map) {
			storage.setStorageType(StorageType.fromMap((Map<String, Object>) storageMap.get("storageType")));
		}
		return storage;
	}
	
	public Map<String, Object> toMap() {
		Map<String, Object> storageObject = new HashMap<String, Object>();
		storageObject.put("uuid", this.getUuid());
		storageObject.put("id", this.getId());
		storageObject.put("display", this.getName());
		storageObject.put("name", this.getName());
		storageObject.put("capacity", this.getCapacity());
		if (this.getStorageType() != null) {
			storageObject.put("storageType", this.getStorageType().toMap());
		}
		if (this.getVoided() != null) {
			storageObject.put("voided", this.getVoided());
		}
		return storageObject;
	}
	
	@Override
	public Map<String, Object> toMap(Object... params) throws Exception {
        return new HashMap<>();
	}
	
	public String getName() {
		return this.name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public Integer getCapacity() {
		return this.capacity;
	}
	
	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
	}
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		this.id = id;
	}
	
	public StorageType getStorageType() {
		return storageType;
	}
	
	public void setStorageType(StorageType storageType) {
		this.storageType = storageType;
	}
}
