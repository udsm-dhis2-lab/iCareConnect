package org.openmrs.module.icare.billing.services.insurance;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class InsurancesServices {
	
	private static final String API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/AuthorizeCard";
	
	private static final String TOKEN_URL = "https://verification.nhif.or.tz/authserver/connect/token";
	
	private static final String CLIENT_ID = "04626";
	
	private static final String CLIENT_SECRET = "mXW2OcsZMBCLpWFMX6/I5A==";
	
	private static final String SCOPE = "OnlineServices";
	
	private static final String USERNAME = "hmis_username";
	
	private final ObjectMapper objectMapper = new ObjectMapper();
	
	/**
	 * Retrieves an authentication token from NHIF.
	 * 
	 * @return Access token as a string, or null if failed.
	 */
	public String getAuthToken() {
        try {
            URL url = new URL(TOKEN_URL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // Set request properties
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            connection.setRequestProperty("User-Agent", "Java-Client");

            // Prepare the request body
            String requestBody = "grant_type=" + URLEncoder.encode("client_credentials", StandardCharsets.UTF_8) +
                    "&client_id=" + URLEncoder.encode(CLIENT_ID, StandardCharsets.UTF_8) +
                    "&client_secret=" + URLEncoder.encode(CLIENT_SECRET, StandardCharsets.UTF_8) +
                    "&scope=" + URLEncoder.encode(SCOPE, StandardCharsets.UTF_8) +
                    "&username=" + URLEncoder.encode(USERNAME, StandardCharsets.UTF_8);

            // Send request
            connection.setDoOutput(true);
            try (OutputStream os = connection.getOutputStream()) {
                os.write(requestBody.getBytes(StandardCharsets.UTF_8));
            }

            // Read response
            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }

                    // Parse JSON response
                    JsonNode jsonNode = objectMapper.readTree(response.toString());
                    return jsonNode.has("access_token") ? jsonNode.get("access_token").asText() : null;
                }
            } else {
                System.out.println("Failed to get token: " + responseCode);
                return null;
            }
        } catch (Exception e) {
            System.out.println("Error getting token: " + e.getMessage());
            return null;
        }
    }
	
	/**
	 * Sends a request to NHIF for card authorization.
	 * 
	 * @param jsonPayload The JSON payload.
	 * @return Response from the API.
	 */
	public Map<String, Object> getAuthorization(String jsonPayload) {
        Map<String, Object> responseMap = new HashMap<>();

        // Validate payload
        String validationError = validatePayload(jsonPayload);
        if (validationError != null) {
            responseMap.put("status", 400);
            responseMap.put("error", validationError);
            return responseMap;
        }

        // Get Auth Token
        String token = getAuthToken();
        if (token == null) {
            responseMap.put("status", 401);
            responseMap.put("error", "Failed to obtain authentication token");
            return responseMap;
        }

        HttpURLConnection connection = null;
        try {
            // Create URL object
            URL url = new URL(API_URL);
            connection = (HttpURLConnection) url.openConnection();

            // Set request method and headers
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setDoOutput(true);

            // Send request payload
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Read response
            int responseCode = connection.getResponseCode();
            responseMap.put("status", responseCode);

            InputStream responseStream = (responseCode < 400) ? connection.getInputStream() : connection.getErrorStream();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(responseStream))) {
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                responseMap.put("body", response.toString());
            }
        } catch (Exception e) {
            responseMap.put("error", e.getMessage());
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
        return responseMap;
    }
	
	/**
	 * Validates if all required fields are present in the payload.
	 * 
	 * @param jsonPayload JSON string payload.
	 * @return Error message if validation fails, otherwise null.
	 */
	private String validatePayload(String jsonPayload) {
		try {
			JsonNode jsonNode = objectMapper.readTree(jsonPayload);
			String[] requiredFields = { "cardNo", "biometricMethod", "nationalID", "fpCode", "imageData", "visitTypeID",
			        "referralNo", "remarks" };
			
			for (String field : requiredFields) {
				if (!jsonNode.has(field) || jsonNode.get(field).asText().trim().isEmpty()) {
					return "Missing or empty field: " + field;
				}
			}
		}
		catch (Exception e) {
			return "Invalid JSON format: " + e.getMessage();
		}
		return null;
	}
	
	public Map<String, Object> getPreapproval(String jsonPayload) {
		return null;
	}
	
	public Map<String, Object> getpoCreference(String jsonPayload) {
		return null;
	}
	
	public Map<String, Object> getissueRequest(String jsonPayload) {
		return null;
	}
}
