package org.openmrs.module.icare.web.controller;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.openmrs.*;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.EncounterService;
import org.openmrs.api.PatientService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.core.ICareService;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.core.Message;
import org.openmrs.module.icare.core.impl.ICareServiceImpl;
import org.openmrs.module.icare.report.dhis2.DHIS2Config;
import org.openmrs.module.icare.web.controller.core.BaseResourceControllerTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.*;

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
	public void testIdGeneration() throws Exception {
		
		String dto = this.readFile("dto/core/id-generator.json");
		Map<String, Object> idDtop = (new ObjectMapper()).readValue(dto, Map.class);
		AdministrationService adminService = Context.getService(AdministrationService.class);
		adminService.setGlobalProperty(DHIS2Config.facilityCode, "987398345-6");
		
		adminService.setGlobalProperty(ICareConfig.PATIENT_ID_FORMAT, "GP{" + DHIS2Config.facilityCode
		        + "}/D{YYYYMMDD}/COUNT");
		MockHttpServletRequest newGetRequest = newPostRequest("icare/idgen", idDtop);
		MockHttpServletResponse handle = handle(newGetRequest);
		System.out.println("Date Wise:" + handle.getContentAsString());
		
		adminService
		        .setGlobalProperty(ICareConfig.PATIENT_ID_FORMAT, "GP{" + DHIS2Config.facilityCode + "}/D{YYYYMM}/COUNT");
		newGetRequest = newPostRequest("icare/idgen", idDtop);
		handle = handle(newGetRequest);
		System.out.println("Monthly ID:" + handle.getContentAsString());
		
		adminService.setGlobalProperty(ICareConfig.PATIENT_ID_FORMAT, "GP{" + DHIS2Config.facilityCode + "}/D{YYYY}/COUNT");
		newGetRequest = newPostRequest("icare/idgen", idDtop);
		handle = handle(newGetRequest);
		System.out.println("Yearly ID:" + handle.getContentAsString());
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
		assertThat("Should return a 8 items", maps.size(), is(8));
		
		newGetRequest = newGetRequest("icare/item", new Parameter("q", "opd"));
		handle = handle(newGetRequest);
		results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		maps = (List) results.get("results");
		assertThat("Should return a 3 items", maps.size(), is(3));
		
		newGetRequest = newGetRequest("icare/item", new Parameter("q", "asp"));
		handle = handle(newGetRequest);
		results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		maps = (List) results.get("results");
		assertThat("Should return a 2 items", maps.size(), is(2));
		
		newGetRequest = newGetRequest("icare/item", new Parameter("q", "opd servi"));
		handle = handle(newGetRequest);
		String res = handle.getContentAsString();
		System.out.println(res);
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
		assertThat("Should return a 8 items", maps.size(), is(8));
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
		
		System.out.println(Context.getConceptService().getDrugByUuid("3cfcf118-931c-46f7-8ff6-7b876f0d4202").getConcept()
		        .getUuid());
		System.out.println(Context.getService(ICareService.class).getItems());
		for (Item i : Context.getService(ICareService.class).getItems()) {
			if (i.getDrug() != null) {
				System.out.println("Found Drug Concept:" + i.getDrug().getConcept().getUuid());
			}
		}
		newGetRequest = newGetRequest("icare/itemByConcept/15f83cd6-64e9-4e06-a5f9-364d3b14a43d");
		handle = handle(newGetRequest);
		contentString = handle.getContentAsString();
		System.out.println(contentString);
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
	@Ignore
	public void testSendMessage() throws Exception {
		AdministrationService adminService = Context.getService(AdministrationService.class);
		adminService.setGlobalProperty(ICareConfig.MESSAGE_PHONE_NUMBER, "0718026490");
		String dto = this.readFile("dto/send-message-single-dto.json");
		Map<String, Object> item = (new ObjectMapper()).readValue(dto, Map.class);
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
		item.put("dateTime", dateFormat.format(new Date()));
		item.put("id", UUID.randomUUID());
		System.out.println(item.get("dateTime"));
		
		ICareService iCareService = spy(Context.getService(ICareService.class));
		//ICareServiceImpl iCareServiceImpl = mock(ICareServiceImpl.class);
		when(iCareService.sendMessageRequest(new Message())).thenReturn(new Message());
		
		MockHttpServletRequest newPostRequest = newPostRequest("icare/message", item);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		Map<String, Object> map = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		
	}
	
	@Test
	@Ignore
	public void testSendMessages() throws Exception {
		AdministrationService adminService = Context.getService(AdministrationService.class);
		adminService.setGlobalProperty(ICareConfig.MESSAGE_PHONE_NUMBER, "0718026490");
		String dto = this.readFile("dto/send-message-double-dto.json");
		List<Map<String, Object>> items = (new ObjectMapper()).readValue(dto, List.class);
		for (Map item : items) {
			DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
			item.put("dateTime", dateFormat.format(new Date()));
			item.put("id", UUID.randomUUID());
			System.out.println(item.get("dateTime"));
		}
		
		MockHttpServletRequest newPostRequest = newPostRequest("icare/messages", items);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		List<Map<String, Object>> map = (new ObjectMapper()).readValue(handle.getContentAsString(), List.class);
		
	}
	
	@Test
	//@Ignore("Already testing using advice")
	public void testVisitCreation() throws Exception {
		
		//Given
		//Map<String, Object> result = getResourceDTOMap("visit-create-dto");
		Map<String, Object> result = getResourceDTOMap("lab-order-create-dto");
		PatientService patientService = Context.getService(PatientService.class);
		Patient patient = patientService.getPatientByUuid((String) result.get("patient"));
		Visit visit = this.getVisit(patient);
		visit = Context.getVisitService().getVisitByUuid(visit.getUuid());
		for (Encounter encounter : visit.getEncounters()) {
			System.out.println(encounter);
			for (Order order : encounter.getOrders()) {
				System.out.println("orderTypeUuid:" + order.getOrderType().getUuid());
			}
		}
		//When
		MockHttpServletRequest newGetRequest = newGetRequest("icare/visit", new Parameter("orderTypeUuid",
		        "2msir5eb-5345-11e8-9922-40b034c3cfee"));
		
		//Then
		MockHttpServletResponse handle = handle(newGetRequest);
		String visitData = handle.getContentAsString();
		Map visitMap = (new ObjectMapper()).readValue(visitData, Map.class);
		List<Map> visitDetails = (List<Map>) visitMap.get("results");
		System.out.println("visitDetails.size():" + visitDetails.size());
		
		//TODO Check if it is actually what is expected
		assertThat("Should return a visit", visitDetails.size() == 2);
		
		newGetRequest = newGetRequest("icare/visit", new Parameter("orderTypeUuid", "2msir5eb-5345-11e8-9922-40b034c3cfee"),
		    new Parameter("q", "hsdfhe"));
		
		//Then
		handle = handle(newGetRequest);
		visitData = handle.getContentAsString();
		visitMap = (new ObjectMapper()).readValue(visitData, Map.class);
		visitDetails = (List<Map>) visitMap.get("results");
		assertThat("Should not return a visit", visitDetails.size() == 0);
		
		newGetRequest = newGetRequest("icare/visit", new Parameter("orderTypeUuid", "2msir5eb-5345-11e8-9922-40b034c3cfee"),
		    new Parameter("q", "hermione"));
		handle = handle(newGetRequest);
		visitData = handle.getContentAsString();
		visitMap = (new ObjectMapper()).readValue(visitData, Map.class);
		visitDetails = (List<Map>) visitMap.get("results");
		assertThat("Should return a visit", visitDetails.size() == 1);
		
		newGetRequest = newGetRequest("icare/visit", new Parameter("orderTypeUuid", "2msir5eb-5345-11e8-9922-40b034c3cfee"),
		    new Parameter("q", "hermione jean"));
		handle = handle(newGetRequest);
		visitData = handle.getContentAsString();
		visitMap = (new ObjectMapper()).readValue(visitData, Map.class);
		visitDetails = (List<Map>) visitMap.get("results");
		System.out.println(visitDetails);
		assertThat("Should return a visit", visitDetails.size() == 1);
		
	}
	
	@Test
	public void testGetVisitAttribute() throws Exception {
		
		//Get visits by attribute value references
		MockHttpServletRequest newGetRequest = newGetRequest("icare/visit", new Parameter("attributeValueReference", "123"));
		MockHttpServletResponse handle = handle(newGetRequest);
		String visitData = handle.getContentAsString();
		Map visitMap = (new ObjectMapper()).readValue(visitData, Map.class);
		List<Map> visitDetails = (List<Map>) visitMap.get("results");
		assertThat("Should return a visit", visitDetails.size() == 1);
		
		//Get searched patient with visit attribute reference
		newGetRequest = newGetRequest("icare/visit", new Parameter("attributeValueReference", "123"), new Parameter("q",
		        "Harry"));
		handle = handle(newGetRequest);
		visitData = handle.getContentAsString();
		visitMap = (new ObjectMapper()).readValue(visitData, Map.class);
		visitDetails = (List<Map>) visitMap.get("results");
		assertThat("Should return a visit", visitDetails.size() == 1);
		
	}
	
	@Test
	public void testGetPatientsByPaymentStatus() throws Exception {
		
		//Get visits by Payment Status
		//PAID
		MockHttpServletRequest newGetRequest = newGetRequest("icare/visit", new Parameter("orderTypeUuid",
		        "2msir5eb-5345-11e8-9922-40b034c3cfee"), new Parameter("attributeValueReference", "123"), new Parameter(
		        "OrderBy", "ENCOUNTER"), new Parameter("orderByDirection", "ASC"), new Parameter("paymentStatus", "PAID"),
		    new Parameter("q", "Harry"));
		
		MockHttpServletResponse handle = handle(newGetRequest);
		String visitData = handle.getContentAsString();
		Map visitMap = (new ObjectMapper()).readValue(visitData, Map.class);
		List<Map> visitDetails = (List<Map>) visitMap.get("results");
		System.out.println(visitDetails.size());
		assertThat("Should return a visit", visitDetails.size() == 1);
		
		//PENDING
		//		 When testing for pending will return 0 since there are no pending payments
		newGetRequest = newGetRequest("icare/visit", new Parameter("paymentStatus", "PENDING"));
		handle = handle(newGetRequest);
		visitData = handle.getContentAsString();
		visitMap = (new ObjectMapper()).readValue(visitData, Map.class);
		visitDetails = (List<Map>) visitMap.get("results");
		System.out.println(visitDetails.size());
		assertThat("Should return a visit", visitDetails.size() == 0);
		
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
		AdministrationService administrationService = Context.getAdministrationService();
		administrationService.setGlobalProperty(ICareConfig.ALLOW_NEGATIVE_STOCK, "true");
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
		//7bc34d5bde5d829d31cc8c22a455896a97085951
		//, new Parameter("fulfillerStatus","COMPL")
		);
		MockHttpServletResponse handle = handle(newGetRequest);
		
		Map<String, Object> orderResult = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		assertThat("Should return a visit", ((List) orderResult.get("results")).size() == 2);
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
		assertThat("Should return a visit", ((List) orderResult.get("results")).size() > 0);
		
	}
	
	@Test
	public void testGettingItemsByDepartment() throws Exception {
		
		MockHttpServletRequest newGetRequest = newGetRequest("icare/item", new Parameter("department",
		        "z8211c30-5e44-11e8-ie7c-50b6etwQqQee"));
		MockHttpServletResponse handle = handle(newGetRequest);
		Map<String, Object> results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		List<Map<String, Object>> maps = (List) results.get("results");
		assertThat("Should return 1 item", maps.size(), is(1));
		
	}
	
	@Test
	public void testGettingItemsByDrug() throws Exception {
		
		MockHttpServletRequest newGetRequest = newGetRequest("icare/item", new Parameter("type", "DRUG"));
		MockHttpServletResponse handle = handle(newGetRequest);
		Map<String, Object> results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		List<Map<String, Object>> maps = (List) results.get("results");
		assertThat("Should return 1 item", maps.size(), is(1));
		
	}
	
	@Test
	public void testSearchConcepts() throws Exception {
		MockHttpServletRequest newGetRequest = newGetRequest("icare/concept", new Parameter("q", "opd"), new Parameter(
		        "conceptClass", "Test"));
		MockHttpServletResponse handle = handle(newGetRequest);
		Map<String, Object> results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		List<Map<String, Object>> maps = (List) results.get("results");
		assertThat("Should return 1 item", maps.size(), is(1));
		
		newGetRequest = newGetRequest("icare/concept", new Parameter("q", "count"));
		handle = handle(newGetRequest);
		results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		maps = (List) results.get("results");
		assertThat("Should return 1 item", maps.size(), is(1));
		
		newGetRequest = newGetRequest("icare/concept", new Parameter("conceptClass", "Test"));
		handle = handle(newGetRequest);
		results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		maps = (List) results.get("results");
		assertThat("Should return 1 item", maps.size(), is(12));
	}
	
	@Test
	public void testSearchConceptReferenceTerm() throws Exception {
		MockHttpServletRequest newGetRequest = newGetRequest("icare/conceptreferenceterm", new Parameter("q", "cd4 term2"),
		    new Parameter("source", "00001827-639f-4cb4-961f-1e025bf80000"));
		MockHttpServletResponse handle = handle(newGetRequest);
		Map<String, Object> results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		List<Map<String, Object>> maps = (List) results.get("results");
		assertThat("Should return 0 reference term", maps.size(), is(0));
		
		newGetRequest = newGetRequest("icare/conceptreferenceterm", new Parameter("q", ""));
		handle = handle(newGetRequest);
		results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		maps = (List) results.get("results");
		assertThat("Should return 11 reference terms", maps.size(), is(11));
	}
	
	@Test
	public void testGetConceptSetsByConcept() throws Exception {
		MockHttpServletRequest newGetRequest = newGetRequest("icare/conceptsets", new Parameter("concept",
		        "15f83cd6-64e9-4e06-a5f9-364d3b14a43d"));
		MockHttpServletResponse handle = handle(newGetRequest);
		Map<String, Object> results = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		List<Map<String, Object>> maps = (List) results.get("results");
		System.out.println(maps);
		assertThat("Should return 0 concept set", maps.size(), is(0));
	}
	
	@Test
	public void getPatient() throws Exception {
		
		MockHttpServletRequest newGetRequest = newGetRequest("icare/patient", new Parameter("search", "Hermione"));
		MockHttpServletResponse handle = handle(newGetRequest);
		String PatientData = handle.getContentAsString();
		System.out.println("data: " + PatientData);
		Map patientMap = (new ObjectMapper()).readValue(PatientData, Map.class);
		List<Map> visitDetails = (List<Map>) patientMap.get("results");
		assertThat("Should return a patient", visitDetails.size() == 1);
		
		newGetRequest = newGetRequest("icare/patient", new Parameter("patientUUID", "993c46d2-5007-45e8-9512-969300717761"));
		handle = handle(newGetRequest);
		String PatientData2 = handle.getContentAsString();
		System.out.println("data: " + PatientData2);
		Map patientMap2 = (new ObjectMapper()).readValue(PatientData2, Map.class);
		List<Map> visitDetails2 = (List<Map>) patientMap2.get("results");
		assertThat("Should return a patient", visitDetails2.size() == 1);
		
		newGetRequest = newGetRequest("icare/patient", new Parameter("limit", "1"), new Parameter("startIndex", "0"));
		handle = handle(newGetRequest);
		String PatientData3 = handle.getContentAsString();
		Map patientMap3 = (new ObjectMapper()).readValue(PatientData3, Map.class);
		List<Map> visitDetails3 = (List<Map>) patientMap3.get("results");
		assertThat("Should return a patient", visitDetails3.size() == 1);
		
	}
	
	@Test
	public void testSummary() throws Exception {
		
		//Get visits by attribute value references
		MockHttpServletRequest newGetRequest = newGetRequest("icare/summary");
		MockHttpServletResponse handle = handle(newGetRequest);
		String summaryData = handle.getContentAsString();
		Map summaryMap = (new ObjectMapper()).readValue(summaryData, Map.class);
		
		List<Map> summaryDetails = (List<Map>) summaryMap.get("results");
		//assertThat("Should return a visit", visitDetails.size() == 1);
		
		assertThat("Has 8 patient", summaryMap.get("allPatients").equals(8));
		assertThat("Has 8 activeVisits", summaryMap.get("activeVisits").equals(8));
		assertThat("Has 1 location", ((List) summaryMap.get("locations")).size() == 1);
		
	}
	
	@Test
	public void testDrug() throws Exception {
		
		//Get visits by attribute value references
		Drug drug = Context.getConceptService().getAllDrugs().get(0);
		//System.out.println(drug.getConcept().getUuid());
		
		MockHttpServletRequest newGetRequest = newGetRequest("icare/drug", new Parameter("concept", drug.getConcept()
		        .getUuid()));
		MockHttpServletResponse handle = handle(newGetRequest);
		String drugData = handle.getContentAsString();
		//System.out.println(drugData);
		Map drugMap = (new ObjectMapper()).readValue(drugData, Map.class);
		List<Map> drugDetails = (List<Map>) drugMap.get("results");
		//drugDetails.get(0).
		assertThat("Should have drug with display", drug.getDisplayName().equals(drugDetails.get(0).get("display")));
		assertThat("Should have drug with name", drug.getName().equals(drugDetails.get(0).get("name")));
		assertThat("Should have drug with same uuid", drug.getUuid().equals(drugDetails.get(0).get("uuid")));
	}
	
	@Test
	public void testGetClientsFromExternalSystem() throws Exception {
		MockHttpServletRequest newGetRequest = newGetRequest("icare/client/externalsystems", new Parameter("identifier",
		        "2133573"), new Parameter("identifierReference", "t74raEkPShW"));
		MockHttpServletResponse handle = handle(newGetRequest);
		String patientData = handle.getContentAsString();
		//		Map clientDataMap = (new ObjectMapper()).readValue(patientData, Map.class);
		//		System.out.println(clientDataMap.get("trackedEntityInstances"));
		//		System.out.println(patientData);
		//		Map patientDataMap = (new ObjectMapper()).readValue(patientData, Map.class);
		//		List<Map> patientDataDetails = (List<Map>) patientDataMap;
		//		System.out.println(patientDataDetails);
	}
}
