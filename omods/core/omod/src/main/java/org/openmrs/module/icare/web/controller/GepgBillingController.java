package org.openmrs.module.icare.web.controller;

import java.util.HashMap;
import org.openmrs.GlobalProperty;
import org.openmrs.Patient;
import org.openmrs.Visit;
import org.openmrs.api.AdministrationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openmrs.api.context.Context;
import org.openmrs.api.context.ContextAuthenticationException;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.billing.models.Payment;
import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.billing.services.payment.gepg.BillSubmissionRequest;
import org.openmrs.module.icare.billing.services.payment.gepg.GEPGService;
import org.openmrs.module.icare.billing.services.payment.gepg.SignatureUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.openmrs.module.webservices.rest.web.RestConstants;

import java.util.*;

@RestController
@RequestMapping(value = "/rest/" + RestConstants.VERSION_1 + "/gepg")
public class GepgBillingController {
	
	@Autowired
	private GEPGService gepgbillService;
	
	@Autowired
	private BillingService billingService;
	
	@RequestMapping(value = "/generatecontrolno", method = RequestMethod.POST)
    public Map<String, Object> generateControlNumber(@RequestBody List<Map<String, Object>> requestPayload)
            throws Exception {
        Map<String, Object> generatedControlNumberObject = new HashMap<>();
        System.out.println("Payload received: " + requestPayload);

        Visit visit = null;
        Double totalBillAmount = 0.0;
        String currency = null;
        String billId= null;
        List<InvoiceItem> invoiceItems = new ArrayList<>();

        for (Map<String, Object> invoiceReference : requestPayload) {
            String uuid = (String) invoiceReference.get("uuid");
            if (uuid == null) {
                throw new IllegalArgumentException("UUID cannot be null");
            }

            if (currency == null) {
                currency = (String) invoiceReference.get("currency");
            }

            Invoice invoice = billingService.getInvoiceDetailsByUuid(uuid);
            billId =  invoice.getId().toString();
            System.out.println("Invoice: " + invoice);

            if (invoice == null) {
                throw new IllegalStateException("Invoice not found for UUID: " + uuid);
            }

            visit = invoice.getVisit();
            if (visit == null) {
                throw new IllegalStateException("Visit cannot be null for Invoice: " + uuid);
            }

            for (InvoiceItem invoiceItem : invoice.getInvoiceItems()) {
                totalBillAmount += invoiceItem.getPrice();
                invoiceItems.add(invoiceItem);
            }
        }

        AdministrationService administrationService = Context.getAdministrationService();
        Date billExpDate = new Date();
        String personPhoneNumberAttributeTypeUuid = administrationService
                .getGlobalProperty(ICareConfig.PHONE_NUMBER_ATTRIBUTE);
        String spCode = administrationService.getGlobalProperty(ICareConfig.SP_CODE);
        String systemCode = administrationService.getGlobalProperty(ICareConfig.GEPG_SYSTEM_CODE);
        String serviceCode = administrationService.getGlobalProperty(ICareConfig.SERVICE_CODE);
        String spsyId = administrationService.getGlobalProperty(ICareConfig.SERVICE_PROVIDER_ID);
        String subSpCode = administrationService.getGlobalProperty(ICareConfig.SUB_SERVICE_PROVIDER_CODE);
        String personEmailAttributeTypeUuid = administrationService
                .getGlobalProperty(ICareConfig.ICARE_PERSON_EMAIL_ATTRIBUTE_TYPE);
        String gepgAuthSignature = administrationService.getGlobalProperty(ICareConfig.GEPG_AUTH_SIGNATURE);
        String GFSCodeConceptSourceMappingUuid = administrationService
                .getGlobalProperty(ICareConfig.GFSCODE_CONCEPT_SOURCE_REFERENCE);
        String GEPGUccBaseUrl = administrationService.getGlobalProperty(ICareConfig.GEPG_UCC_BASE_URL_API);
        String clientPrivateKey = administrationService.getGlobalProperty(ICareConfig.CLIENT_PRIVATE_KEY);
        String enginepublicKey = administrationService.getGlobalProperty(ICareConfig.ENGINE_PUBLIC_KEY);
        String pkcs12Path = administrationService.getGlobalProperty(ICareConfig.PKCS12_PATH);
        String pkcs12Password = administrationService.getGlobalProperty(ICareConfig.PKCS12_PASSWORD);
         

        if (currency == null) {
            throw new IllegalArgumentException("Currency cannot be null");
        }
        if (personPhoneNumberAttributeTypeUuid == null || gepgAuthSignature == null) {
            throw new IllegalStateException("One or more global properties are missing");
        }

        // Create the GePG payload using BillSubmissionRequest
        BillSubmissionRequest billSubmissionRequest = new BillSubmissionRequest();
        Map<String, Object> gepgPayloadResponse = billingService.createGePGPayload(
                visit.getPatient(),
                invoiceItems,
                totalBillAmount,
                billExpDate,
                personPhoneNumberAttributeTypeUuid,
                personEmailAttributeTypeUuid,
                currency,
                gepgAuthSignature,
                GFSCodeConceptSourceMappingUuid,
                spCode,
                systemCode,
                serviceCode,
                spsyId,
                subSpCode,
                clientPrivateKey,
                pkcs12Path,
                pkcs12Password,
                enginepublicKey,billId);

        try {
            // billRequest from the gepgPayloadResponse map
            BillSubmissionRequest billRequest = (BillSubmissionRequest) gepgPayloadResponse.get("billRequest");
            String billPayload = billRequest.toJson();
            System.out.println("Generated BillSubmissionRequest: " + billPayload);

            // Save the payload in a global property
            GlobalProperty globalProperty = new GlobalProperty();
            globalProperty.setProperty("gepg.jsonPayload.icareConnect");
            globalProperty.setPropertyValue(billPayload);
            administrationService.saveGlobalProperty(globalProperty);

            // Submit the request and get the response
            generatedControlNumberObject = gepgbillService.submitGepgRequest(billPayload,
                    (String) gepgPayloadResponse.get("signature"), GEPGUccBaseUrl);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return generatedControlNumberObject;
    }
	
	@RequestMapping(value = "/callback", method = RequestMethod.POST)
    public ResponseEntity<Map<String ,Object>> handleCallback(@RequestBody(required = false) Map<String, Object> callbackData) throws Exception {
	     AdministrationService administrationService = Context.getAdministrationService();
	
	     // GePG user credentials
	     String gepgUsername = administrationService.getGlobalProperty(ICareConfig.GEPG_USERNAME);
	     String gepgPassword = administrationService.getGlobalProperty(ICareConfig.GEPG_PASSWORD);
	
	     String signature = (String) ((Map<String, Object>) callbackData.get("SystemAuth")).get("Signature");
	
	     Map<String, Object> feedbackData = (Map<String, Object>) callbackData.get("FeedbackData");
	
	     String payload = new ObjectMapper().writeValueAsString(feedbackData);
	
	     String enginePublicKey = administrationService.getGlobalProperty(ICareConfig.ENGINE_PUBLIC_KEY);
	
	     try {
	
	         Context.authenticate(gepgUsername, gepgPassword);
	         //TODOO
	         //Agreed to proceed with verification after UUCC insuring lenght of signature
	         // boolean isVerified = SignatureUtils.verifyData(payload, signature, enginePublicKey);
	
	         // if (!isVerified) {
	         //     Map<String, Object> errorResponse = new HashMap<>();
	         //     errorResponse.put("status", "error");
	         //     errorResponse.put("message", "Signature verification failed");
	         //     return errorResponse;
	         // }
	         return ResponseEntity.ok(billingService.processGepgCallbackResponse(callbackData)) ;
	
	     } catch (ContextAuthenticationException e) {
	         Map<String, Object> errorResponse = new HashMap<>();

	         errorResponse.put("status", "error");
	         errorResponse.put("message", "Authentication failed: " + e.getMessage());
	         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse) ;
	     } finally {
	         Context.logout();
	     }
	 }
	
	@RequestMapping(value = "/paymentsRequests", method = RequestMethod.GET)
    public Map<String, Object> getPaymentsWithStatus() throws Exception {
    // Fetch payments from the service layer
    List<Payment> payments = billingService.getAllPaymentsWithStatus();
    
    // Create response map
    Map<String, Object> response = new HashMap<>();
    response.put("status", "success");
    response.put("data", payments); 

       return response;
    }
}
