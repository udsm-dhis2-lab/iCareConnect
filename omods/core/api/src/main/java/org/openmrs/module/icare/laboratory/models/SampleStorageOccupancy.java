package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "lb_sample_storage_occupancy")
public class SampleStorageOccupancy extends BaseOpenmrsData implements java.io.Serializable {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "sample_storage_occupancy_id", nullable = false, unique = true)
	private Integer id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sample_id", nullable = false)
	private Sample sample;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "slot_location_id", nullable = false)
	private StorageLocation slotLocation;
	
	@Column(name = "occupancy_type", length = 32)
	private String occupancyType;
	
	@Column(name = "full_address", length = 1024)
	private String fullAddress;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "stored_at", nullable = false)
	private Date storedAt;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "released_at")
	private Date releasedAt;
	
	@Column(name = "active_occupancy")
	private Boolean activeOccupancy;
	
	@Column(name = "disposed")
	private Boolean disposed;
	
	@Column(name = "quantity_stored")
	private Double quantityStored;
	
	@Column(name = "quantity_unit", length = 64)
	private String quantityUnit;
	
	@Column(name = "remarks", length = 65535)
	private String remarks;
	
	public Map<String, Object> toMap() {
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("uuid", this.getUuid());
		data.put("id", this.getId());
		data.put("occupancyType", this.getOccupancyType());
		data.put("fullAddress", this.getFullAddress());
		data.put("storedAt", this.getStoredAt());
		data.put("releasedAt", this.getReleasedAt());
		data.put("activeOccupancy", this.getActiveOccupancy());
		data.put("disposed", this.getDisposed());
		data.put("quantityStored", this.getQuantityStored());
		data.put("quantityUnit", this.getQuantityUnit());
		data.put("remarks", this.getRemarks());
		if (this.getSample() != null) {
			Map<String, Object> sampleMap = new HashMap<String, Object>();
			sampleMap.put("uuid", this.getSample().getUuid());
			sampleMap.put("display", this.getSample().getLabel());
			sampleMap.put("label", this.getSample().getLabel());
			data.put("sample", sampleMap);
		}
		if (this.getSlotLocation() != null) {
			data.put("slotLocation", this.getSlotLocation().toMap());
		}
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
	
	public Sample getSample() {
		return sample;
	}
	
	public void setSample(Sample sample) {
		this.sample = sample;
	}
	
	public StorageLocation getSlotLocation() {
		return slotLocation;
	}
	
	public void setSlotLocation(StorageLocation slotLocation) {
		this.slotLocation = slotLocation;
	}
	
	public String getOccupancyType() {
		return occupancyType;
	}
	
	public void setOccupancyType(String occupancyType) {
		this.occupancyType = occupancyType;
	}
	
	public String getFullAddress() {
		return fullAddress;
	}
	
	public void setFullAddress(String fullAddress) {
		this.fullAddress = fullAddress;
	}
	
	public Date getStoredAt() {
		return storedAt;
	}
	
	public void setStoredAt(Date storedAt) {
		this.storedAt = storedAt;
	}
	
	public Date getReleasedAt() {
		return releasedAt;
	}
	
	public void setReleasedAt(Date releasedAt) {
		this.releasedAt = releasedAt;
	}
	
	public Boolean getActiveOccupancy() {
		return activeOccupancy;
	}
	
	public void setActiveOccupancy(Boolean activeOccupancy) {
		this.activeOccupancy = activeOccupancy;
	}
	
	public Boolean getDisposed() {
		return disposed;
	}
	
	public void setDisposed(Boolean disposed) {
		this.disposed = disposed;
	}
	
	public Double getQuantityStored() {
		return quantityStored;
	}
	
	public void setQuantityStored(Double quantityStored) {
		this.quantityStored = quantityStored;
	}
	
	public String getQuantityUnit() {
		return quantityUnit;
	}
	
	public void setQuantityUnit(String quantityUnit) {
		this.quantityUnit = quantityUnit;
	}
	
	public String getRemarks() {
		return remarks;
	}
	
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
}
