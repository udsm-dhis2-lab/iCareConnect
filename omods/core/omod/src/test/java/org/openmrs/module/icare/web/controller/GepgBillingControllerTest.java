package org.openmrs.module.icare.web.controller;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
public class GepgBillingControllerTest {

    @Mock
    private RestTemplate restTemplate;

    private GepgBillingController controller;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        controller = new GepgBillingController(restTemplate);
    }

    @Test
    public void testRequestControlNumber() {     
        
        // Mock response entity from the service API
        String responseBody = "Response from service API";
        ResponseEntity<String> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        // Set up mock RestTemplate behavior
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(mockResponseEntity);

        // Mock payload
        String payload = "{ \"SystemAuth\": { \"SystemCode\": \"90019\", \"ServiceCode\": \"1001\", \"Signature\": \"H1L8loLjkPsQ2BVueqcVX/KVYH7F7kym1TJ448Pi0jye2ACidAikTVwBJb9UYvW7XaLlftTD3m4/dDuvi5mRoemIjO6rizuwI1TWoWst9b1P8BpthKObnofVKwPVKnD6v2GLpfbXwtoiRSuajvkiyJnSCrqsQvtmBmL8ACV3pls5eesYxppsszXEtV/VfilMePOJhfGsIma64baM7sJ8q7LHyujjWT3094Df5oYZEbMDXOPjykCm63vjsEdrrT0A+vz+N7LblmTdHBhtHar52OJmbpNZkbVq/0ZsL1IbX0Wc7SrlU6cWaNuOt0CRJ3bqNnSe8RlO746zkUJtXerYdg==\" }, \"RequestData\": { \"RequestId\": \"6474647FD8484909\", \"BillHdr\": { \"SpCode\": \"SP111\", \"RtrRespFlg\": \"true\" }, \"BillTrxInf\": { \"BillId\": \"123456222\", \"SubSpCode\": \"7001\", \"SpSysId\": \"LHGSE001\", \"BillAmt\": \"1000\", \"MiscAmt\": \"0\", \"BillExprDt\": \"2018-08-08T07:09:34\", \"PyrId\": \"40\", \"PyrName\": \"PATRICK PASCHAL\", \"BillDesc\": \"Application Fees Payment\", \"BillGenDt\": \"2018-05-10T07:09:34\", \"BillGenBy\": \"40\", \"BillApprBy\": \"PATRICK PASCHAL\", \"PyrCellNum\": \"0763360959\", \"PyrEmail\": \"patrickkalu199@gmail.com\", \"Ccy\": \"TZS\", \"BillEqvAmt\": \"3000\", \"RemFlag\": \"false\", \"BillPayOpt\": \"3\", \"BillItems\": { \"BillItem\": [ { \"BillItemRef\": \"FRRR40\", \"UseItemRefOnPay\": \"N\", \"BillItemAmt\": \"3000\", \"BillItemEqvAmt\": \"3000\", \"BillItemMiscAmt\": \"0\", \"GfsCode\": \"140313\" }, { \"BillItemRef\": \"11\", \"UseItemRefOnPay\": \"N\", \"BillItemAmt\": \"5000\", \"BillItemEqvAmt\": \"5000\", \"BillItemMiscAmt\": \"0.0\", \"GfsCode\": \"140371\" } ] } } } }";

        // Call the controller method
        ResponseEntity<String> responseEntity = controller.requestControlNumber(payload);

        // Verify the response
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(responseBody, responseEntity.getBody());
    }
}
