package org.openmrs.module.icare.web.controller;

import org.openmrs.module.icare.billing.services.payment.gepg.GEPGService;
import org.openmrs.module.icare.billing.services.payment.gepg.BillSubmissionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.Map;

@RestController
@RequestMapping("/api/gepg")
public class GepgBillingController {
	
	@Autowired
	private GEPGService gepgbillService;
	
	@RequestMapping(value = "/controlNumber", method = RequestMethod.POST)
	public String submitBill(@RequestBody Map<String, String> payload) {
		String uuid = payload.get("uuid");
		System.out.println("uuid: " + uuid);
		if (uuid == null || uuid.isEmpty()) {
			return "UUID is required";
		}
		System.out.println("sent payload ..........................." + payload);
		
		String jsonPayload = null;
		
		try {
            BillSubmissionRequest billRequest = BillSubmissionRequest.createBillSubmissionRequest(uuid);
            jsonPayload = billRequest.toJson();
            System.out.println(jsonPayload);
			System.out.println("Generated BillSubmissionRequest: " + jsonPayload);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
			return "Error generating JSON payload";
        }
		
		return jsonPayload;
	}
}
