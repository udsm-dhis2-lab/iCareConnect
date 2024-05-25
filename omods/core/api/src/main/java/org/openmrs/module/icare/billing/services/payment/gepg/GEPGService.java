package org.openmrs.module.icare.billing.services.payment.gepg;

import org.springframework.stereotype.Service;
import org.springframework.http.MediaType;
import java.util.Collections;

@Service
public class GEPGService {

    public BillSubmissionRequest createBillSubmissionRequest(String uuid) {
        BillSubmissionRequest request = new BillSubmissionRequest();

        BillHdr billHdr = new BillHdr();
        billHdr.setSpCode("SP111");
        billHdr.setRtrRespFlg("true");

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

        BillItems billItems = new BillItems();
        billItems.BillItem.add(new BillItem("FRRR40", "N", "30000", "30000", "0", "140313"));
        billItems.BillItem.add(new BillItem("11", "N", "5000", "5000", "0.0", "140371"));

        billTrxInf.setBillItems(billItems);

        request.setBillHdr(billHdr);
        request.setBillTrxInf(billTrxInf);

        return request;
    }

    public String submitBillRequest(BillSubmissionRequest request) {
		String apiUrl = "https://api-testengine.udsm.ac.tz/index.php?r=api/service";
		String apiKey = ""; 
		String secretKey = ""; 
	
		RestTemplate restTemplate = new RestTemplate();
	
		// Generate signature
		String signature = "";
	
		// Add authentication headers
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.set("Authorization", "Bearer " + apiKey);
		headers.set("Signature", signature);
	
		// Create HTTP entity with payload and headers
		HttpEntity<BillSubmissionRequest> entity = new HttpEntity<>(request, headers);
	
		// Send request
		ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
	
		return response.getBody();
	}
	
}