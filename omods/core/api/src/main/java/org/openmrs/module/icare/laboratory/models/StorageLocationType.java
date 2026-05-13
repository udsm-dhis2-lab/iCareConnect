package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "lb_storage_location_type")
public class StorageLocationType extends BaseOpenmrsData implements Serializable, JSONConverter {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "storage_location_type_id", nullable = false, unique = true)
	private Integer id;
	
	@Column(name = "code", length = 64, nullable = false)
	private String code;
	
	@Column(name = "name", length = 128, nullable = false)
	private String name;
	
	@Column(name = "description", length = 65535)
	private String description;
	
	@Column(name = "level_order")
	private Integer levelOrder;
	
	@Column(name = "structural")
	private Boolean structural;
	
	@Column(name = "slot_bearing")
	private Boolean slotBearing;
	
	@Column(name = "metadata_json", length = 65535)
	private String metadataJson;
	
	public static StorageLocationType fromMap(Map<String, Object> map) {
		StorageLocationType type = new StorageLocationType();
		if (map == null) {
			return type;
		}
		if (map.get("uuid") != null) {
			type.setUuid(map.get("uuid").toString());
		}
		if (map.get("id") != null && !map.get("id").toString().trim().equals("")) {
			type.setId(Integer.parseInt(map.get("id").toString()));
		}
		if (map.get("code") != null) {
			type.setCode(map.get("code").toString());
		}
		if (map.get("name") != null) {
			type.setName(map.get("name").toString());
		}
		if (map.get("description") != null) {
			type.setDescription(map.get("description").toString());
		}
		if (map.get("levelOrder") != null && !map.get("levelOrder").toString().trim().equals("")) {
			type.setLevelOrder(Integer.parseInt(map.get("levelOrder").toString()));
		}
		if (map.get("structural") != null) {
			type.setStructural(Boolean.valueOf(map.get("structural").toString()));
		}
		if (map.get("slotBearing") != null) {
			type.setSlotBearing(Boolean.valueOf(map.get("slotBearing").toString()));
		}
		if (map.get("metadataJson") != null) {
			type.setMetadataJson(map.get("metadataJson").toString());
		}
		return type;
	}
	
	public Map<String, Object> toMap() {
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("uuid", this.getUuid());
		data.put("id", this.getId());
		data.put("code", this.getCode());
		data.put("name", this.getName());
		data.put("display", this.getName());
		data.put("description", this.getDescription());
		data.put("levelOrder", this.getLevelOrder());
		data.put("structural", this.getStructural());
		data.put("slotBearing", this.getSlotBearing());
		data.put("metadataJson", this.getMetadataJson());
		data.put("voided", this.getVoided());
		return data;
	}
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		this.id = id;
	}
	
	public String getCode() {
		return code;
	}
	
	public void setCode(String code) {
		this.code = code;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	public Integer getLevelOrder() {
		return levelOrder;
	}
	
	public void setLevelOrder(Integer levelOrder) {
		this.levelOrder = levelOrder;
	}
	
	public Boolean getStructural() {
		return structural;
	}
	
	public void setStructural(Boolean structural) {
		this.structural = structural;
	}
	
	public Boolean getSlotBearing() {
		return slotBearing;
	}
	
	public void setSlotBearing(Boolean slotBearing) {
		this.slotBearing = slotBearing;
	}
	
	public String getMetadataJson() {
		return metadataJson;
	}
	
	public void setMetadataJson(String metadataJson) {
		this.metadataJson = metadataJson;
	}
}
