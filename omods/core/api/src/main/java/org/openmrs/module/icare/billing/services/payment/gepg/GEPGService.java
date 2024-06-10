package org.openmrs.module.icare.billing.services.payment.gepg;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
public class GEPGService {
	
	public BillSubmissionRequest createBillSubmissionRequest(String uuid) {
		System.out.println("Received UUID on Submission Request: " + uuid);
		System.out.println("Generating Bill Submission request.........................");
		
		// Create and populate BillHdr
		BillHdr billHdr = new BillHdr();
		billHdr.setSpCode("SP111");
		billHdr.setRtrRespFlg("true");
		
		// Create and populate BillTrxInf
		BillTrxInf billTrxInf = new BillTrxInf();
		billTrxInf.setBillId("123456222");
		billTrxInf.setSubSpCode("7001");
		billTrxInf.setSpSysId("LHGSE001");
		billTrxInf.setBillAmt("30000");
		billTrxInf.setMiscAmt("0");
		billTrxInf.setBillExprDt("2018-08-08T07:09:34");
		billTrxInf.setPyrId("40");
		billTrxInf.setPyrName("PATRICK PASCHAL");
		billTrxInf.setBillDesc("Application Fees Payment");
		billTrxInf.setBillGenDt("2018-05-10T07:09:34");
		billTrxInf.setBillGenBy("40");
		billTrxInf.setBillApprBy("PATRICK PASCHAL");
		billTrxInf.setPyrCellNum("0767454012");
		billTrxInf.setPyrEmail("patrickkalu199@gmail.com");
		billTrxInf.setCcy("TZS");
		billTrxInf.setBillEqvAmt("30000");
		billTrxInf.setRemFlag("false");
		billTrxInf.setBillPayOpt("3");
		
		// Create and populate BillItems
		BillItems billItems = new BillItems();
		billItems.getBillItem().add(new BillItem("FRRR40", "N", "30000", "30000", "0", "140313"));
		billItems.getBillItem().add(new BillItem("11", "N", "5000", "5000", "0.0", "140371"));
		
		// Set BillItems to BillTrxInf
		billTrxInf.setBillItems(billItems);
		
		// Create and populate BillSubmissionRequest
		BillSubmissionRequest billRequest = new BillSubmissionRequest();
		billRequest.setBillHdr(billHdr);
		billRequest.setBillTrxInf(billTrxInf);
		
		System.out.println("BillSubmissionRequest created in mock: " + billRequest);
		return billRequest;
	}
	
	public String submitBillRequest(BillSubmissionRequest request) {
        String apiUrl = "https://api-testengine.udsm.ac.tz/index.php?r=api/service";
        String apiKey = ""; 
        String secretKey = ""; 

        RestTemplate restTemplate = new RestTemplate();

        // Generate signature
        String signature = "H1L8loLjkPsQ2BVueqcVX/KVYH7F7kym1TJ448Pi0jye2ACidAikTVwBJb9UYvW7XaLlftTD3m4/dDuvi5mRoemIjO6rizuwI1TWoWst9b1P8BpthKObnofVKwPVKnD6v2GLpfbXwtoiRSuajvkiyJnSCrqsQvtmBmL8ACV3pls5eesYxppsszXEtV/VfilMePOJhfGsIma64baM7sJ8q7LHyujjWT3094Df5oYZEbMDXOPjykCm63vjsEdrrT0A+vz+N7LblmTdHBhtHar52OJmbpNZkbVq/0ZsL1IbX0Wc7SrlU6cWaNuOt0CRJ3bqNnSe8RlO746zkUJtXerYdg==";

        // Add authentication headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Signature", signature);

        System.out.println("Request payload: " + request);

        // Create HTTP entity with payload and headers
        HttpEntity<BillSubmissionRequest> entity = new HttpEntity<>(request, headers);

        // Send request
        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

        return response.getBody();
    }
}
