package org.openmrs.module.icare.web.controller;

import org.openmrs.module.icare.billing.services.payment.gepg.GEPGService;
import org.openmrs.module.icare.billing.services.payment.gepg.BillSubmissionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.openmrs.module.webservices.rest.web.RestConstants;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/" + RestConstants.VERSION_1 + "/gepg")
public class GepgBillingController {
	
	@Autowired
	private GEPGService gepgbillService;
	
	@RequestMapping(value = "/controlNumber", method = RequestMethod.POST)
	public String submitBill(@RequestBody Map<String, Object> payload) {
		String uuid = (String) payload.get("uuid");
		List<Map<String, String>> selectedBills = (List<Map<String, String>>) payload.get("selectedbills");
		Integer totalBill = (Integer) payload.get("totalBill");
		
		System.out.println("uuid: " + uuid);
		if (uuid == null || uuid.isEmpty()) {
			return "UUID is required";
		}
		System.out.println("sent payload ..........................." + payload);
		
		String jsonPayload = null;
		String response = null;
		
		try {
			// Create an instance of BillSubmissionRequest
			BillSubmissionRequest billRequest = new BillSubmissionRequest().createGepgPayloadRequest(uuid, selectedBills,
			    totalBill);
			// Call the non-static method on the instance
			jsonPayload = billRequest.toJson();
			System.out.println("Generated BillSubmissionRequest: " + jsonPayload);
			response = gepgbillService.submitGepgRequest(jsonPayload);
		}
		catch (JsonProcessingException e) {
			e.printStackTrace();
			return "Error generating JSON payload";
		}
		
		return response;
	}
}
