package org.openmrs.module.icare.billing.services.payment.gepg;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.Map;

import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Service
public class GEPGService {
	
	public Map<String, Object> submitGepgRequest(String jsonPayload) throws Exception {
		System.out.println("on submit here ...................."+ jsonPayload);
        String apiUrl = "https://api-testengine.udsm.ac.tz/index.php?r=api/service";
        String apiKey = ""; 
        String secretKey = "";

        URL url = new URL(apiUrl);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("POST");
        String bearer = String.format("Bearer %1s", "authToken.getAccessToken()");
        con.addRequestProperty("Authorization", bearer);
        con.addRequestProperty("Content-Type", "application/json");
        con.setDoInput(true);
        con.setDoOutput(true);

        OutputStream os = con.getOutputStream();
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, "UTF-8"));
        String json = new ObjectMapper().writeValueAsString(jsonPayload);
        writer.write(json);

        writer.flush();
        writer.close();
        os.close();
        Map<String, Object> responseMap = new HashMap<>();
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer content = new StringBuffer();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            responseMap.put("response", jsonPayload);
            return responseMap;
        } catch (SocketTimeoutException e) {
            throw e;
        }
    }
	
	//	@Override
	//	public String toString() {
	//		return "GEPGService []";
	//	}
	//
	public void createBillSubmissionRequest(String anyString) throws Exception {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException("Unimplemented method 'createBillSubmissionRequest'");
	}
}
