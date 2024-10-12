package org.openmrs.module.icare.billing.services.payment.gepg;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.openmrs.GlobalProperty;

@Service
public class GEPGService {

    // A map to hold callback responses based on the request ID
    private final Map<String, Map<String, Object>> callbackResponses = new ConcurrentHashMap<>();

    // Synchronized method to submit GePG request and wait for the callback
    public Map<String, Object> submitGepgRequest(String jsonPayload, String signature, String uccUrl) {
        Map<String, Object> responseMap = new HashMap<>();
        HttpURLConnection con = null;
        AdministrationService administrationService = Context.getAdministrationService();

        try {
            String apiUrl = uccUrl;
            URL url = new URL(apiUrl);
            con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.addRequestProperty("Authorization", "Bearer " + "authToken.getAccessToken()");
            con.addRequestProperty("Content-Type", "application/json");
            con.addRequestProperty("Signature", signature);
            con.setDoInput(true);
            con.setDoOutput(true);

            // Save the signature globally
            GlobalProperty globalProperty = new GlobalProperty();
            globalProperty.setProperty("gepg.signSignature.icareConnect");
            globalProperty.setPropertyValue(signature);
            administrationService.saveGlobalProperty(globalProperty);

            // Write JSON payload
            try (OutputStream os = con.getOutputStream();
                 BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, "UTF-8"))) {
                writer.write(jsonPayload);
                writer.flush();
            }

            // Process the response
            int responseCode = con.getResponseCode();
            responseMap.put("Code", responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
                    String inputLine;
                    StringBuilder content = new StringBuilder();
                    while ((inputLine = in.readLine()) != null) {
                        content.append(inputLine);
                    }
                    String responseString = content.toString();
                    responseMap.put("response", responseString);

                    // Extract SystemAckCode and check if it's "R3001"
                    if (responseString.contains("\"SystemAckCode\":\"R3001\"")) {
                        String requestId = extractRequestId(responseString); 

                        // Wait for the callback data for up to 2 minutes
                        synchronized (this) {
                            // waitForCallbackResponse(requestId, responseMap);
                        }
                    }
                }
            } else {
                try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(con.getErrorStream()))) {
                    StringBuilder errorContent = new StringBuilder();
                    String errorLine;
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorContent.append(errorLine);
                    }
                    responseMap.put("error", errorContent.toString());
                }
            }
        } catch (Exception e) {
            responseMap.put("Code", 500);
            responseMap.put("error", "Unexpected error: " + e.getMessage());
        } finally {
            if (con != null) {
                con.disconnect();
            }
        }
        return responseMap;
    }

     // Method to process the callback response
     public Map<String, Object> processGepgCallbackResponse(Map<String, Object> callbackData) {
        System.out.println("Processing callback data: " + callbackData);
    
        Map<String, Object> response = new HashMap<>();
    
        try {
            if (callbackData.containsKey("Status")) {
                Map<String, Object> status = (Map<String, Object>) callbackData.get("Status");
                String requestId = (String) status.get("RequestId");
                
                callbackResponses.put(requestId, status);
    
                response.put("status", "success");
                response.put("message", "Callback processed successfully");
                response.put("data", callbackData);
            } else {
                System.out.println("Status field not found in callback data");
                response.put("status", "error");
                response.put("message", "Status field not found in callback data");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Internal server error");
            response.put("error", e.getMessage());
        }
    
        return response;
    }
    

    // Helper method to extract RequestId from the response
    private String extractRequestId(String responseString) {
        // Logic to extract RequestId from the response JSON
        // You can use a JSON parser or simple string manipulation here
        return responseString.contains("RequestId") ? responseString.split("RequestId\":\"")[1].split("\"")[0] : null;
    }

    // Method to save callback data
    public void saveCallbackData(String requestId, Map<String, Object> callbackData) {
        callbackResponses.put(requestId, callbackData);
    }
}