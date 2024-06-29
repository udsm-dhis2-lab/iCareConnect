package org.openmrs.module.icare.web.controller;

import org.openmrs.Patient;
import org.openmrs.Visit;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.billing.services.payment.gepg.GEPGService;
import org.openmrs.module.icare.billing.services.payment.gepg.BillSubmissionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.openmrs.module.webservices.rest.web.RestConstants;

import java.util.*;

@RestController
@RequestMapping(value = "/api/" + RestConstants.VERSION_1 + "/gepg")
public class GepgBillingController {
	
	@Autowired
	private GEPGService gepgbillService;
	private BillingService billingService;
	
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

	@RequestMapping(value = "/generatecontrolno", method = RequestMethod.POST)
	public Map<String, Object> generateControlNumber(@RequestBody List<Map<String, Object>> requestPayload) throws Exception {
		Map<String, Object> generatedControlNumberObject = new HashMap<>();
		// Assumption all invoices for generating control number are from one visit
		// If its different visit, then thats another case
		// Also ya currency type for payment is the same (supplied from front-end)
		Visit visit = new Visit();
		Double totalBillAmount = new Double(2);
		String currency = null;
		List<InvoiceItem> invoiceItems = new ArrayList<InvoiceItem>();
		for(Map<String, Object> invoiceReference: requestPayload) {
			String uuid = invoiceReference.get("uuid").toString();
			if (currency == null) {
				currency = invoiceReference.get("currency").toString();
			}
			Invoice invoice = billingService.getInvoiceDetailsByUuid(uuid);
			visit = invoice.getVisit();
			for(InvoiceItem invoiceItem: invoice.getInvoiceItems()) {
				totalBillAmount+= invoiceItem.getPrice();
				invoiceItems.add(invoiceItem);
			}

		}
		//TODO: Get from global property or any other configurations
		AdministrationService administrationService = Context.getAdministrationService();
		Date billExpDate = new Date(); // TODO: This should be evaluated (Check how as per your needs)
		String personPhoneNumberAttributeTypeUuid = administrationService.getGlobalProperty(ICareConfig.PHONE_NUMBER_ATTRIBUTE);
		String personEmailAttributeTypeUuid = administrationService.getGlobalProperty(ICareConfig.ICARE_PERSON_EMAIL_ATTRIBUTE_TYPE);
		String gepgAuthSignature = administrationService.getGlobalProperty(ICareConfig.GEPG_AUTH_SIGNATURE);
		String GFSCodeConceptSourceMappingUuid = administrationService.getGlobalProperty(ICareConfig.GFSCODE_CONCEPT_SOURCE_REFERENCE);
		BillSubmissionRequest billRequest = new BillSubmissionRequest().createGePGPayload(
				visit.getPatient(),
				invoiceItems,
				totalBillAmount,
				billExpDate,
				personPhoneNumberAttributeTypeUuid,
				personEmailAttributeTypeUuid,
				currency,
				gepgAuthSignature,
				GFSCodeConceptSourceMappingUuid);
		// TODO: review the above method for creating GePG payload to ensure all properties are there. Exception handling is important e.g checking GFSCode
		return generatedControlNumberObject;
	}
}
