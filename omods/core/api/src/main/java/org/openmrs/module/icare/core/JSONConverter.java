package org.openmrs.module.icare.core;

import java.util.Map;

public interface JSONConverter {
	
	Map<String, Object> toMap() throws Exception;
	
	Map<String, Object> toMap(Object... params) throws Exception;
}
