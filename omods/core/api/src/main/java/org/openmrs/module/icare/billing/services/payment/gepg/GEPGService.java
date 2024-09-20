package org.openmrs.module.icare.billing.services.payment.gepg;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.openmrs.GlobalProperty;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.springframework.stereotype.Service;

@Service
public class GEPGService {
	
	public Map<String, Object> submitGepgRequest(String jsonPayload, String signature ,String uccUrl) {
        Map<String, Object> responseMap = new HashMap<>();
        HttpURLConnection con = null;
        AdministrationService administrationService = Context.getAdministrationService();

        try {
            String apiUrl = uccUrl;
            URL url = new URL(apiUrl);
            con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");

            String bearer = String.format("Bearer %1s", "authToken.getAccessToken()");
            con.addRequestProperty("Authorization", bearer);
            con.addRequestProperty("Content-Type", "application/json");
            con.addRequestProperty("Signature", signature);
            con.setDoInput(true);
            con.setDoOutput(true);

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

            // Process the response maped object
            int responseCode = con.getResponseCode();
            responseMap.put("Code", responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
                    String inputLine;
                    StringBuilder content = new StringBuilder();
                    while ((inputLine = in.readLine()) != null) {
                        content.append(inputLine);
                    }
                    responseMap.put("response", content.toString());
                }
            } else {
                try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(con.getErrorStream()))) {
                    String errorLine;
                    StringBuilder errorContent = new StringBuilder();
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorContent.append(errorLine);
                    }
                    responseMap.put("error", errorContent.toString());
                }
            }

        } catch (SocketTimeoutException e) {
            responseMap.put("Code", 504);
            responseMap.put("error", "Request timed out: " + e.getMessage());
        } catch (IOException e) {
            responseMap.put("Code", 500);
            responseMap.put("error", "I/O error: " + e.getMessage());
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
	
	public void createBillSubmissionRequest(String anyString) throws Exception {
		throw new UnsupportedOperationException("Error on method 'createBillSubmissionRequest'");
	}
}
