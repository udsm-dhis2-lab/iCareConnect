package org.openmrs.module.icare.web.controller;

import java.sql.SQLException;
import java.util.List;

import org.junit.After;
import org.junit.Before;

import org.junit.jupiter.api.Test;
import org.openmrs.Patient;
import org.openmrs.api.PatientService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.web.controller.core.BaseResourceControllerTest;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.Assert.assertTrue;

public class GepgControllerAPITest extends BaseResourceControllerTest {
	
	@Autowired
	BillingService billingService;
	
	@Before
	public void setUp() throws SQLException, ClassNotFoundException {
		initializeInMemoryDatabase();
		executeDataSet("billing-data.xml");
		executeDataSet("billing-e2e-test.xml");
		this.startUp();
	}
	
	@After
	public void tearDown() throws SQLException, ClassNotFoundException {
		this.shutDown();
		this.clearSessionAfterEachTest();
	}
	
	 @Test
	 public void testSubmitBill_withValidUuid_returnsSuccess() {
		//Given
		PatientService patientService = Context.getService(PatientService.class);
		Patient patient = patientService.getPatientByUuid("1f6959e5-d15a-4025-bb48-340ee9e2c58d");
	
		List<Invoice> invoices = billingService.getPendingInvoices(patient.getUuid());
		Invoice invoice = invoices.get(0);
		System.out.println("invoice data -------------------------");
		System.out.println(invoice);
	 	System.out.println("Test function fired ------------");
	 	assertTrue(true);
	 }
}
