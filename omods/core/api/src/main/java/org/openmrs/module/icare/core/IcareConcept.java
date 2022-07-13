package org.openmrs.module.icare.core;

import java.util.HashMap;
import java.util.Map;

public class IcareConcept {
	
	private String uuid;
	
	private String name;
	
	public String getUuid() {
		return uuid;
	}
	
	public String getName() {
		return name;
	}
	
	public Map<String, Object> toMap() {
		Map<String, Object> icareConceptMap = new HashMap<String, Object>();
		icareConceptMap.put("uuid", this.getUuid());
		icareConceptMap.put("name", this.getName());
		return icareConceptMap;
	}
}
