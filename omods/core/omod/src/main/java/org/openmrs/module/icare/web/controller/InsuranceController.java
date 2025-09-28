package org.openmrs.module.icare.web.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openmrs.Visit;
import org.openmrs.api.VisitService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.services.insurance.InsurancesServices;
import org.openmrs.module.icare.billing.services.insurance.InsurancesServices.NhifResponse;
import org.openmrs.module.webservices.rest.web.RestConstants;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@RequestMapping(value = "/rest/" + RestConstants.VERSION_1 + "/insurance")
public class InsuranceController {
	
	@Autowired
	private InsurancesServices insurancesservice;
	
	// --- helper: convert NhifResponse to ResponseEntity<String> ---
	private ResponseEntity<String> passThrough(NhifResponse nhif) {
		// NHIF APIs are JSON; force JSON content-type to your frontend
		return ResponseEntity.status(nhif.status).contentType(MediaType.APPLICATION_JSON).body(nhif.body);
	}
	
	// -------------------- Authorize Card --------------------
	@RequestMapping(value = "/authorizecard", method = RequestMethod.POST)
    public ResponseEntity<String> authorizecard(@RequestBody Map<String, Object> requestPayload) throws Exception {
        String validationError = validateAuthorizePayload(requestPayload);
        if (validationError != null) {
            Map<String, Object> responseObject = new HashMap<>();
            responseObject.put("error", validationError);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ObjectMapper().writeValueAsString(responseObject));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(requestPayload);
        NhifResponse resp = insurancesservice.authorizeCard(jsonPayload);
        return passThrough(resp);
    }
	
	private String validateAuthorizePayload(Map<String, Object> payload) {
		if (payload.get("cardNo") == null || String.valueOf(payload.get("cardNo")).trim().isEmpty())
			return "Card number is required and cannot be empty.";
		if (payload.get("biometricMethod") == null || String.valueOf(payload.get("biometricMethod")).trim().isEmpty())
			return "Biometric method is required and cannot be empty.";
		if (payload.get("nationalID") == null || String.valueOf(payload.get("nationalID")).trim().isEmpty())
			return "National ID is required and cannot be empty.";
		if (payload.get("fpCode") == null || String.valueOf(payload.get("fpCode")).trim().isEmpty())
			return "FP code is required and cannot be empty.";
		if (payload.get("imageData") == null || String.valueOf(payload.get("imageData")).trim().isEmpty())
			return "Image data is required and cannot be empty.";
		if (payload.get("visitTypeID") == null || !(payload.get("visitTypeID") instanceof Number))
			return "Visit Type ID must be a valid integer.";
		if (payload.get("referralNo") == null || String.valueOf(payload.get("referralNo")).trim().isEmpty())
			return "Referral number is required and cannot be empty.";
		if (payload.get("remarks") == null || String.valueOf(payload.get("remarks")).trim().isEmpty())
			return "Remarks are required and cannot be empty.";
		return null;
	}
	
