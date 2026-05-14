package org.openmrs.module.icare.Utils;

import java.util.Optional;

/**
 * Utility class for safe type casting in Java 11+.
 * Provides both silent-fail and exception-throwing variants.
 */
public final class SafeTypeCast {

    private SafeTypeCast() {
        // Utility class - no instantiation
    }

    /**
     * Safely casts an object to the target type.
     * Returns empty Optional if the cast is not possible (null or wrong type).
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
     * Safely casts an object to the target type.
     * Returns null if the cast is not possible.
     */
    public static <T> T orNull(Object value, Class<T> targetType) {
        return toOptional(value, targetType).orElse(null);
    }

    /**
     * Safely casts an object to the target type.
     * Throws ClassCastException with a clear message if the cast fails.
     */
    public static <T> T orThrow(Object value, Class<T> targetType) {
        if (value == null) {
            throw new IllegalArgumentException("Cannot cast null to " + targetType.getName());
        }
        if (targetType == null) {
            throw new IllegalArgumentException("Target type cannot be null");
        }
        if (targetType.isInstance(value)) {
            return targetType.cast(value);
        }
        throw new ClassCastException(
                String.format("Cannot cast %s to %s",
                        value.getClass().getName(),
                        targetType.getName())
        );
    }

    /**
     * Checks if the value can be safely cast to the target type.
     */
    public static boolean isCastable(Object value, Class<?> targetType) {
        if (value == null || targetType == null) {
            return false;
        }
        return targetType.isInstance(value);
    }
}
