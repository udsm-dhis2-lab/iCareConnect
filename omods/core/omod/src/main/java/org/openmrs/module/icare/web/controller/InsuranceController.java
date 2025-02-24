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
    public Map<String, Object> authorizecard(@RequestBody List<Map<String, Object>> requestPayload)
            throws Exception {
        Map<String, Object> authorizecardObject = new HashMap<>();
        System.out.println("Payload received: " + requestPayload);
        return authorizecardObject;
    }
	
	@RequestMapping(value = "/cardverification", method = RequestMethod.POST)
    public Map<String, Object> cardVerification(@RequestBody List<Map<String, Object>> requestPayload)
            throws Exception {
        Map<String, Object> cardVerificationObject = new HashMap<>();
        System.out.println("Payload received: " + requestPayload);
        return cardVerificationObject;
    }
	
	@RequestMapping(value = "/pocrefgeneration", method = RequestMethod.POST)
    public Map<String, Object> pocRefGeneration(@RequestBody List<Map<String, Object>> requestPayload)
            throws Exception {
        Map<String, Object> pocRefGenerationObject = new HashMap<>();
        System.out.println("Payload received: " + requestPayload);
        return pocRefGenerationObject;
    }
	
	@RequestMapping(value = "/preapproval", method = RequestMethod.POST)
    public Map<String, Object> servicePreApproval(@RequestBody List<Map<String, Object>> requestPayload)
            throws Exception {
        Map<String, Object> servicePreApprovalObject = new HashMap<>();
        System.out.println("Payload received: " + requestPayload);
        return servicePreApprovalObject;
    }
	
	@RequestMapping(value = "/issuing", method = RequestMethod.POST)
    public Map<String, Object> serviceIssuing(@RequestBody List<Map<String, Object>> requestPayload)
            throws Exception {
        Map<String, Object> serviceIssuingObject = new HashMap<>();
        System.out.println("Payload received: " + requestPayload);
        return serviceIssuingObject;
    }
}