	// -------------------- Pre-approval --------------------
	@RequestMapping(value = "/preapproval", method = RequestMethod.POST)
    public ResponseEntity<String> servicePreApproval(@RequestBody Map<String, Object> requestPayload) throws Exception {
        if (!isValidPreApprovalRequest(requestPayload)) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid data in the request payload");
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ObjectMapper().writeValueAsString(errorResponse));
        }

        NhifResponse resp = insurancesservice.preapproval(requestPayload);
        return passThrough(resp);
    }
	
	private boolean isValidPreApprovalRequest(Map<String, Object> payload) {
		if (payload.get("authorizationNo") == null || payload.get("authorizationNo").toString().trim().isEmpty())
			return false;
		if (payload.get("firstName") == null || payload.get("firstName").toString().trim().isEmpty())
			return false;
		if (payload.get("lastName") == null || payload.get("lastName").toString().trim().isEmpty())
			return false;
		if (payload.get("gender") == null || payload.get("gender").toString().trim().isEmpty())
			return false;
		if (payload.get("dateOfBirth") == null || payload.get("dateOfBirth").toString().trim().isEmpty())
			return false;
		if (payload.get("clinicalNotes") == null || payload.get("clinicalNotes").toString().trim().isEmpty())
			return false;
		if (payload.get("practitionerNo") == null || payload.get("practitionerNo").toString().trim().isEmpty())
			return false;
		
		if (payload.get("diseases") != null) {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> diseases = (List<Map<String, Object>>) payload.get("diseases");
			if (diseases.isEmpty())
				return false;
			for (Map<String, Object> disease : diseases) {
				if (disease.get("diseaseCode") == null || disease.get("diseaseCode").toString().trim().isEmpty())
					return false;
				if (disease.get("status") == null || disease.get("status").toString().trim().isEmpty())
					return false;
			}
		}
		
		if (payload.get("requestedServices") != null) {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> requestedServices = (List<Map<String, Object>>) payload.get("requestedServices");
			if (requestedServices.isEmpty())
				return false;
			for (Map<String, Object> service : requestedServices) {
				if (service.get("itemCode") == null || service.get("itemCode").toString().trim().isEmpty())
					return false;
				if (service.get("usage") == null || service.get("usage").toString().trim().isEmpty())
					return false;
				if (service.get("effectiveDate") == null || service.get("effectiveDate").toString().trim().isEmpty())
					return false;
				if (service.get("endDate") == null || service.get("endDate").toString().trim().isEmpty())
					return false;
				if (service.get("quantityRequested") == null
				        || Integer.parseInt(service.get("quantityRequested").toString()) <= 0)
					return false;
			}
		}
		return true;
	}
	
	// -------------------- Beneficiary Details --------------------
	@RequestMapping(value = "/beneficialydetails", method = RequestMethod.POST)
    public ResponseEntity<String> beneficialydetails(@RequestBody Map<String, Object> requestPayload) throws Exception {
        String validationError = validateBeneficialyPayload(requestPayload);
        if (validationError != null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", validationError);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ObjectMapper().writeValueAsString(error));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(requestPayload);
        NhifResponse resp = insurancesservice.beneficiaryDetails(jsonPayload);
        return passThrough(resp);
    }
	
	private String validateBeneficialyPayload(Map<String, Object> payload) {
		if (payload.get("cardNo") == null || String.valueOf(payload.get("cardNo")).trim().isEmpty())
			return "Card number is required and cannot be empty.";
		if (payload.get("cardTypeID") == null || String.valueOf(payload.get("cardTypeID")).trim().isEmpty())
			return "Card type ID is required and cannot be empty.";
		if (payload.get("verifierID") == null || String.valueOf(payload.get("verifierID")).trim().isEmpty())
			return "Verifier ID is required and cannot be empty.";
		return null;
	}
	
	// -------------------- POC Reference Generation --------------------
	@RequestMapping(value = "/pocrefgeneration", method = RequestMethod.POST)
    public ResponseEntity<String> pocRefGeneration(@RequestBody Map<String, Object> requestPayload) throws Exception {
        String validationError = validatePOCRefPayload(requestPayload);
        if (validationError != null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", validationError);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ObjectMapper().writeValueAsString(error));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(requestPayload);
        NhifResponse resp = insurancesservice.generatePocRef(jsonPayload);
        return passThrough(resp);
    }
	
	private String validatePOCRefPayload(Map<String, Object> payload) {
		if (!payload.containsKey("pointOfCareID") || !(payload.get("pointOfCareID") instanceof Number))
			return "pointOfCareID is required and must be a number.";
		if (!payload.containsKey("authorizationNo") || String.valueOf(payload.get("authorizationNo")).trim().isEmpty())
			return "authorizationNo is required and must be a non-empty string.";
		if (!payload.containsKey("practitionerNo") || !(payload.get("practitionerNo") instanceof String))
			return "practitionerNo is required and must be a string.";
		if (!payload.containsKey("biometricMethod") || !(payload.get("biometricMethod") instanceof String))
			return "biometricMethod is required and must be a string.";
		if (!payload.containsKey("fpCode") || !(payload.get("fpCode") instanceof String))
			return "fpCode is required and must be a string.";
		if (!payload.containsKey("imageData") || !(payload.get("imageData") instanceof String))
			return "imageData is required and must be a string.";
		return null;
	}
	
	// -------------------- Points of Care --------------------
	@RequestMapping(value = "/getpoc", method = RequestMethod.GET)
	public ResponseEntity<String> getPOC() {
		NhifResponse resp = insurancesservice.getPointsOfCare();
		return passThrough(resp);
	}
	
	// -------------------- Visit Types --------------------
	@RequestMapping(value = "/getvisittype", method = RequestMethod.GET)
	public ResponseEntity<String> getVisityType() {
		NhifResponse resp = insurancesservice.getVisitTypes();
		return passThrough(resp);
	}
	
	// -------------------- Practitioner Login --------------------
	@RequestMapping(value = "/loginpractitioner", method = RequestMethod.POST)
    public ResponseEntity<String> practitioner(@RequestBody Map<String, Object> requestPayload) throws Exception {
        String validationError = validatePractionerPayload(requestPayload);
        if (validationError != null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", validationError);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ObjectMapper().writeValueAsString(error));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(requestPayload);
        NhifResponse resp = insurancesservice.loginPractitioner(jsonPayload);
        return passThrough(resp);
    }
	
	private String validatePractionerPayload(Map<String, Object> payload) {
		if (!payload.containsKey("nationalID") || !(payload.get("nationalID") instanceof String)
		        || String.valueOf(payload.get("nationalID")).trim().isEmpty())
			return "nationalID is required and must be a non-empty string.";
		if (!payload.containsKey("practitionerNo") || !(payload.get("practitionerNo") instanceof String))
			return "practitionerNo is required and must be a string.";
		if (!payload.containsKey("biometricMethod") || !(payload.get("biometricMethod") instanceof String))
			return "biometricMethod is required and must be a string.";
		if (!payload.containsKey("fpCode") || !(payload.get("fpCode") instanceof String))
			return "fpCode is required and must be a string.";
		if (!payload.containsKey("imageData") || !(payload.get("imageData") instanceof String))
			return "imageData is required and must be a string.";
		return null;
	}
	
	// -------------------- Card Verification (not implemented) --------------------
	@RequestMapping(value = "/cardverification", method = RequestMethod.POST)
    public Map<String, Object> cardVerification(@RequestBody List<Map<String, Object>> requestPayload) {
        System.out.println("Payload received: " + requestPayload);
        return new HashMap<>();
    }
	
	// -------------------- Portfolio Submission (folio) --------------------
	@RequestMapping(value = "/sendpotfolio", method = RequestMethod.POST)
    public ResponseEntity<String> sentPortfolio(@RequestBody Map<String, Object> requestPayload) throws Exception {
        String visitUuid = (String) requestPayload.get("visit");
        String signatory = (String) requestPayload.get("Signatory");
        String signatoryID = (String) requestPayload.get("SignatoryID");
        String signatureData = (String) requestPayload.get("SignatureData");

        Map<String, Object> error = new HashMap<>();
        if (visitUuid == null || visitUuid.trim().isEmpty()) {
            error.put("error", "Visit UUID is not specified");
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ObjectMapper().writeValueAsString(error));
        }

        Visit visit = Context.getService(VisitService.class).getVisitByUuid(visitUuid);
        if (visit == null) {
            error.put("error", "Visit not found");
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ObjectMapper().writeValueAsString(error));
        }

        NhifResponse resp = insurancesservice.submitPortfolio(visit, signatory, signatoryID, signatureData);
        return passThrough(resp);
    }
	
	// -------------------- Get Card Details by NIN --------------------
	@RequestMapping(value = "/GetCardDetailsByNIN", method = RequestMethod.POST)
    public ResponseEntity<String> getCardDetailsByNin(@RequestBody Map<String, Object> requestPayload) throws Exception {
        String nationalID = (String) requestPayload.get("nationalID");
        if (nationalID == null || nationalID.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "NiN is not specified");
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ObjectMapper().writeValueAsString(error));
        }

        NhifResponse resp = insurancesservice.getCardDetailsByNIN(nationalID);
        return passThrough(resp);
    }
	
	// -------------------- Send Confirmation Code (placeholder) --------------------
	@RequestMapping(value = "/sendconfirmationcode", method = RequestMethod.POST)
	public ResponseEntity<String> sendconfirmationCode(@RequestBody Map<String, Object> requestPayload) throws Exception {
		return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body("{}");
	}
}
