package org.openmrs.module.icare.core.utils;

import java.util.Map;

public class StaticHelper {
	
	public static String getUuid(Object uuidOrObject) {
		if (uuidOrObject instanceof Map) {
			return (String) ((Map<?, ?>) uuidOrObject).get("uuid");
		} else {
			return (String) uuidOrObject;
		}
	}
}
