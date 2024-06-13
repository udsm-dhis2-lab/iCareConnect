package org.openmrs.module.icare.billing.services.payment.gepg;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GEPGService {

    public String submitGepgRequest(String jsonPayload) {
		System.out.println("on submit here ....................");
        String apiUrl = "https://api-testengine.udsm.ac.tz/index.php?r=api/service";
        String apiKey = ""; 
        String secretKey = ""; 

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Signature", secretKey);  // Assuming `secretKey` is used for the signature
		System.out.println(jsonPayload);
        HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

        System.out.println("Request payload: " + jsonPayload);
        System.out.println("Response: " + response.getBody());

        return response.getBody();
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
