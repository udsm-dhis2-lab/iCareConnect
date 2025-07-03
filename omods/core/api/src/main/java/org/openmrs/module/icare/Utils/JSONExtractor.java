package org.openmrs.module.icare.Utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Optional;

public class JSONExtractor {
	
	private static final ObjectMapper mapper = new ObjectMapper();
	
	/**
	 * Traverses a JSON string using a path of keys and returns the found JsonNode. This is the most
	 * flexible and safe way to read from JSON.
	 * 
	 * @param jsonString The source JSON string.
	 * @param keys A sequence of keys representing the path to the desired node.
	 * @return An Optional containing the JsonNode if the path is valid, otherwise an empty
	 *         Optional.
	 */
	public static Optional<JsonNode> getNodeByPath(String jsonString, String... keys) {
		if (keys == null || keys.length == 0) {
			return Optional.empty();
		}
		try {
			JsonNode currentNode = mapper.readTree(jsonString);
			for (String key : keys) {
				currentNode = currentNode.path(key);
				if (currentNode.isMissingNode()) {
					return Optional.empty();
				}
			}
			return Optional.of(currentNode);
		}
		catch (JsonProcessingException e) {
			System.err.println("Error parsing JSON: " + e.getMessage());
			return Optional.empty();
		}
		catch (IOException e) {
			System.err.println("There is a problem with this JSON: " + e.getMessage());
			return Optional.empty();
		}
	}
	
	/**
	 * A generic helper method that finds a node and converts it to a specific type.
	 * 
	 * @param jsonString The source JSON string.
	 * @param valueType The Class of the desired type (e.g., String.class, Double.class).
	 * @param keys The path to the value.
	 * @return An Optional containing the converted value, or empty if not found or conversion
	 *         fails.
	 */
	public static <T> Optional<T> getValueByPath(String jsonString, Class<T> valueType, String... keys) {
        return getNodeByPath(jsonString, keys).flatMap(node -> {
            try {
                T value = mapper.treeToValue(node, valueType);
                return Optional.ofNullable(value);
            } catch (JsonProcessingException e) {
                System.err.printf("Failed to convert node at path '%s' to type %s%n",
                        String.join(".", keys), valueType.getSimpleName());
                return Optional.empty();
            }
        });
    }
	
	/**
	 * A generic helper for when the target type is a collection (e.g., List<MyObject>).
	 */
	public static <T> Optional<T> getValueByPath(String jsonString, TypeReference<T> valueType, String... keys) {
        return getNodeByPath(jsonString, keys).flatMap(node -> {
            try {
                T value = mapper.convertValue(node, valueType);
                return Optional.ofNullable(value);
            } catch (IllegalArgumentException e) {
                System.err.printf("Failed to convert node at path '%s' to type %s%n",
                        String.join(".", keys), valueType.getType());
                return Optional.empty();
            }
        });
    }
}
