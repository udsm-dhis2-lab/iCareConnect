package org.openmrs.module.icare.billing.services.payment.gepg;

import java.util.Map;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class GEPGService {
	
	public Map<String, Object> submitGepgRequest(String jsonPayload) {
		System.out.println("on submit here ....................");
        String apiUrl = "https://api-testengine.udsm.ac.tz/index.php?r=api/service";
        String apiKey = ""; 
        String secretKey = ""; 

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Signature", secretKey);
		System.out.println(jsonPayload);
        HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

        System.out.println("Request payload: " + jsonPayload);
        System.out.println("Response: " + response.getBody());

        // Convert JSON response to Map
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> responseMap = new HashMap<>();
        try {
            responseMap = mapper.readValue(response.getBody(), Map.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return responseMap;
    }
	
	@Override
	public String toString() {
		return "GEPGService []";
	}
	
	public void createBillSubmissionRequest(String anyString) {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException("Unimplemented method 'createBillSubmissionRequest'");
	}
}
