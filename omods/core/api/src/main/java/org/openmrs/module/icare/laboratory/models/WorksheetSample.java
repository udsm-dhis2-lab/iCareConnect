package org.openmrs.module.icare.laboratory.models;

import org.hibernate.annotations.Type;
import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;

import java.util.HashMap;
import java.util.Map;

import static javax.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "lb_worksheet_sample")
public class WorksheetSample extends BaseOpenmrsData implements java.io.Serializable {
	
	@Id
	@GeneratedValue(strategy = IDENTITY)
	@Column(name = "worksheet_sample_id", unique = true, nullable = false)
	private Integer id;
	
	@ManyToOne
	@JoinColumn(name = "worksheet_definition_id")
	private WorksheetDefinition worksheetDefinition;
	
	@Column(name = "row", columnDefinition = "TINYINT")
	@Type(type = "org.hibernate.type.IntegerType")
	private Integer row;
	
	@Column(name = "column", columnDefinition = "TINYINT")
	@Type(type = "org.hibernate.type.IntegerType")
	private Integer column;
	
	@ManyToOne
	@JoinColumn(name = "sample_id", nullable = true)
	private Sample sample;

	@ManyToOne
	@JoinColumn(name = "control_id", nullable = true)
	private WorksheetControl worksheetControl;
	
	@Column(name = "type")
	private String type;
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		this.id = id;
	}
	
	public WorksheetDefinition getWorksheetDefinition() {
		return worksheetDefinition;
	}
	
	public void setWorksheetDefinition(WorksheetDefinition worksheetDefinition) {
		this.worksheetDefinition = worksheetDefinition;
	}
	
	public Integer getRow() {
		return row;
	}
	
	public void setRow(Integer row) {
		this.row = row;
	}
	
	public Integer getColumn() {
		return column;
	}
	
	public void setColumn(Integer column) {
		this.column = column;
	}
	
	public Sample getSample() {
		return sample;
	}
	
	public void setSample(Sample sample) {
		this.sample = sample;
	}
	
	public WorksheetControl getWorksheetControl() {
		return worksheetControl;
	}
	
	public void setWorksheetControl(WorksheetControl worksheetControl) {
		this.worksheetControl = worksheetControl;
	}
	
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}

	public static WorksheetSample fromMap(Map<String,Object> worksheetSampleMap){

		WorksheetSample worksheetSample = new WorksheetSample();

		worksheetSample.setRow((Integer)worksheetSampleMap.get("row"));
		worksheetSample.setColumn((Integer)worksheetSampleMap.get("column"));
		worksheetSample.setType(worksheetSampleMap.get("type").toString());

		Sample sample = new Sample();
		sample.setUuid(((Map) worksheetSampleMap.get("sample")).get("uuid").toString());
		worksheetSample.setSample(sample);

		WorksheetDefinition worksheetDefinition = new WorksheetDefinition();
		worksheetDefinition.setUuid(((Map) worksheetSampleMap.get("worksheetDefinition")).get("uuid").toString());
		worksheetSample.setWorksheetDefinition(worksheetDefinition);

		if(worksheetSampleMap.get("worksheetControl") != null) {
			WorksheetControl worksheetControl = new WorksheetControl();
			worksheetControl.setUuid(((Map) worksheetSampleMap.get("worksheetControl")).get("uuid").toString());
		}

		return worksheetSample;
	}

	public Map<String,Object> toMap(){

		Map<String,Object> worksheetSampleObject = new HashMap<>();

		worksheetSampleObject.put("row",this.getRow());
		worksheetSampleObject.put("column",this.getColumn());
		worksheetSampleObject.put("type",this.getType());

		Map<String,Object> worksheetDefinitionObject = new HashMap<>();
		worksheetDefinitionObject.put("uuid",this.getWorksheetDefinition().getUuid());
		worksheetDefinitionObject.put("display",this.getWorksheetDefinition().getCode());
		worksheetSampleObject.put("worksheetDefinition",worksheetDefinitionObject);

		Map<String,Object> sampleObject = new HashMap<>();
		sampleObject.put("uuid",this.getSample().getUuid());
		sampleObject.put("display",this.getSample().getLabel());
		worksheetSampleObject.put("sample",sampleObject);

		if( this.getWorksheetControl() != null){
			Map<String,Object> worksheetControlObject = new HashMap<>();
			worksheetControlObject.put("uuid",this.getWorksheetControl().getUuid());
			worksheetControlObject.put("display",this.getWorksheetControl().getCode());
			worksheetSampleObject.put("worksheetControl",worksheetControlObject);
		}

		if (this.creator != null){
			Map<String,Object> userObject = new HashMap<>();
			userObject.put("uuid",this.getCreator().getUuid());
			userObject.put("display",this.getCreator().getDisplayString());
			worksheetDefinitionObject.put("creator",userObject);
		}
		return worksheetSampleObject;
	}
}
