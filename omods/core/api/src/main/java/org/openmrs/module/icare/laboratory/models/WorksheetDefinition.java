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

	@Column(name = "header_fields", nullable = true)
	private String headerFields;
	
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

	public String getHeaderFields() {
		return headerFields;
	}

	public void setHeaderFields(String headerFields) {
		this.headerFields = headerFields;
	}

	public static WorksheetDefinition fromMap(Map<String, Object> worksheetDefinitionMap) {
		
		WorksheetDefinition worksheetDefinition = new WorksheetDefinition();
		worksheetDefinition.setCode(worksheetDefinitionMap.get("code").toString());
		if(worksheetDefinitionMap.get("header_fields") != null){
			worksheetDefinition.setHeaderFields(worksheetDefinitionMap.get("header_fields").toString());
		}
		
		Worksheet worksheet = new Worksheet();
		worksheet.setUuid(((Map) worksheetDefinitionMap.get("worksheet")).get("uuid").toString());
		worksheetDefinition.setWorksheet(worksheet);
		
		return worksheetDefinition;
	}
	
	public Map<String,Object> toMap(){

		Map<String,Object> worksheetDefinitionObject = new HashMap<>();
		worksheetDefinitionObject.put("code",this.getCode());
		if(this.getHeaderFields() != null){
			worksheetDefinitionObject.put("header_fields",this.getHeaderFields());
		}

		Map<String,Object> worksheetObject = new HashMap<>();
		worksheetObject.put("uuid",this.getWorksheet().getUuid());
		worksheetObject.put("display",this.getWorksheet().getName());
		worksheetObject.put("code",this.getWorksheet().getCode());
		worksheetObject.put("rows",this.getWorksheet().getRows());
		worksheetObject.put("columns",this.getWorksheet().getColumns());
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
