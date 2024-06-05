package org.openmrs.module.icare.web.controller;

import org.openmrs.module.icare.billing.services.payment.gepg.GEPGService;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.icare.billing.services.payment.gepg.BillSubmissionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/" + RestConstants.VERSION_1 + "/gepg")
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
		System.out.println("sent payload ..........................."+payload);
		BillSubmissionRequest billSubmissionRequest = new BillSubmissionRequest();
		billSubmissionRequest.createBillSubmissionRequest(uuid);
		System.out.println("Generated BillSubmissionRequest: " + billSubmissionRequest.createBillSubmissionRequest(uuid));
		
		String response = gepgbillService.submitBillRequest(billSubmissionRequest);
		
		return response;
	}
}
