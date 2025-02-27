package org.openmrs.module.icare.billing.services.insurance;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class InsurancesServices {
	
	private static final String API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/AuthorizeCard";
	
	private static final String POC_API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/GeneratePOCReferenceNo";
	
	private static final String POC_GET_API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/GetPointsOfCare";
	
	private static final String VISITYPE_API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/GetVisitTypes";
	
	private static final String TOKEN_URL = "https://verification.nhif.or.tz/authserver/connect/token";
	
	private static final String PREAPPROVAL_API = "https://test.nhif.or.tz/servicehub/api/PreApprovals/RequestServices";
	
	private static final String BENEFICIALY_DETAILS_API = "https://test.nhif.or.tz/servicehub/api/Verification/GetBeneficiaryDetails";
	
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

            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            connection.setRequestProperty("User-Agent", "Java-Client");
            connection.setDoOutput(true);

            String requestBody = "grant_type=" + URLEncoder.encode("client_credentials", "UTF-8") +
                    "&client_id=" + URLEncoder.encode(CLIENT_ID, "UTF-8") +
                    "&client_secret=" + URLEncoder.encode(CLIENT_SECRET, "UTF-8") +
                    "&scope=" + URLEncoder.encode(SCOPE, "UTF-8") +
                    "&username=" + URLEncoder.encode(USERNAME, "UTF-8") +
                    "&password=" + URLEncoder.encode(CLIENT_SECRET, "UTF-8");

            try (OutputStream os = connection.getOutputStream()) {
                os.write(requestBody.getBytes(StandardCharsets.UTF_8));
            }

            int responseCode = connection.getResponseCode();
            InputStream responseStream = (responseCode == 200) ? connection.getInputStream()
                    : connection.getErrorStream();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(responseStream))) {
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }

                if (responseCode != 200) {
                    System.out.println("Failed to get token: HTTP " + responseCode + " | Response: " + response);
                    return null;
                }

                JsonNode jsonNode = new ObjectMapper().readTree(response.toString());
                return jsonNode.has("access_token") ? jsonNode.get("access_token").asText() : null;
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
        String token = getAuthToken();
        if (token == null) {
            responseMap.put("status", 401);
            responseMap.put("error", "Failed to obtain authentication token");
            return responseMap;
        }

        HttpURLConnection connection = null;
        try {
            URL url = new URL(API_URL);
            connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setDoOutput(true);

            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            responseMap.put("status", responseCode);

            InputStream responseStream = (responseCode < 400) ? connection.getInputStream()
                    : connection.getErrorStream();
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
	
	public Map<String, Object> pocNotification(String jsonPayload) {
        Map<String, Object> responseMap = new HashMap<>();

        // String validationError = validatePayload(jsonPayload);
        if (jsonPayload == null) {
            responseMap.put("status", 400);
            responseMap.put("error", "Payload Error");
            return responseMap;
        }

        String token = getAuthToken();
        if (token == null) {
            responseMap.put("status", 401);
            responseMap.put("error", "Failed to obtain authentication token");
            return responseMap;
        }

        HttpURLConnection connection = null;
        try {
            URL url = new URL(POC_API_URL);
            connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setDoOutput(true);

            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            responseMap.put("status", responseCode);

            InputStream responseStream = (responseCode < 400) ? connection.getInputStream()
                    : connection.getErrorStream();
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
	
	public List<Map<String, Object>> getPocOfCare() {
        List<Map<String, Object>> responseList = new ArrayList<>();
        String token = getAuthToken();

        if (token == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", 401);
            errorResponse.put("error", "Failed to obtain authentication token");
            responseList.add(errorResponse);
            return responseList;
        }

        try {
            URL url = new URL(POC_GET_API_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + token);
            conn.setRequestProperty("Accept", "application/json");

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                ObjectMapper objectMapper = new ObjectMapper();
                responseList = objectMapper.readValue(response.toString(), List.class);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Failed to fetch data. HTTP Code: " + responseCode);
                responseList.add(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("exception", e.getMessage());
            responseList.add(errorResponse);
        }

        return responseList;
    }
	
	public List<Map<String, Object>> getVisitTypes() {
        List<Map<String, Object>> visitTypes = new ArrayList<>();
        String token = getAuthToken();

        if (token == null) {
            return Collections.singletonList(
                Map.of("status", 401, "error", "Failed to obtain authentication token")
            );
        }

        try {
            URL url = new URL(VISITYPE_API_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + token);
            conn.setRequestProperty("Accept", "application/json");

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                ObjectMapper objectMapper = new ObjectMapper();
                visitTypes = objectMapper.readValue(response.toString(), new TypeReference<List<Map<String, Object>>>() {});

            } else {
                return Collections.singletonList(
                    Map.of("status", responseCode, "error", "Failed to fetch data. HTTP Code: " + responseCode)
                );
            }
        } catch (Exception e) {
            return Collections.singletonList(
                Map.of("status", 500, "error", "Internal Server Error", "exception", e.getMessage())
            );
        }

        return visitTypes;
    }
	
	public Map<String, Object> getPreapproval(List<Map<String, Object>> requestPayload) {
        Map<String, Object> responseMap = new HashMap<>();

        if (requestPayload == null || requestPayload.isEmpty()) {
            responseMap.put("status", 400);
            responseMap.put("error", "Payload cannot be null or empty");
            return responseMap;
        }

        String token = getAuthToken();
        if (token == null) {
            responseMap.put("status", 401);
            responseMap.put("error", "Failed to obtain authentication token");
            return responseMap;
        }

        String jsonPayload;
        try {
            jsonPayload = new ObjectMapper().writeValueAsString(requestPayload);
        } catch (JsonProcessingException e) {
            responseMap.put("status", 400);
            responseMap.put("error", "Failed to convert payload to JSON");
            return responseMap;
        }

        HttpURLConnection connection = null;
        try {
            URL url = new URL(PREAPPROVAL_API);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setDoOutput(true);

            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            responseMap.put("status", responseCode);

            InputStream responseStream = (responseCode < 400) ? connection.getInputStream()
                    : connection.getErrorStream();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(responseStream))) {
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                responseMap.put("body", response.toString());
            }

        } catch (Exception e) {
            responseMap.put("status", 500);
            responseMap.put("error", "Internal server error: " + e.getMessage());
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }

        return responseMap;
    }
	
	public Map<String, Object> getBeneficialyDetails(String jsonPayload) {
        Map<String, Object> responseMap = new HashMap<>();

        String token = getAuthToken();
        if (token == null) {
            responseMap.put("status", 401);
            responseMap.put("error", "Failed to obtain authentication token");
            return responseMap;
        }

        HttpURLConnection connection = null;
        try {
            URL url = new URL(BENEFICIALY_DETAILS_API);
            connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setDoOutput(true);

            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            responseMap.put("status", responseCode);

            InputStream responseStream = (responseCode < 400) ? connection.getInputStream()
                    : connection.getErrorStream();
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
	
	public Map<String, Object> getissueRequest(String jsonPayload) {
		return null;
	}
}
