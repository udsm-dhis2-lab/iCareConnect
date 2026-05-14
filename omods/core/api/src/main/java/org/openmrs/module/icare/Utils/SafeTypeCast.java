package org.openmrs.module.icare.Utils;

import java.util.Optional;

public final class SafeTypeCast {
	
	private SafeTypeCast() {
		// Utility class
	}
	
	/**
	 * Safely casts an object to the target type. Returns empty Optional if cast is not possible.
	 */
	public static <T> Optional<T> toOptional(Object value, Class<T> targetType) {
		if (value == null || targetType == null) {
			return Optional.empty();
		}
		if (targetType.isInstance(value)) {
			return Optional.of(targetType.cast(value));
		}
		return Optional.empty();
	}
	
	/**
	 * Safely casts or returns null if not possible.
	 */
	public static <T> T orNull(Object value, Class<T> targetType) {
		return toOptional(value, targetType).orElse(null);
	}
	
	/**
	 * Safely casts or returns the provided default value if cast fails.
	 */
	public static <T> T orDefault(Object value, Class<T> targetType, T defaultValue) {
		return toOptional(value, targetType).orElse(defaultValue);
	}
	
	/**
	 * Casts to target type or throws ClassCastException with clear message. Fails fast if the value
	 * cannot be cast.
	 */
	public static <T> T orThrow(Object value, Class<T> targetType) {
		if (targetType == null) {
			throw new IllegalArgumentException("Target type cannot be null");
		}
		if (value == null) {
			throw new IllegalArgumentException("Cannot cast null to " + targetType.getName());
		}
		if (targetType.isInstance(value)) {
			return targetType.cast(value);
		}
		
		throw new ClassCastException(String.format("Cannot cast %s to %s", value.getClass().getName(), targetType.getName()));
	}
	
	/**
	 * Checks if the value can be safely cast to the target type.
	 */
	public static boolean isCastable(Object value, Class<?> targetType) {
		return value != null && targetType != null && targetType.isInstance(value);
	}
}
