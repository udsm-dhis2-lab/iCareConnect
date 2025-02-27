package org.openmrs.module.icare.web.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.billing.services.insurance.InsuranceService;
import org.openmrs.module.icare.billing.services.insurance.InsurancesServices;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;

import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping(value = "/rest/" + RestConstants.VERSION_1 + "/insurance")
public class InsuranceController {
	
	@Autowired
	private InsurancesServices insurancesservice;
	
	@RequestMapping(value = "/authorizecard", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> authorizecard(@RequestBody Map<String, Object> requestPayload)
            throws Exception {
        Map<String, Object> responseObject = new HashMap<>();

        System.out.println("Payload received: " + requestPayload);

        String validationError = validatePayload(requestPayload);
        if (validationError != null) {
            responseObject.put("status", 400);
            responseObject.put("error", validationError);
            return ResponseEntity.badRequest().body(responseObject);
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(requestPayload);

        Map<String, Object> responseMap = insurancesservice.getAuthorization(jsonPayload);

        String body = (String) responseMap.get("body");
        if (body != null) {
            Map<String, Object> bodyMap = objectMapper.readValue(body, Map.class);
            responseMap.put("body", bodyMap);
        }

        return ResponseEntity.ok(responseMap);
    }
	
	private String validatePayload(Map<String, Object> payload) {
		if (payload.get("cardNo") == null || ((String) payload.get("cardNo")).isEmpty()) {
			return "Card number is required and cannot be empty.";
		}
		
		if (payload.get("biometricMethod") == null || ((String) payload.get("biometricMethod")).isEmpty()) {
			return "Biometric method is required and cannot be empty.";
		}
		
		if (payload.get("nationalID") == null || ((String) payload.get("nationalID")).isEmpty()) {
			return "National ID is required and cannot be empty.";
		}
		
		if (payload.get("fpCode") == null || ((String) payload.get("fpCode")).isEmpty()) {
			return "FP code is required and cannot be empty.";
		}
		
		if (payload.get("imageData") == null || ((String) payload.get("imageData")).isEmpty()) {
			return "Image data is required and cannot be empty.";
		}
		
		if (payload.get("visitTypeID") == null || !(payload.get("visitTypeID") instanceof Integer)) {
			return "Visit Type ID must be a valid integer.";
		}
		
		if (payload.get("referralNo") == null || ((String) payload.get("referralNo")).isEmpty()) {
			return "Referral number is required and cannot be empty.";
		}
		
		if (payload.get("remarks") == null || ((String) payload.get("remarks")).isEmpty()) {
			return "Remarks are required and cannot be empty.";
		}
		
		return null;
	}
	
	@RequestMapping(value = "/preapproval", method = RequestMethod.POST)
    public Map<String, Object> servicePreApproval(@RequestBody List<Map<String, Object>> requestPayload)
            throws Exception {

        for (Map<String, Object> payload : requestPayload) {
            if (!isValidPreApprovalRequest(payload)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid data in the request payload");
                errorResponse.put("status", "error");
                return errorResponse;
            }
        }

        Map<String, Object> servicePreApprovalObject = new HashMap<>();
        System.out.println("Payload received: " + requestPayload);

        servicePreApprovalObject = insurancesservice.getPreapproval(requestPayload);

        return servicePreApprovalObject;
    }
	
	private boolean isValidPreApprovalRequest(Map<String, Object> payload) {
		
		if (payload.get("authorizationNo") == null || payload.get("authorizationNo").toString().trim().isEmpty()) {
			return false;
		}
		if (payload.get("firstName") == null || payload.get("firstName").toString().trim().isEmpty()) {
			return false;
		}
		if (payload.get("lastName") == null || payload.get("lastName").toString().trim().isEmpty()) {
			return false;
		}
		if (payload.get("gender") == null || payload.get("gender").toString().trim().isEmpty()) {
			return false;
		}
		if (payload.get("dateOfBirth") == null || payload.get("dateOfBirth").toString().trim().isEmpty()) {
			return false;
		}
		if (payload.get("clinicalNotes") == null || payload.get("clinicalNotes").toString().trim().isEmpty()) {
			return false;
		}
		if (payload.get("practitionerNo") == null || payload.get("practitionerNo").toString().trim().isEmpty()) {
			return false;
		}
		
		if (payload.get("diseases") != null) {
			List<Map<String, Object>> diseases = (List<Map<String, Object>>) payload.get("diseases");
			if (diseases.isEmpty()) {
				return false;
			}
			for (Map<String, Object> disease : diseases) {
				if (disease.get("diseaseCode") == null || disease.get("diseaseCode").toString().trim().isEmpty()) {
					return false;
				}
				if (disease.get("status") == null || disease.get("status").toString().trim().isEmpty()) {
					return false;
				}
			}
		}
		
		if (payload.get("requestedServices") != null) {
			List<Map<String, Object>> requestedServices = (List<Map<String, Object>>) payload.get("requestedServices");
			if (requestedServices.isEmpty()) {
				return false;
			}
			for (Map<String, Object> service : requestedServices) {
				if (service.get("itemCode") == null || service.get("itemCode").toString().trim().isEmpty()) {
					return false;
				}
				if (service.get("usage") == null || service.get("usage").toString().trim().isEmpty()) {
					return false;
				}
				if (service.get("effectiveDate") == null || service.get("effectiveDate").toString().trim().isEmpty()) {
					return false;
				}
				if (service.get("endDate") == null || service.get("endDate").toString().trim().isEmpty()) {
					return false;
				}
				if (service.get("quantityRequested") == null
				        || Integer.parseInt(service.get("quantityRequested").toString()) <= 0) {
					return false;
				}
			}
		}
		
		return true;
	}
	
	@RequestMapping(value = "/beneficialydetails", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> beneficialydetails(@RequestBody Map<String, Object> requestPayload)
            throws Exception {
        Map<String, Object> beneficialydetailsObject = new HashMap<>();

        String validationError = validateBeneficialyPayload(requestPayload);
        if (validationError != null) {
            beneficialydetailsObject.put("status", 400);
            beneficialydetailsObject.put("error", validationError);
            return ResponseEntity.badRequest().body(beneficialydetailsObject);
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(requestPayload);

        Map<String, Object> responseMap = insurancesservice.getBeneficialyDetails(jsonPayload);

        String body = (String) responseMap.get("body");
        if (body != null) {
            Map<String, Object> bodyMap = objectMapper.readValue(body, Map.class);

            responseMap.put("body", bodyMap);
        }
        return ResponseEntity.ok(responseMap);
    }
	
	private String validateBeneficialyPayload(Map<String, Object> payload) {
		if (payload.get("cardNo") == null || ((String) payload.get("cardNo")).isEmpty()) {
			return "Card number is required and cannot be empty.";
		}
		if (payload.get("cardTypeID") == null || ((String) payload.get("cardTypeID")).isEmpty()) {
			return "Card type ID is required and cannot be empty.";
		}
		
		if (payload.get("verifierID") == null || ((String) payload.get("verifierID")).isEmpty()) {
			return "Verifier ID is required and cannot be empty.";
		}
		
		return null;
	}
	
	@RequestMapping(value = "/pocrefgeneration", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> pocRefGeneration(@RequestBody Map<String, Object> requestPayload)
            throws Exception {
        Map<String, Object> response = new HashMap<>();

        System.out.println("Payload received: " + requestPayload);

        String validationError = validatePOCRefPayload(requestPayload);
        if (validationError != null) {
            response.put("status", 400);
            response.put("error", validationError);
            return ResponseEntity.badRequest().body(response);
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(requestPayload);

        Map<String, Object> responseMap = insurancesservice.pocNotification(jsonPayload);

        String body = (String) responseMap.get("body");
        if (body != null) {
            Map<String, Object> bodyMap = objectMapper.readValue(body, Map.class);
            responseMap.put("body", bodyMap);
        }

        return ResponseEntity.ok(responseMap);
    }
	
	private String validatePOCRefPayload(Map<String, Object> payload) {
		if (!payload.containsKey("pointOfCareID") || !(payload.get("pointOfCareID") instanceof Number)) {
			return "pointOfCareID is required and must be a number.";
		}
		
		if (!payload.containsKey("authorizationNo") || !(payload.get("authorizationNo") instanceof String)
		        || ((String) payload.get("authorizationNo")).isEmpty()) {
			return "authorizationNo is required and must be a non-empty string.";
		}
		
		if (!payload.containsKey("practitionerNo") || !(payload.get("practitionerNo") instanceof String)) {
			return "practitionerNo is required and must be a string.";
		}
		
		if (!payload.containsKey("biometricMethod") || !(payload.get("biometricMethod") instanceof String)) {
			return "biometricMethod is required and must be a string.";
		}
		
		if (!payload.containsKey("fpCode") || !(payload.get("fpCode") instanceof String)) {
			return "fpCode is required and must be a string.";
		}
		
		if (!payload.containsKey("imageData") || !(payload.get("imageData") instanceof String)) {
			return "imageData is required and must be a string.";
		}
		
		return null;
	}
	
	@RequestMapping(value = "/getpoc", method = RequestMethod.GET)
	public ResponseEntity<List<Map<String, Object>>> getPOC() {
		return ResponseEntity.ok(insurancesservice.getPocOfCare());
	}
	
	@RequestMapping(value = "/getvisittype", method = RequestMethod.GET)
	public ResponseEntity<List<Map<String, Object>>> getVisityType() {
		List<Map<String, Object>> visitTypes = insurancesservice.getVisitTypes();
		return ResponseEntity.ok(visitTypes);
	}
	
	@RequestMapping(value = "/cardverification", method = RequestMethod.POST)
    public Map<String, Object> cardVerification(@RequestBody List<Map<String, Object>> requestPayload)
            throws Exception {
        Map<String, Object> cardVerificationObject = new HashMap<>();
        System.out.println("Payload received: " + requestPayload);
        return cardVerificationObject;
    }
}
