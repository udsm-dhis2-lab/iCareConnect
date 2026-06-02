package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "lb_storage_location")
public class StorageLocation extends BaseOpenmrsData implements Serializable, JSONConverter {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "storage_location_id", nullable = false, unique = true)
	private Integer id;
	
	@Column(name = "code", length = 128, nullable = false)
	private String code;
	
	@Column(name = "name", length = 255, nullable = false)
	private String name;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "storage_location_type_id", nullable = false)
	private StorageLocationType locationType;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent_location_id")
	private StorageLocation parentLocation;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "legacy_storage_type_id")
	private StorageType legacyStorageType;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "legacy_storage_id")
	private Storage legacyStorage;
	
	@Column(name = "barcode", length = 255)
	private String barcode;
	
	@Column(name = "path_label", length = 1024)
	private String pathLabel;
	
	@Column(name = "path_depth")
	private Integer pathDepth;
	
	@Column(name = "rows_count")
	private Integer rowsCount;
	
	@Column(name = "columns_count")
	private Integer columnsCount;
	
	@Column(name = "layers_count")
	private Integer layersCount;
	
	@Column(name = "slot_pattern", length = 255)
	private String slotPattern;
	
	@Column(name = "slot_separator", length = 16)
	private String slotSeparator;
	
	@Column(name = "is_slot")
	private Boolean slot;
	
	@Column(name = "storage_condition_type", length = 64)
	private String storageConditionType;
	
	@Column(name = "min_temperature")
	private Double minTemperature;
	
	@Column(name = "max_temperature")
	private Double maxTemperature;
	
	@Column(name = "capacity")
	private Integer capacity;
	
	@Column(name = "metadata_json", length = 65535)
	private String metadataJson;
	
	public static StorageLocation fromMap(Map<String, Object> map) {
		StorageLocation location = new StorageLocation();
		if (map == null) {
			return location;
		}
		if (map.get("uuid") != null) {
			location.setUuid(map.get("uuid").toString());
		}
		if (map.get("id") != null && !map.get("id").toString().trim().equals("")) {
			location.setId(Integer.parseInt(map.get("id").toString()));
		}
		if (map.get("code") != null) {
			location.setCode(map.get("code").toString());
		}
		if (map.get("name") != null) {
			location.setName(map.get("name").toString());
		}
		if (map.get("locationType") instanceof Map) {
			location.setLocationType(StorageLocationType.fromMap((Map<String, Object>) map.get("locationType")));
		} else if (map.get("locationTypeUuid") != null) {
			StorageLocationType type = new StorageLocationType();
			type.setUuid(map.get("locationTypeUuid").toString());
			location.setLocationType(type);
		}
		if (map.get("parentLocation") instanceof Map) {
			StorageLocation parent = new StorageLocation();
			Map<String, Object> parentMap = (Map<String, Object>) map.get("parentLocation");
			if (parentMap.get("uuid") != null) {
				parent.setUuid(parentMap.get("uuid").toString());
			}
			if (parentMap.get("id") != null && !parentMap.get("id").toString().trim().equals("")) {
				parent.setId(Integer.parseInt(parentMap.get("id").toString()));
			}
			location.setParentLocation(parent);
		} else if (map.get("parentLocationUuid") != null) {
			StorageLocation parent = new StorageLocation();
			parent.setUuid(map.get("parentLocationUuid").toString());
			location.setParentLocation(parent);
		}
		if (map.get("barcode") != null) {
			location.setBarcode(map.get("barcode").toString());
		}
		if (map.get("rowsCount") != null && !map.get("rowsCount").toString().trim().equals("")) {
			location.setRowsCount(Integer.parseInt(map.get("rowsCount").toString()));
		}
		if (map.get("columnsCount") != null && !map.get("columnsCount").toString().trim().equals("")) {
			location.setColumnsCount(Integer.parseInt(map.get("columnsCount").toString()));
		}
		if (map.get("layersCount") != null && !map.get("layersCount").toString().trim().equals("")) {
			location.setLayersCount(Integer.parseInt(map.get("layersCount").toString()));
		}
		if (map.get("slotPattern") != null) {
			location.setSlotPattern(map.get("slotPattern").toString());
		}
		if (map.get("slotSeparator") != null) {
			location.setSlotSeparator(map.get("slotSeparator").toString());
		}
		if (map.get("slot") != null) {
			location.setSlot(Boolean.valueOf(map.get("slot").toString()));
		}
		if (map.get("storageConditionType") != null) {
			location.setStorageConditionType(map.get("storageConditionType").toString());
		}
		if (map.get("minTemperature") != null && !map.get("minTemperature").toString().trim().equals("")) {
			location.setMinTemperature(Double.valueOf(map.get("minTemperature").toString()));
		}
		if (map.get("maxTemperature") != null && !map.get("maxTemperature").toString().trim().equals("")) {
			location.setMaxTemperature(Double.valueOf(map.get("maxTemperature").toString()));
		}
		if (map.get("capacity") != null && !map.get("capacity").toString().trim().equals("")) {
			location.setCapacity(Integer.parseInt(map.get("capacity").toString()));
		}
		if (map.get("metadataJson") != null) {
			location.setMetadataJson(map.get("metadataJson").toString());
		}
		return location;
	}
	
	public Map<String, Object> toMap() {
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("uuid", this.getUuid());
		data.put("id", this.getId());
		data.put("code", this.getCode());
		data.put("name", this.getName());
		data.put("display", this.getName());
		data.put("barcode", this.getBarcode());
		data.put("pathLabel", this.getPathLabel());
		data.put("pathDepth", this.getPathDepth());
		data.put("rowsCount", this.getRowsCount());
		data.put("columnsCount", this.getColumnsCount());
		data.put("layersCount", this.getLayersCount());
		data.put("slotPattern", this.getSlotPattern());
		data.put("slotSeparator", this.getSlotSeparator());
		data.put("slot", this.getSlot());
		data.put("storageConditionType", this.getStorageConditionType());
		data.put("minTemperature", this.getMinTemperature());
		data.put("maxTemperature", this.getMaxTemperature());
		data.put("capacity", this.getCapacity());
		data.put("metadataJson", this.getMetadataJson());
		data.put("voided", this.getVoided());
		if (this.getLocationType() != null) {
			data.put("locationType", this.getLocationType().toMap());
		}
		if (this.getParentLocation() != null) {
			Map<String, Object> parent = new HashMap<String, Object>();
			parent.put("uuid", this.getParentLocation().getUuid());
			parent.put("display", this.getParentLocation().getName());
			parent.put("name", this.getParentLocation().getName());
			data.put("parentLocation", parent);
		}
		if (this.getLegacyStorageType() != null) {
			data.put("legacyStorageType", this.getLegacyStorageType().toMap());
		}
		if (this.getLegacyStorage() != null) {
			data.put("legacyStorage", this.getLegacyStorage().toMap());
		}
		return data;
	}
	
	@Override
	public Map<String, Object> toMap(Object... params) throws Exception {
        return new HashMap<>();
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
	
	public StorageLocationType getLocationType() {
		return locationType;
	}
	
	public void setLocationType(StorageLocationType locationType) {
		this.locationType = locationType;
	}
	
	public StorageLocation getParentLocation() {
		return parentLocation;
	}
	
	public void setParentLocation(StorageLocation parentLocation) {
		this.parentLocation = parentLocation;
	}
	
	public StorageType getLegacyStorageType() {
		return legacyStorageType;
	}
	
	public void setLegacyStorageType(StorageType legacyStorageType) {
		this.legacyStorageType = legacyStorageType;
	}
	
	public Storage getLegacyStorage() {
		return legacyStorage;
	}
	
	public void setLegacyStorage(Storage legacyStorage) {
		this.legacyStorage = legacyStorage;
	}
	
	public String getBarcode() {
		return barcode;
	}
	
	public void setBarcode(String barcode) {
		this.barcode = barcode;
	}
	
	public String getPathLabel() {
		return pathLabel;
	}
	
	public void setPathLabel(String pathLabel) {
		this.pathLabel = pathLabel;
	}
	
	public Integer getPathDepth() {
		return pathDepth;
	}
	
	public void setPathDepth(Integer pathDepth) {
		this.pathDepth = pathDepth;
	}
	
	public Integer getRowsCount() {
		return rowsCount;
	}
	
	public void setRowsCount(Integer rowsCount) {
		this.rowsCount = rowsCount;
	}
	
	public Integer getColumnsCount() {
		return columnsCount;
	}
	
	public void setColumnsCount(Integer columnsCount) {
		this.columnsCount = columnsCount;
	}
	
	public Integer getLayersCount() {
		return layersCount;
	}
	
	public void setLayersCount(Integer layersCount) {
		this.layersCount = layersCount;
	}
	
	public String getSlotPattern() {
		return slotPattern;
	}
	
	public void setSlotPattern(String slotPattern) {
		this.slotPattern = slotPattern;
	}
	
	public String getSlotSeparator() {
		return slotSeparator;
	}
	
	public void setSlotSeparator(String slotSeparator) {
		this.slotSeparator = slotSeparator;
	}
	
	public Boolean getSlot() {
		return slot;
	}
	
	public void setSlot(Boolean slot) {
		this.slot = slot;
	}
	
	public String getStorageConditionType() {
		return storageConditionType;
	}
	
	public void setStorageConditionType(String storageConditionType) {
		this.storageConditionType = storageConditionType;
	}
	
	public Double getMinTemperature() {
		return minTemperature;
	}
	
	public void setMinTemperature(Double minTemperature) {
		this.minTemperature = minTemperature;
	}
	
	public Double getMaxTemperature() {
		return maxTemperature;
	}
	
	public void setMaxTemperature(Double maxTemperature) {
		this.maxTemperature = maxTemperature;
	}
	
	public Integer getCapacity() {
		return capacity;
	}
	
	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
	}
	
	public String getMetadataJson() {
		return metadataJson;
	}
	
	public void setMetadataJson(String metadataJson) {
		this.metadataJson = metadataJson;
	}
}
