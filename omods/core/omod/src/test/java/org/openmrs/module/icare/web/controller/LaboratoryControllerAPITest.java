package org.openmrs.module.icare.web.controller;

import org.apache.commons.collections.IteratorUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openmrs.*;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.core.Summary;
import org.openmrs.module.icare.laboratory.dao.TestOrderLocationDAO;
import org.openmrs.module.icare.laboratory.models.TestOrderLocation;
import org.openmrs.module.icare.laboratory.models.WorkloadSummary;
import org.openmrs.module.icare.laboratory.services.LaboratoryService;
import org.openmrs.module.icare.web.controller.core.BaseResourceControllerTest;
import org.openmrs.module.webservices.rest.SimpleObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class LaboratoryControllerAPITest extends BaseResourceControllerTest {
	
	@Autowired
	LaboratoryService laboratoryService;
	
	@Mock
	TestOrderLocationDAO testOrderLocationDAO;
	
	@Before
	public void setUp() throws SQLException {
		initializeInMemoryDatabase();
		executeDataSet("lab-data.xml");
	}
	
	@Test
	public void testConversion() {
		SimpleObject sample = new SimpleObject();
		sample.add("visit", (new SimpleObject().add("uuid", "d9c1d8ac-2b8e-427f-804d-b858c52e6f11")));
		sample.add("label", "Test Label X");
		sample.add("concept", (new SimpleObject().add("uuid", "a8102d6d-c528-477a-80bd-acc38ebc6252")));
		sample.add("technician", (new SimpleObject().add("uuid", "1a61a0b5-d271-4b00-a803-5cef8b06ba8f")));
		
		List<SimpleObject> orders = new ArrayList<SimpleObject>();
		SimpleObject order = new SimpleObject().add("uuid", "6746395c-1117-4abd-8fd7-a748c9575abcd");
		orders.add(order);
		
		sample.add("orders", orders);
	}
	
	@Test
	public void testCreatingASampleAndGettingSampleByVisitIdThenUpdateSampleOrder() throws Exception {
		//Given
		MockHttpServletRequest newGetRequest = newGetRequest("lab/visit");
		MockHttpServletResponse handle = handle(newGetRequest);
		String res = handle.getContentAsString();
		Map<String, Object> visitResults = (new ObjectMapper()).readValue(res, Map.class);
		
		List<Map<String, Object>> visits = (List<Map<String, Object>>) visitResults.get("results");
		System.out.println("Res:" + res);
		System.out.println("Testing:" + visits.size());
		String dto = this.readFile("dto/sample-create-dto.json");
		Map<String, Object> sample = (new ObjectMapper()).readValue(dto, Map.class);
		
		//When
		MockHttpServletRequest newPostRequest = newPostRequest("lab/sample", sample);
		handle = handle(newPostRequest);
		
		//Then
		//TODO put test for the results that should be returned to the client
		newGetRequest = newGetRequest("lab/sample", new Parameter("visit", "d9c1d8ac-2b8e-427f-804d-b858c52e6f11"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		List<Map<String, Object>> createdsample = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("Samples are added to total 3:", createdsample.size(), is(4));
		boolean found = false;
		for (Map<String, Object> sampleMap : createdsample) {
			if (sampleMap.get("label").equals("Create Sample Test")) {
				found = true;
				List<Map<String, Object>> sampleOrders = (List<Map<String, Object>>) sampleMap.get("orders");
				assertThat("Sample order has been created:", sampleOrders.size(), is(1));
				assertThat("Sample order has legit order number:",
				    (((Map) ((Map) sampleOrders.get(0)).get("order"))).get("orderNumber").toString(), is("123"));
				assertThat("Sample order has legit order:", (((Map) ((Map) sampleOrders.get(0)).get("order"))).get("uuid")
				        .toString(), is("6746395c-1117-4abd-8fd7-a748c9575abcd"));
				
			}
		}
		assertThat("Created sample is found:", found, is(true));
	}
	
	@Test
	public void testUpdateSampleOrder() throws Exception {
		//Given
		String dto = this.readFile("dto/sample-order-create-dto.json");
		Map<String, Object> sampleOrder = (new ObjectMapper()).readValue(dto, Map.class);
		
		//When
		MockHttpServletRequest newSampleOrderUpdateRequest = newPostRequest("lab/assign", sampleOrder);
		
		MockHttpServletResponse handleSampleOrder = handle(newSampleOrderUpdateRequest);
		
		//Then
		MockHttpServletRequest newGetRequest = newGetRequest("lab/sample", new Parameter("visit",
		        "d9c1d8ac-2b8e-427f-804d-b858c52e6f11"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		List<Map<String, Object>> createdsample = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		boolean found = false;
		for (Map<String, Object> sampleMap : createdsample) {
			if (sampleMap.get("uuid").equals("x311y666-zz77-11e3-1111-08002007777")) {
				found = true;
				
				List<Map<String, Object>> sampleOrders = (List<Map<String, Object>>) sampleMap.get("orders");
				assertThat("Sample order has been created:", sampleOrders.size(), is(1));
				Map technician = (Map) (sampleOrders.get(0)).get("technician");
				assertThat("Should contain technician:", technician != null, is(true));
				assertThat("Should contain technician uuid:", technician.get("uuid").toString(),
				    is("36b071d8-d5ea-4703-8e56-5b066420b569"));
			}
		}
		assertThat("Updated sample is found:", found, is(true));
	}
	
	@Test
	public void testAddingSampleStatusAndGettingSampleWithStatus() throws Exception {
		
		String dto = this.readFile("dto/sample-status-create-dto.json");
		Map<String, Object> sampleStatus = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("lab/samplestatus", sampleStatus);
		
		MockHttpServletResponse handle = handle(newPostRequest);
		
		MockHttpServletRequest newGetRequest = newGetRequest("lab/sample", new Parameter("visit",
		        "d9c1d8ac-2b8e-427f-804d-b858c52e6f11"));
		
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> sampleWithStatus = (new ObjectMapper()).readValue(handleGet.getContentAsString(),
		    List.class);
		boolean sampleFound = false;
		for (Map sample : sampleWithStatus) {
			if (sample.get("uuid").equals("d365e560-zz77-11e3-1111-08002007777")) {
				
				System.out.println(((List<Map>) sample.get("statuses")).get(0));
				
				sampleFound = true;
				assertThat("list of statuses is greater than 0", ((List<Map>) sample.get("statuses")).size(), is(1));
				Map<String, Object> status = ((List<Map>) sample.get("statuses")).get(0);
				assertThat("list of statuses is greater than 0", (String) status.get("status"), is("RECEIVED"));
			}
		}
		assertThat("Sample should be found", sampleFound, is(true));
		//assertThat("", sampleWithStatus.size() > 0));
		//assertThat("list of statuses is greater than 0", ((List<Map>)sampleWithStatus.get(0).get("statuses")).size(), is(1));
		
	}
	
	@Test
	public void testAcceptAndCreatingAllocations() throws Exception {
		
		String dto = this.readFile("dto/accept-allocations.json");
		Map<String, Object> sampleStatusAndAllocations = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("lab/sampleaccept", sampleStatusAndAllocations);
		
		MockHttpServletResponse handle = handle(newPostRequest);
		
		MockHttpServletRequest sampleGetRequest = newGetRequest("lab/sample/x311y666-zz77-11e3-1111-08002007777");
		
		MockHttpServletResponse handleSampleGet = handle(sampleGetRequest);
		
	}
	
	@Test
	public void testGettingSampleByVisitOrPatientUuidAndOrDates() throws Exception {
		
		MockHttpServletRequest newSampleGetByPatientRequest = newGetRequest("lab/sample");
		
		newSampleGetByPatientRequest.addParameter("patient", "660484f6-0d02-4e2a-8e0e-fd2f71906f81");
		MockHttpServletResponse handleGet = handle(newSampleGetByPatientRequest);
		System.out.println("Done testing with patient \n");
		newSampleGetByPatientRequest.removeParameter("patient");
		
		newSampleGetByPatientRequest.addParameter("visit", "d9c1d8ac-2b8e-427f-804d-b858c52e6f11");
		
		handle(newSampleGetByPatientRequest);
		System.out.println("Done testing with visit \n");
		newSampleGetByPatientRequest.removeParameter("visit");
		
		newSampleGetByPatientRequest.addParameter("startDate", "2022-01-01");
		
		handle(newSampleGetByPatientRequest);
		System.out.println("Done testing with start date only \n");
		
		newSampleGetByPatientRequest.addParameter("endDate", "2022-07-29");
		
		handle(newSampleGetByPatientRequest);
		System.out.println("Done testing with start date and end date only \n");
		
		newSampleGetByPatientRequest.addParameter("patient", "660484f6-0d02-4e2a-8e0e-fd2f71906f81");
		
		handle(newSampleGetByPatientRequest);
		System.out.println("Done testing with start , end date and patient \n");
		newSampleGetByPatientRequest.removeParameter("patient");
		
		newSampleGetByPatientRequest.addParameter("visit", "d9c1d8ac-2b8e-427f-804d-b858c52e6f11");
		
		handle(newSampleGetByPatientRequest);
		System.out.println("Done testing with start , end date and visit \n");
		
	}
	
	@Test
	public void testGettingSamples() throws Exception {
		
		MockHttpServletRequest newGetRequest = newGetRequest("lab/samples", new Parameter("page", "2"), new Parameter(
		        "pageSize", "2"));
		
		//System.out.println(Context.getVisitService().getVisitByUuid("d9c1d8ac-2b8e-427f-804d-b858c52e6f11").getLocation().getUuid());
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		//System.out.println(Context.getVisitService().getVisitByUuid("d9c1d8ac-2b8e-427f-804d-b858c52e6f11").getLocation().getUuid());
		Map<String, Object> sampleResults = (new ObjectMapper()).readValue(handleGet.getContentAsString(), Map.class);
		
		Map<String, Object> pagerObject = (Map<String, Object>) sampleResults.get("pager");
		assertThat("Page Count is 2", (Integer) pagerObject.get("pageCount") == 2, is(true));
		assertThat("Total is 3", (Integer) pagerObject.get("total") == 3, is(true));
		assertThat("Page Size is 2", (Integer) pagerObject.get("pageSize") == 2, is(true));
		assertThat("Page is 2", (Integer) pagerObject.get("page") == 2, is(true));
		assertThat("List count is 1", ((List) sampleResults.get("results")).size() == 1, is(true));
		assertThat(
		    "There is atleast 1 sample for the visit from lab-data.xml with visit id = d9c1d8ac-2b8e-427f-804d-b858c52e6f11",
		    handleGet.getContentAsString().contains("d9c1d8ac-2b8e-427f-804d-b858c52e6f11"));
		
		newGetRequest = newGetRequest("lab/samples", new Parameter("location", "58c57d25-8d39-41ab-8422-108a0c277d98"));
		
		//System.out.println(Context.getVisitService().getVisitByUuid("d9c1d8ac-2b8e-427f-804d-b858c52e6f11").getLocation().getUuid());
		handleGet = handle(newGetRequest);
		
		System.out.println(handleGet.getContentAsString());
		//System.out.println(Context.getVisitService().getVisitByUuid("d9c1d8ac-2b8e-427f-804d-b858c52e6f11").getLocation().getUuid());
		sampleResults = (new ObjectMapper()).readValue(handleGet.getContentAsString(), Map.class);
		
		pagerObject = (Map<String, Object>) sampleResults.get("pager");
		System.out.println((Integer) pagerObject.get("pageCount"));
		assertThat("Page Count is 2", (Integer) pagerObject.get("pageCount") == 0, is(true));
		assertThat("Total is 3", (Integer) pagerObject.get("total") == 0, is(true));
		assertThat("Page Size is 2", (Integer) pagerObject.get("pageSize") == 50, is(true));
		assertThat("Page is 2", (Integer) pagerObject.get("page") == 1, is(true));
		assertThat("List count is 1", ((List) sampleResults.get("results")).size() == 0, is(true));
	}
	
	@Test
	public void testGettingSamplesBySamplesbyCategory() throws Exception {
		
		// creating sample status
		String dto = this.readFile("dto/sample-status-create-dto.json");
		Map<String, Object> sampleStatus = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("lab/samplestatus", sampleStatus);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//Creating allocation status
		//Given
		String dto2 = this.readFile("dto/test-allocation-status-create.json");
		Map<String, Object> testAllocationStatus = (new ObjectMapper()).readValue(dto2, Map.class);
		
		//When
		MockHttpServletRequest newPostRequest2 = newPostRequest("lab/allocationstatus", testAllocationStatus);
		MockHttpServletResponse handle2 = handle(newPostRequest2);
		
		MockHttpServletRequest newGetRequest = newGetRequest("lab/samples", new Parameter("sampleCategory", "RECEIVED"),
		    new Parameter("startDate", "2020-12-27"), new Parameter("endDate", "2022-10-10"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		Map<String, Object> sampleResults = (new ObjectMapper()).readValue(handleGet.getContentAsString(), Map.class);
		
		MockHttpServletRequest newGetRequest2 = newGetRequest("lab/samples", new Parameter("testCategory", "RESULTS"),
		    new Parameter("startDate", "2020-12-27"), new Parameter("endDate", "2022-10-10"));
		MockHttpServletResponse handleGet2 = handle(newGetRequest2);
		Map<String, Object> sampleResults2 = (new ObjectMapper()).readValue(handleGet2.getContentAsString(), Map.class);
		
		MockHttpServletRequest newGetRequest3 = newGetRequest("lab/samples", new Parameter("testCategory", "Completed"),
		    new Parameter("startDate", "2020-12-27"));
		MockHttpServletResponse handleGet3 = handle(newGetRequest3);
		Map<String, Object> sampleResults3 = (new ObjectMapper()).readValue(handleGet3.getContentAsString(), Map.class);
		
		System.out.println("Results1: " + sampleResults);
		System.out.println("Results2: " + sampleResults2);
		System.out.println("Results3: " + sampleResults3);
		
		assertThat("Should return a sample", ((List) sampleResults.get("results")).size() == 1);
		assertThat("Should return a sample", ((List) sampleResults2.get("results")).size() == 1);
		
	}
	
	@Test
	public void testUpdatingSampleOrder() throws Exception {
		
		SimpleObject sampleOrder = new SimpleObject();
		//testAllocation.add("label", "Test Label Y");
		sampleOrder.add("order", new SimpleObject().add("uuid", "7634gd66-3333-4abd-8fd7-a748c9575abcd"));
		//testAllocation.add("container", new SimpleObject().add("uuid", "d365e560-zz77-11e3-1111-0sndiu87hsju"));
		sampleOrder.add("sample", new SimpleObject().add("uuid", "x311y666-zz77-11e3-1111-08002007777"));
		sampleOrder.add("technician", new SimpleObject().add("uuid", "36b071d8-d5ea-4703-8e56-5b066420b569"));
		
		MockHttpServletRequest newPostRequest = newPostRequest("lab/assign", sampleOrder);
		
		MockHttpServletResponse handle = handle(newPostRequest);
		
		MockHttpServletRequest newGetResquest = newGetRequest("lab/samples");
		
		MockHttpServletResponse handleGet = handle(newGetResquest);
		
	}
	
	@Test
	public void testAddingAnAllocation() throws Exception {
		//Given
		String dto = this.readFile("dto/test-allocation-create.json");
		Map<String, Object> testAllocation = (new ObjectMapper()).readValue(dto, Map.class);
		
		//When
		MockHttpServletRequest newPostRequest = newPostRequest("lab/allocation", testAllocation);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//Then
		Map<String, Object> newAllocation = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		
		assertThat("allocation should exist", newAllocation != null);
		assertThat("allocation label should be allocation u", newAllocation.get("label").toString(),
		    is(testAllocation.get("label").toString()));
		assertThat("allocation container uuid should be 333111zz-0011-477v-8y8y-acc38ebc6252",
		    ((Map) newAllocation.get("container")).get("uuid").toString(), is("333111zz-0011-477v-8y8y-acc38ebc6252"));
		
	}
	
	@Test
	public void testigAddingResults() throws Exception {
		
		//Given
		String dto = this.readFile("dto/result-create.json");
		Map<String, Object> resultObject = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("lab/results", resultObject);
		
		MockHttpServletResponse handle = handle(newPostRequest);
		
		Map<String, Object> newResultsObject = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		
		assertThat("result should exist", newResultsObject != null);
		assertThat("result valueText should be 5.88", newResultsObject.get("valueText").toString(), is("5.88"));
		assertThat("result concept uuid should be 111111xx-0000-477a-8u8u-acc38ebc6252",
		    ((Map) newResultsObject.get("concept")).get("uuid").toString(), is("111111xx-0000-477a-8u8u-acc38ebc6252"));
		
	}
	
	@Test
	public void testAddingTestAllocationStatus() throws Exception {
		
		//Given
		String dto = this.readFile("dto/test-allocation-status-create.json");
		Map<String, Object> testAllocationStatus = (new ObjectMapper()).readValue(dto, Map.class);
		
		//When
		MockHttpServletRequest newPostRequest = newPostRequest("lab/allocationstatus", testAllocationStatus);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//Then
		Map<String, Object> testAllocationStatusResult = (new ObjectMapper()).readValue(handle.getContentAsString(),
		    Map.class);
		assertThat("Remarks are set", testAllocationStatusResult.get("remarks"), is(testAllocationStatus.get("remarks")));
		assertThat("Status are set", testAllocationStatusResult.get("status"), is(testAllocationStatus.get("status")));
		assertThat("User is legit", ((Map) testAllocationStatusResult.get("user")).get("uuid"),
		    is(((Map) testAllocationStatus.get("user")).get("uuid")));
		
		MockHttpServletRequest newGetRequest = newGetRequest("lab/sample", new Parameter("visit",
		        "d9c1d8ac-2b8e-427f-804d-b858c52e6f11"));
		
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> sampleWithAllocations = (new ObjectMapper()).readValue(handleGet.getContentAsString(),
		    List.class);
		boolean sampleFound = false;
		for (Map sample : sampleWithAllocations) {
			if (sample.get("uuid").equals("x311y666-zz77-11e3-1111-08002007777")) {
				sampleFound = true;
				assertThat("list of statuses is greater than 0", ((List<Map>) sample.get("orders")).size(), is(1));
				Map<String, Object> order = ((List<Map>) sample.get("orders")).get(0);
				Map<String, Object> testAllocation = (Map<String, Object>) ((List) order.get("testAllocations")).get(0);
				Map<String, Object> status = (Map<String, Object>) ((List) testAllocation.get("statuses")).get(0);
				assertThat("Remarks are set", status.get("remarks"), is(testAllocationStatus.get("remarks")));
				assertThat("Status are set", status.get("status"), is(testAllocationStatus.get("status")));
				assertThat("User is legit", ((Map) status.get("user")).get("uuid"),
				    is(((Map) testAllocationStatus.get("user")).get("uuid")));
			}
		}
		assertThat("Sample should be found", sampleFound, is(true));
	}
	
	@Test
	public void testSavingObservationAfterApprovalIsComplete() throws Exception {
		
		//Given
		String dto = this.readFile("dto/test-allocation-approve.json");
		Map<String, Object> testAllocationStatus = (new ObjectMapper()).readValue(dto, Map.class);
		//Context.getObsService().get
		//When
		MockHttpServletRequest newPostRequest = newPostRequest("lab/allocationstatus", testAllocationStatus);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//get encounter
		Encounter encounter = Context.getEncounterService().getEncounterByUuid("444395c-dd07-488d-8fd7-a748c9570000");
		
		//check for the results observation
		List<Obs> observations = (List<Obs>) IteratorUtils.toList(encounter.getObs().iterator());
		
		//Then
		assertThat("The encounter should one observation", observations.size(), is(1));
		assertThat("The observation concept name is mrdt result", observations.get(0).getConcept().getName().getName(),
		    is("mrdt result"));
		assertThat("The observation value text should be positive", observations.get(0).getValueText(), is("positive"));
		
	}
	
	@Test
	public void testGettingSummaryWorkload() throws Exception {
		
		//Given
		String dto = this.readFile("dto/test-allocation-reject.json");
		Map<String, Object> testAllocationStatus = (new ObjectMapper()).readValue(dto, Map.class);
		
		//When
		MockHttpServletRequest newPostRequest = newPostRequest("lab/allocationstatus", testAllocationStatus);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//When
		MockHttpServletRequest newGetRequest = newGetRequest("lab/workloadsummary",
		    new Parameter("startDate", "2020-12-27"), new Parameter("endDate", "2022-10-10"));
		handle = handle(newGetRequest);
		
		String workloadsummaryData = handle.getContentAsString();
		Map summaryMap = (new ObjectMapper()).readValue(workloadsummaryData, Map.class);
		
		List<Map> summaryDetails = (List<Map>) summaryMap.get("results");
		
		System.out.println(summaryMap);
		
		assertThat("Has 1 rejected sample", summaryMap.get("samplesWithRejectedResults").equals(1));
		assertThat("Has 1 authorized sample", summaryMap.get("samplesAuthorized").equals(1));
		assertThat("Has 2  no completeresult sample", summaryMap.get("samplesWithNoResults").equals(2));
		assertThat("Has Atleast 1 result sample", summaryMap.get("samplesWithResults").equals(1));
		
	}
	
	@Override
	public String getURI() {
		return null;
	}
	
	@Override
	public String getUuid() {
		return null;
	}
	
	@Override
	public long getAllCount() {
		return 0;
	}
	
}
