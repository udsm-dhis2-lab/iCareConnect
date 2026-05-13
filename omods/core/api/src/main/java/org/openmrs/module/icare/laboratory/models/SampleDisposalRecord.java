package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "lb_sample_disposal_record")
public class SampleDisposalRecord extends BaseOpenmrsData implements java.io.Serializable {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "sample_disposal_record_id", nullable = false, unique = true)
	private Integer id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sample_id", nullable = false)
	private Sample sample;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "occupancy_id")
	private SampleStorageOccupancy occupancy;
	
	@Column(name = "disposal_method", length = 128)
	private String disposalMethod;
	
	@Column(name = "disposal_reason", length = 65535)
	private String disposalReason;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "disposed_at", nullable = false)
	private Date disposedAt;
	
	@Column(name = "approval_required")
	private Boolean approvalRequired;
	
	@Column(name = "approved")
	private Boolean approved;
	
	@Column(name = "remarks", length = 65535)
	private String remarks;
	
	public Map<String, Object> toMap() {
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("uuid", this.getUuid());
		data.put("id", this.getId());
		data.put("disposalMethod", this.getDisposalMethod());
		data.put("disposalReason", this.getDisposalReason());
		data.put("disposedAt", this.getDisposedAt());
		data.put("approvalRequired", this.getApprovalRequired());
		data.put("approved", this.getApproved());
		data.put("remarks", this.getRemarks());
		if (this.getSample() != null) {
			Map<String, Object> sampleMap = new HashMap<String, Object>();
			sampleMap.put("uuid", this.getSample().getUuid());
			sampleMap.put("display", this.getSample().getLabel());
			sampleMap.put("label", this.getSample().getLabel());
			data.put("sample", sampleMap);
		}
		if (this.getOccupancy() != null) {
			data.put("occupancy", this.getOccupancy().toMap());
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
	
	public SampleStorageOccupancy getOccupancy() {
		return occupancy;
	}
	
	public void setOccupancy(SampleStorageOccupancy occupancy) {
		this.occupancy = occupancy;
	}
	
	public String getDisposalMethod() {
		return disposalMethod;
	}
	
	public void setDisposalMethod(String disposalMethod) {
		this.disposalMethod = disposalMethod;
	}
	
	public String getDisposalReason() {
		return disposalReason;
	}
	
	public void setDisposalReason(String disposalReason) {
		this.disposalReason = disposalReason;
	}
	
	public Date getDisposedAt() {
		return disposedAt;
	}
	
	public void setDisposedAt(Date disposedAt) {
		this.disposedAt = disposedAt;
	}
	
	public Boolean getApprovalRequired() {
		return approvalRequired;
	}
	
	public void setApprovalRequired(Boolean approvalRequired) {
		this.approvalRequired = approvalRequired;
	}
	
	public Boolean getApproved() {
		return approved;
	}
	
	public void setApproved(Boolean approved) {
		this.approved = approved;
	}
	
	public String getRemarks() {
		return remarks;
	}
	
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
}
