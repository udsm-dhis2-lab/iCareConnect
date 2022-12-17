package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "lb_worksheet_definition")
public class WorksheetDefinition extends BaseOpenmrsData implements java.io.Serializable {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "worksheet_definition_id", unique = true, nullable = false)
	private Integer id;
	
	@Column(name = "code", length = 30)
	private String code;
	
	@ManyToOne
	@JoinColumn(name = "worksheet_id")
	private Worksheet worksheet;
	
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
	
	public Worksheet getWorksheet() {
		return worksheet;
	}
	
	public void setWorksheet(Worksheet worksheet) {
		this.worksheet = worksheet;
	}

	public static WorksheetDefinition fromMap(Map<String,Object> worksheetDefinitionMap){

		WorksheetDefinition worksheetDefinition = new WorksheetDefinition();
		worksheetDefinition.setCode(worksheetDefinitionMap.get("code").toString());

		Worksheet worksheet = new Worksheet();
		worksheet.setUuid(((Map) worksheetDefinitionMap.get("worksheet")).get("uuid").toString());
		worksheetDefinition.setWorksheet(worksheet);

		return worksheetDefinition;
	}

	public Map<String,Object> toMap(){

		Map<String,Object> worksheetDefinitionObject = new HashMap<>();
		worksheetDefinitionObject.put("code",this.getCode());

		Map<String,Object> worksheetObject = new HashMap<>();
		worksheetObject.put("uuid",this.worksheet.getUuid());
		worksheetObject.put("display",this.worksheet.getName());
		worksheetDefinitionObject.put("worksheet",worksheetObject);

		if (this.creator != null){
			Map<String,Object> userObject = new HashMap<>();
			userObject.put("uuid",this.getCreator().getUuid());
			userObject.put("display",this.getCreator().getDisplayString());
			worksheetDefinitionObject.put("creator",userObject);
		}

		return worksheetDefinitionObject;
	}
}
