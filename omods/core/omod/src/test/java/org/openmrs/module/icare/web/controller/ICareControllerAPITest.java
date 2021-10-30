package org.openmrs.module.icare.web.controller;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.openmrs.*;
import org.openmrs.api.EncounterService;
import org.openmrs.api.PatientService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.billing.models.Prescription;
import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.web.controller.core.BaseResourceControllerTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class ICareControllerAPITest extends BaseResourceControllerTest {
	
	//@Autowired
	//BillingService billingService;
	
	@Before
	public void setUp() throws SQLException, ClassNotFoundException {
		initializeInMemoryDatabase();
		executeDataSet("billing-data.xml");
		this.startUp();
	}
	
	@Test
	public void testCreatingItem() throws Exception {
		String dto = this.readFile("dto/item-create-dto.json");
		Map<String, Object> item = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("icare/item", item);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		Map<String, Object> map = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		assertThat("Should have item uuid", map.get("uuid") != null, is(true));
		MockHttpServletRequest newGetRequest = newGetRequest("icare/item");
		handle = handle(newGetRequest);
		Map<String, Object> results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		List<Map<String, Object>> maps = (List) results.get("results");
		assertThat("Should return a 7 items", maps.size(), is(7));
		
		newGetRequest = newGetRequest("icare/item", new Parameter("q", "opd"));
		handle = handle(newGetRequest);
		results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		maps = (List) results.get("results");
		assertThat("Should return a 3 items", maps.size(), is(3));
		
		newGetRequest = newGetRequest("icare/item", new Parameter("q", "asp"));
		handle = handle(newGetRequest);
		results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		maps = (List) results.get("results");
		assertThat("Should return a 3 items", maps.size(), is(1));
	}
	
	@Test
	public void testCreatingDrugItem() throws Exception {
		String dto = this.readFile("dto/item-drug-create-dto.json");
		Map<String, Object> item = (new ObjectMapper()).readValue(dto, Map.class);
		MockHttpServletRequest newPostRequest = newPostRequest("icare/item", item);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		Map<String, Object> map = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		assertThat("Should have item uuid", map.get("uuid") != null, is(true));
		MockHttpServletRequest newGetRequest = newGetRequest("icare/item");
		handle = handle(newGetRequest);
		String contentString = handle.getContentAsString();
		Map<String, Object> results = (new ObjectMapper()).readValue(contentString, Map.class);
		List<Map<String, Object>> maps = (List) results.get("results");
		assertThat("Should return a 7 items", maps.size(), is(7));
		boolean found = false;
		for (Map<String, Object> itemMap : maps) {
			if (itemMap.get("unit").equals("DrugUnits")) {
				found = true;
				assertThat("Should have drug", itemMap.get("drug") != null, is(true));
				assertThat("Should have drug uuid", (String) ((Map) itemMap.get("drug")).get("uuid"),
				    is("3cfcf118-931c-46f7-8ff6-7b876f0d4202"));
				assertThat("Should have drug name", (String) ((Map) itemMap.get("drug")).get("display"), is("Triomune-30"));
			}
		}
		assertThat("Drug was found in test", found, is(true));
	}
	
	@Test
	public void testCreatingItemPrice() throws Exception {
		String dto = this.readFile("dto/item-price-create-dto.json");
		Map<String, Object> item = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("icare/itemprice", item);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		Map<String, Object> map = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		assertThat("Show Item UUID", ((Map) map.get("item")).get("uuid").toString(),
		    is("b21bhsld-9ab1-4b57-8a89-c0bf2580a68d"));
		assertThat("Show Item Name", ((Map) map.get("item")).get("display").toString(), is("OPD Service"));
		
		assertThat("Show Payment Type UUID", ((Map) map.get("paymentType")).get("uuid").toString(),
		    is("e7jnec30-5344-11e8-ie7c-40b6etw3cfee"));
		assertThat("Show Payment Type Name", ((Map) map.get("paymentType")).get("display").toString(), is("CASH"));
		
		assertThat("Show Payment Scheme UUID", ((Map) map.get("paymentScheme")).get("uuid").toString(),
		    is("e721ec30-5344-11e8-ie7c-40b6etw379ee"));
		assertThat("Show Payment Scheme Name", ((Map) map.get("paymentScheme")).get("display").toString(), is("Fast"));
		
		MockHttpServletRequest newGetRequest = newGetRequest("icare/itemprice");
		handle = handle(newGetRequest);
		Map<String, Object> results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		List<Map<String, Object>> maps = (List) results.get("results");
		assertThat("Should return a 3 item Prices", maps.size(), is(3));
	}
	
	@Test
	@Ignore("Already testing using advice")
	public void testVisitCreation() throws Exception {
		
		//Given
		Map<String, Object> result = getResourceDTOMap("visit-create-dto");
		
		//When
		MockHttpServletRequest newGetRequest = newPostRequest("icare/visit", result);
		
		//Then
		MockHttpServletResponse handle = handle(newGetRequest);
		Visit visit = (new ObjectMapper()).readValue(handle.getContentAsString(), Visit.class);
		assertThat("Should return a visit", visit != null);
	}
	
	@Test
	@Ignore(value = "Changed to Advice")
	public void testLabOrderCreation() throws Exception {
		
		//Given
		Map<String, Object> result = getResourceDTOMap("lab-order-create-dto");
		PatientService patientService = Context.getService(PatientService.class);
		Patient patient = patientService.getPatientByUuid((String) result.get("patient"));
		Visit visit = this.getVisit(patient);//createVisitWithBill(patient);
		
		EncounterService encounterService = Context.getService(EncounterService.class);
		Encounter encounter = encounterService.getEncountersByVisit(visit, true).get(0);
		result.put("encounter", encounter.getUuid());
		
		//When
		MockHttpServletRequest newGetRequest = newPostRequest("icare/laborder", result);
		MockHttpServletResponse handle = handle(newGetRequest);
		
		//Then
		Visit visit2 = (new ObjectMapper()).readValue(handle.getContentAsString(), Visit.class);
		assertThat("Should return a visit", visit2 != null);
	}
	
	@Test
	//@Ignore(value = "Changed to Advice")
	public void testDrugOrderRevision() throws Exception {
		
		//Given
		OrderType orderType = new OrderType();
		orderType.setJavaClassName("org.openmrs.module.icare.billing.models.Prescription");
		orderType.setName("Prescription");
		Context.getOrderService().saveOrderType(orderType);
		
		Map<String, Object> result = getResourceDTOMap("core/ledger-add");
		MockHttpServletRequest newPostRequest = null;
		MockHttpServletResponse handle = null;
		newPostRequest = newPostRequest("store/ledger", result);
		handle = handle(newPostRequest);
		
		result = getResourceDTOMap("drug-create-dto");
		PatientService patientService = Context.getService(PatientService.class);
		Patient patient = patientService.getPatientByUuid((String) result.get("patient"));
		Visit visit = this.getVisit(patient);
		
		EncounterService encounterService = Context.getService(EncounterService.class);
		Encounter encounter = encounterService.getEncountersByVisit(visit, false).get(0);
		result.put("encounter", encounter.getUuid());
		
		//When
		MockHttpServletRequest newGetRequest = newPostRequest("icare/prescription", result);
		handle = handle(newGetRequest);
		
		//Then
		Map<String, Object> orderResult = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		BillingService billingService = Context.getService(BillingService.class);
		InvoiceItem invoiceItem = billingService.getInvoiceItemByOrder(Context.getOrderService().getOrderByUuid(
		    (String) orderResult.get("uuid")));
		System.out.println("Here:" + invoiceItem);
		assertThat("Should return a visit", orderResult != null);
		
		Map<String, Object> dispensing = new HashMap<String, Object>();
		dispensing.put("location", "8d6c993e-c2cc-11de-8d13-0010c6dffd0f");
		newGetRequest = newPostRequest("store/prescription/" + orderResult.get("uuid") + "/dispense", dispensing);
		handle = handle(newGetRequest);
		
		orderResult = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		assertThat("Should return a visit", orderResult != null);
		assertThat("Should return a visit", orderResult.get("status").equals("DISPENSED"));
		
		newGetRequest = newGetRequest("store/orderStatus/" + visit.getUuid());
		handle = handle(newGetRequest);
		
		List<Map> orderStatus = (new ObjectMapper()).readValue(handle.getContentAsString(), List.class);
		assertThat("Should return a visit", orderStatus != null);
		assertThat("Should return a visit", orderStatus.size() == 1);
		assertThat("Should return a visit", orderStatus.get(0).get("status").equals("DISPENSED"));
		
		/*newGetRequest = newGetRequest("billing/invoice", new Parameter("patient", patient.getUuid()));
		handle = handle(newGetRequest);
		orderStatus = (new ObjectMapper()).readValue(handle.getContentAsString(), List.class);
		for(Map<String,Object> item:(List<Map>)orderStatus.get(0).get("items")){
			if(((Map)item.get("item")).get("name").equals("ASPIRIN")){

			}
		}*/
	}
	
	@Test
	//@Ignore(value = "Changed to Advice")
	public void testGettingVisits() throws Exception {
		
		//Given
		
		PatientService patientService = Context.getService(PatientService.class);
		Patient patient = patientService.getPatientByUuid("1f6959e5-d15a-4025-bb48-340ee9e2c58d");
		Visit newVisit = this.getVisit(patient);
		
		MockHttpServletRequest newGetRequest = newGetRequest("icare/visit", new Parameter("orderTypeUuid",
		        "2msir5eb-5345-11e8-9922-40b034c3cfee")
		//, new Parameter("fulfillerStatus","COMPL")
		);
		MockHttpServletResponse handle = handle(newGetRequest);
		
		Map<String, Object> orderResult = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		assertThat("Should return a visit", ((List) orderResult.get("results")).size() == 1);
		//Then
		
		for (Visit visit : Context.getVisitService().getAllVisits()) {
			if (visit.getStopDatetime() == null) {
				for (Encounter encounter : visit.getEncounters()) {
					for (Order order : encounter.getOrders()) {
						Context.getOrderService().updateOrderFulfillerStatus(order, Order.FulfillerStatus.COMPLETED,
						    "Completed");
					}
				}
			}
		}
		
		newGetRequest = newGetRequest("icare/visit", new Parameter("orderTypeUuid", "2msir5eb-5345-11e8-9922-40b034c3cfee"),
		    new Parameter("fulfillerStatus", "COMPLETED"));
		handle = handle(newGetRequest);
		
		orderResult = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		assertThat("Should return a visit", ((List) orderResult.get("results")).size() == 1);
	}
}
