package org.openmrs.module.icare.web.controller;

import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openmrs.module.icare.billing.services.payment.gepg.BillSubmissionRequest;
import org.openmrs.module.icare.billing.services.payment.gepg.GEPGService;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.*;

public class GepgBillingControllerTest {
	
	@Mock
	private GEPGService gepgService;
	
	@InjectMocks
	private GepgBillingController controller;
	
	@Before
	public void setUp() {
		MockitoAnnotations.initMocks(this);
	}
   

	
	  @Test
    public void testSubmitBill_withValidUuid_returnsSuccess() {
        Map<String, String> payload = new HashMap<>();
        payload.put("uuid", "7a4fc84b-ae30-4cf1-b43a-59d102b6898e");

        BillSubmissionRequest request = new BillSubmissionRequest();
        when(gepgService.createBillSubmissionRequest("7a4fc84b-ae30-4cf1-b43a-59d102b6898e")).thenReturn(request);
        when(gepgService.submitBillRequest(request)).thenReturn("Success");
       
        String response = controller.submitBill(payload);
        
        assertEquals("Success", response);

        verify(gepgService).createBillSubmissionRequest("7a4fc84b-ae30-4cf1-b43a-59d102b6898e");
        verify(gepgService).submitBillRequest(request);
    }
	
	@Test
    public void testSubmitBill_withEmptyUuid_returnsErrorMessage() {
        Map<String, String> payload = new HashMap<>();
        payload.put("uuid", "");

        // Act
        String response = controller.submitBill(payload);

        // Assert
        assertEquals("UUID is required", response);

        // Verify that the methods were not called
        verify(gepgService, never()).createBillSubmissionRequest(anyString());
        verify(gepgService, never()).submitBillRequest(any(BillSubmissionRequest.class));
    }
	
	@Test
    public void testSubmitBill_withNullUuid_returnsErrorMessage() {
        // Arrange
        Map<String, String> payload = new HashMap<>();
        payload.put("uuid", null);

        // Act
        String response = controller.submitBill(payload);

        // Assert
        assertEquals("UUID is required", response);

        // Verify that the methods were not called
        verify(gepgService, never()).createBillSubmissionRequest(anyString());
        verify(gepgService, never()).submitBillRequest(any(BillSubmissionRequest.class));
    }
}
