package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "lb_worksheet_sample_status")
public class WorksheetSampleStatus extends BaseOpenmrsData implements java.io.Serializable {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "worksheet_sample_status_id", unique = true, nullable = false)
	private Integer id;
	
	@ManyToOne
	@JoinColumn(name = "worksheet_sample_id", nullable = false)
	private WorksheetSample worksheetSample;
	
	@Column(name = "category", length = 32)
	private String Category;
	
	@Column(name = "status", length = 65535)
	private String status;
	
	@Column(name = "remarks", length = 65535)
	private String remarks;
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		this.id = id;
	}
	
	public String getCategory() {
		return Category;
	}
	
	public void setCategory(String category) {
		Category = category;
	}
	
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getRemarks() {
		return remarks;
	}
	
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
	
	public WorksheetSample getWorksheetSample() {
		return worksheetSample;
	}
	
	public void setWorksheetSample(WorksheetSample worksheetSample) {
		this.worksheetSample = worksheetSample;
	}
	
}
