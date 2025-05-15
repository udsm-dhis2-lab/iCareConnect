package org.openmrs.module.icare.web.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.openmrs.GlobalProperty;
import org.openmrs.Order;
import org.openmrs.Visit;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.openmrs.api.context.ContextAuthenticationException;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.billing.services.payment.gepg.BillSubmissionRequest;
import org.openmrs.module.icare.billing.services.payment.gepg.GEPGService;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

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

        Visit visit = null;
        Double totalBillAmount = 0.0;
        String currency = null;
        String billId = null;

        List<InvoiceItem> invoiceItems = new ArrayList<>();

        for(Map<String, Object> receivedItem : requestPayload){
            Order order = null;
            InvoiceItem invoiceItem;

            Object orderObject = receivedItem.get("order");

            if (orderObject instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> orderMap = (Map<String, Object>) orderObject;

                order = orderMap.get("uuid") != null ? billingService.getOrderByUuid((String) orderMap.get("uuid")) : null;
            }

            if (currency == null) {
                currency = (String) receivedItem.get("currency");
            }


            if (order != null) {
                invoiceItem = billingService.getInvoiceItemByOrder(order);
                totalBillAmount += invoiceItem.getPrice();

                billId = invoiceItem.getInvoice().getId().toString();

                visit = invoiceItem.getInvoice().getVisit();

                if (visit == null) {
                    throw new IllegalStateException("Visit cannot be null for Invoice: " + billId);
                }


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
        Map<String, Object> gepgPayload = billingService.createGePGPayload(
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
                enginepublicKey, billId);

        try {
            BillSubmissionRequest billRequest = (BillSubmissionRequest) gepgPayload.get("billRequest");
            String billPayload = billRequest.toJson();

            generatedControlNumberObject = gepgbillService.submitGepgRequest(billPayload,
                    (String) gepgPayload.get("signature"), GEPGUccBaseUrl);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return generatedControlNumberObject;
    }
	
	@RequestMapping(value = "/callback", method = RequestMethod.POST)
	public ResponseEntity<?> handleCallback(HttpServletRequest request) {
		try {
			
			AdministrationService administrationService = Context.getAdministrationService();
			// Retrieve GePG user credentials
			String gepgUsername = administrationService.getGlobalProperty(ICareConfig.GEPG_USERNAME);
			String gepgPassword = administrationService.getGlobalProperty(ICareConfig.GEPG_PASSWORD);
			Context.authenticate(gepgUsername, gepgPassword);
			// Read the raw body from the request
			
			String requestBody = new BufferedReader(new InputStreamReader(request.getInputStream())).lines().collect(
			    Collectors.joining("\n"));
			
			// Parse the body as JSON into a Map
			ObjectMapper objectMapper = new ObjectMapper();
			Map<String, Object> requestDto = objectMapper.readValue(requestBody, Map.class);
			
			// Validate and process the data
			// if (requestDto == null || !requestDto.containsKey("callbackData")) {
			// return generateErrorResponse("Invalid or missing callback data.");
			// }
			
			Map<String, Object> callbackData = (Map<String, Object>) requestDto;
			
			if (callbackData == null || callbackData.isEmpty()) {
				return generateErrorResponse("Empty content not allowed", "");
			}
			
			Map<String, Object> status = (Map<String, Object>) callbackData.get("Status");
			if (status == null) {
				return generateErrorResponse("Status is missing in callback data.", "");
			}
			String requestId = (String) status.get("RequestId");
			
			Map<String, Object> systemAuth = (Map<String, Object>) callbackData.get("SystemAuth");
			if (systemAuth == null || !systemAuth.containsKey("Signature")) {
				return generateErrorResponse("Missing or invalid signature in callback data.", requestId);
			}
			String signature = (String) systemAuth.get("Signature");
			
			Map<String, Object> feedbackData = (Map<String, Object>) callbackData.get("FeedbackData");
			if (feedbackData == null) {
				return generateErrorResponse("FeedbackData is missing in callback data.", requestId);
			}
			
			try {
				Context.authenticate(gepgUsername, gepgPassword);
				
				Map<String, Object> processResponse = billingService.processGepgCallbackResponse(callbackData);
				return ResponseEntity.ok(processResponse);
				
			}
			catch (ContextAuthenticationException e) {
				return generateErrorResponse("Authentication failed please contact an Admin", requestId);
			}
			finally {
				Context.logout();
			}
			
		}
		catch (IOException e) {
			return generateErrorResponse("Error reading request body for this request", "");
		}
		catch (Exception ex) {
			return generateErrorResponse("Error processing callback body for this request", "");
		}
	}
	
	private ResponseEntity<Map<String, Object>> generateErrorResponse(String errorMessage, String requestId) {
        Map<String, Object> errorResponse = new HashMap<>();
        try {

            AdministrationService administrationService = Context.getAdministrationService();
            // Retrieve GePG user credentials
            String gepgUsername = administrationService.getGlobalProperty(ICareConfig.GEPG_USERNAME);
            String gepgPassword = administrationService.getGlobalProperty(ICareConfig.GEPG_PASSWORD);
            Context.authenticate(gepgUsername, gepgPassword);
            // AckData as per your requested format
            Map<String, Object> ackData = new HashMap<>();
            ackData.put("Description", errorMessage);
            ackData.put("RequestId", requestId);
            ackData.put("SystemAckCode", "0");
            String systemCode = administrationService.getGlobalProperty(ICareConfig.GEPG_SYSTEM_CODE);

            // Serialize RequestData to JSON for signing
            String requestDataJson = new ObjectMapper().writeValueAsString(ackData);
            String signature = billingService.signatureData(requestDataJson);

            // SystemAuth as per your requested format
            Map<String, Object> systemAuth = new HashMap<>();
            systemAuth.put("SystemCode", systemCode);
            systemAuth.put("Signature", signature);

            errorResponse.put("AckData", ackData);
            errorResponse.put("SystemAuth", systemAuth);

            return ResponseEntity.badRequest().body(errorResponse);

        } catch (Exception e) {
            // Handle the error without using Map.of()
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Failed to sign data: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorMap);
        }
    }
}
