package org.openmrs.module.icare.web.controller;

import org.openmrs.module.icare.billing.services.payment.gepg.GEPGService;
import org.openmrs.module.icare.billing.services.payment.gepg.BillSubmissionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gepg")
public class GepgBillingController {

    @Autowired
    GEPGService gepgbillService;

    @RequestMapping(value = "/submit", method = RequestMethod.POST)
    public String submitBill(@RequestBody Map<String, String> payload) {
        String uuid = payload.get("uuid");

        if (uuid == null || uuid.isEmpty()) {
            return "UUID is required";
        }

        BillSubmissionRequest billSubmissionRequest = gepgbillService.createBillSubmissionRequest(uuid);

        // Call the method to send the request to the external API
        String response = gepgbillService.submitBillRequest(billSubmissionRequest);

        return response;
    }
}
