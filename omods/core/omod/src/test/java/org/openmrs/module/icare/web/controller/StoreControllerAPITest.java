package org.openmrs.module.icare.web.controller;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.LocationService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.store.models.IssueStatus;
import org.openmrs.module.icare.store.models.Requisition;
import org.openmrs.module.icare.store.models.RequisitionStatus;
import org.openmrs.module.icare.store.services.StoreService;
import org.openmrs.module.icare.web.controller.core.BaseResourceControllerTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.when;

public class StoreControllerAPITest extends BaseResourceControllerTest {
	
	@Autowired
	StoreService storeService;
	
	@Before
	public void setUp() throws SQLException {
		initializeInMemoryDatabase();
		executeDataSet("store-data.xml");
		AdministrationService adminService = Context.getService(AdministrationService.class);
		adminService.setGlobalProperty(ICareConfig.ALLOW_NEGATIVE_STOCK, "false");
	}
	
	@Test
	public void testCreatingReorderLevelAndGettingAllReorderLevels() throws Exception {
		
		//gien
		String dto = this.readFile("dto/store/reorder-level-create.json");
		Map<String, Object> reorderLevel = (new ObjectMapper()).readValue(dto, Map.class);
		
		//when
		MockHttpServletRequest newPostRequest = newPostRequest("store/reorderlevel", reorderLevel);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//then
		
		Map<String, Object> createdReorderLevelMap = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		assertThat("created reorder level location uuid is 44939999-d333-fff2-9bff-61d11117c22e",
		    ((Map) createdReorderLevelMap.get("location")).get("uuid").toString(),
		    is("44939999-d333-fff2-9bff-61d11117c22e"));
		assertThat("created reorder level quantity is 44939999-d333-fff2-9bff-61d11117c22e",
		    createdReorderLevelMap.get("quantity").toString(), is(Double.valueOf(30).toString()));
		assertThat("created reorder level item uuid is 8777d43571-yy77-11ff-2244-08002007777",
		    ((Map) createdReorderLevelMap.get("item")).get("uuid").toString(), is("8777d43571-yy77-11ff-2244-08002007777"));
		
		//test by fetching
		//given
		MockHttpServletRequest newGetRequest = newGetRequest("store/reorderlevels");
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> reorderLevelsList = (new ObjectMapper()).readValue(handleGet.getContentAsString(),
		    List.class);
		
		assertThat("List of reorderlevel has one reorderlevel:", reorderLevelsList.size(), is(2));
		
		boolean found = false;
		for (Map<String, Object> reorderlevel : reorderLevelsList) {
			
			if (reorderlevel.get("quantity").toString().equals(Double.valueOf(30).toString())) {
				found = true;
				
				assertThat("created reorder level location uuid is 44939999-d333-fff2-9bff-61d11117c22e",
				    ((Map) reorderlevel.get("location")).get("uuid").toString(), is("44939999-d333-fff2-9bff-61d11117c22e"));
				assertThat("created reorder level quantity is 44939999-d333-fff2-9bff-61d11117c22e",
				    reorderlevel.get("quantity").toString(), is(Double.valueOf(30).toString()));
				assertThat("created reorder level item uuid is 8777d43571-yy77-11ff-2244-08002007777",
				    ((Map) reorderlevel.get("item")).get("uuid").toString(), is("8777d43571-yy77-11ff-2244-08002007777"));
			}
			
		}
		
		assertThat("reorder level found", found, is(true));
		
	}
	
	@Test
	public void testCreatingALedgerTypeAndGettingAllLedgerTypess() throws Exception {
		
		String dto = this.readFile("dto/store/ledger-type-create.json");
		Map<String, Object> ledgerType = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("store/ledgertype", ledgerType);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		MockHttpServletRequest newGetRequest = newGetRequest("store/ledgertypes");
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> ledgerTypes = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("List of ledgertypes has two ledgertypes:", ledgerTypes.size(), is(2));
		
		Boolean found = false;
		for (Map<String, Object> ledgerTypeMap : ledgerTypes) {
			if (ledgerTypeMap.get("name").toString().equals("transfer-in")) {
				found = true;
				assertThat("The leger type operation is +", ledgerTypeMap.get("operation").toString(), is("+"));
				
			}
		}
		
		assertThat("The leger type added is found", found, is(true));
		
	}
	
	@Test
	public void testCreatingALedgerEntryAndGettingAllLedgers() throws Exception {
		
		//Given
		String dto = this.readFile("dto/store/ledger-add.json");
		Map<String, Object> ledgerEntry = (new ObjectMapper()).readValue(dto, Map.class);
		
		//When
		MockHttpServletRequest newPostRequest = newPostRequest("store/ledger", ledgerEntry);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//Then
		Map<String, Object> ledger = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		MockHttpServletRequest newGetRequest = newGetRequest("store/ledgers");
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> ledgers = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("Listing of requests has one request:", ledgers.size(), is(1));
		
		assertThat("The location is store A", ((Map) ledgers.get(0).get("location")).get("display").toString(),
		    is("store A"));
		
		assertThat("The quantity is 35", (ledgers.get(0).get("quantity")).toString(), is("35.0"));
		
		assertThat("The quantity is 35", (ledgers.get(0).get("buyingPrice")).toString(), is("100.5"));
		
	}
	
	@Test
	public void testCreatingALedgerEntrySameBatch() throws Exception {
		
		//Given
		String dto = this.readFile("dto/store/ledger-add.json");
		Map<String, Object> ledgerEntry = (new ObjectMapper()).readValue(dto, Map.class);
		MockHttpServletRequest newPostRequest = newPostRequest("store/ledger", ledgerEntry);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//When
		ledgerEntry.put("expiryDate", "2021-07-27");
		ledgerEntry.put("buyingPrice", 0);
		newPostRequest = newPostRequest("store/ledger", ledgerEntry);
		handle = handle(newPostRequest);
		
		//Then
		Map<String, Object> ledger = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		MockHttpServletRequest newGetRequest = newGetRequest("store/ledgers");
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> ledgers = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("Listing of requests has one request:", ledgers.size(), is(2));
		
		assertThat("The location is store A", ((Map) ledgers.get(0).get("location")).get("display").toString(),
		    is("store A"));
		
		assertThat("The quantity is 35", (ledgers.get(0).get("quantity")).toString(), is("35.0"));
		
		assertThat("The quantity is 35", (ledgers.get(0).get("buyingPrice")).toString(), is("100.5"));
		
		MockHttpServletRequest newGetRequest1 = newGetRequest("store/stock", new Parameter("locationUuid",
		        ((Map) ledgerEntry.get("location")).get("uuid").toString()));
		MockHttpServletResponse handleGet1 = handle(newGetRequest1);
		
		List<Map<String, Object>> stocks = (new ObjectMapper()).readValue(handleGet1.getContentAsString(), List.class);
		assertThat("Only 6 stock items", stocks.size(), is(6));
		assertThat("Only two stock items", stocks.get(3).get("quantity").toString(), is("10.0"));
		
	}
	
	@Test
	public void testCreatingARequestAndGetReqByRequestingLocation() throws Exception {
		
		String dto = this.readFile("dto/store/requisition-create.json");
		Map<String, Object> requisition = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("store/request", requisition);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		MockHttpServletRequest newGetRequest = newGetRequest("store/requests", new Parameter("requestingLocationUuid",
		        "44938888-e444-ggg3-8aee-61d22227c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> requests = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("Listing of requests has one request:", requests.size(), is(1));
		
		assertThat("The requested location id store A", ((Map) requests.get(0).get("requestedLocation")).get("display")
		        .toString(), is("store A"));
		
		assertThat("The request has one request item", ((List) requests.get(0).get("requisitionItems")).size(), is(1));
		
		assertThat("The requesting location id store B", ((Map) requests.get(0).get("requestingLocation")).get("display")
		        .toString(), is("store B"));
		
	}
	
	@Test
	public void testIssueingAnItemAndViewingIssues() throws Exception {
		
		//Given request
		Map<String, Object> requisitionMap = createRequisition();
		
		String dto = this.readFile("dto/store/issue-create.json");
		Map<String, Object> issue = (new ObjectMapper()).readValue(dto, Map.class);
		
		Map<String, Object> requsition = new HashMap<String, Object>();
		requsition.put("uuid", requisitionMap.get("uuid").toString());
		
		issue.put("requisition", requsition);
		
		//When post an issue
		MockHttpServletRequest newPostRequest = newPostRequest("store/issue", issue);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		System.out.println("the output");
		System.out.println(handle.getContentAsString());
		
		//Then get issues
		MockHttpServletRequest newGetRequest = newGetRequest("store/issues", new Parameter("issuedLocationUuid",
		        "44938888-e444-ggg3-8aee-61d22227c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> issues = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("Listing of receipts has one receipt:", issues.size(), is(1));
		
		assertThat("The receiving location is store A", ((Map) issues.get(0).get("issuedLocation")).get("display")
		        .toString(), is("store B"));
		
		assertThat("The issuing location is store B", ((Map) issues.get(0).get("issueingLocation")).get("display")
		        .toString(), is("store A"));
		
	}
	
	@Test
	public void testIssueingMoreThanAvailableStock() throws Exception {
		//Given request
		Map<String, Object> requisitionMap = createRequisition();
		
		String dto = this.readFile("dto/store/issue-create-30.json");
		Map<String, Object> issue = (new ObjectMapper()).readValue(dto, Map.class);
		
		Map<String, Object> requsition = new HashMap<String, Object>();
		requsition.put("uuid", requisitionMap.get("uuid").toString());
		
		issue.put("requisition", requsition);
		
		//When post an issue
		MockHttpServletRequest newPostRequest = newPostRequest("store/issue", issue);
		
		MockHttpServletResponse handle;
		String response;
		//The request should throw an exception
		try {
			handle = handle(newPostRequest);
			response = handle.getContentAsString();
		}
		catch (Exception e) {
			System.out.println(e.getMessage());
			response = e.getMessage();
		}
		assertThat("The request threw a Negative stock exception", response, is("Negative Stock is not allowed"));
		
	}
	
	@Test
	public void testIssueingFromSeveralBatches() throws Exception {
		
		//Given request
		Map<String, Object> requisitionMap = createRequisition();
		
		String dto = this.readFile("dto/store/issue-create-15.json");
		Map<String, Object> issue = (new ObjectMapper()).readValue(dto, Map.class);
		
		Map<String, Object> requsition = new HashMap<String, Object>();
		requsition.put("uuid", requisitionMap.get("uuid").toString());
		
		issue.put("requisition", requsition);
		
		//When post an issue
		MockHttpServletRequest newPostRequest = newPostRequest("store/issue", issue);
		
		MockHttpServletResponse handle = handle(newPostRequest);
		;
		
		// get stock from the same location for the same item
		MockHttpServletRequest getStockRequest = newGetRequest("store/stock");
		getStockRequest.addParameter("locationUuid",
		    (String) ((Map<String, Object>) issue.get("issueingLocation")).get("uuid"));
		MockHttpServletResponse handleGetStock = handle(getStockRequest);
		
		System.out.println(handleGetStock.getContentAsString());
	}
	
	@Test
	public void testIssueingFromOneOutOfManyAvailableBatches() {
		
	}
	
	@Test
	public void testReceivingAnItemAndViewingReceipts() throws Exception {
		
		Map<String, Object> issueMap = createRequisitionAndIssue();
		
		String dto = this.readFile("dto/receipt-create.json");
		Map<String, Object> receipt = (new ObjectMapper()).readValue(dto, Map.class);
		
		Map<String, Object> issue = new HashMap<String, Object>();
		issue.put("uuid", issueMap.get("uuid").toString());
		
		receipt.put("issue", issue);
		
		//post receipt
		MockHttpServletRequest newPostRequest = newPostRequest("store/receive", receipt);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		//get receipts
		MockHttpServletRequest newGetRequest = newGetRequest("store/receipts", new Parameter("issueingLocationUuid",
		        "44939999-d333-fff2-9bff-61d11117c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
	}
	
	@Test
	public void testAddingStatusToRequest() throws Exception {
		
		//create a request
		Map<String, Object> createdRequistionMap = createRequisition();
		
		//add status
		String dto = this.readFile("dto/store/requisition-status-create.json");
		Map<String, Object> requisitionStatus = (new ObjectMapper()).readValue(dto, Map.class);
		
		Map<String, Object> requsition = new HashMap<String, Object>();
		requsition.put("uuid", createdRequistionMap.get("uuid").toString());
		
		requisitionStatus.put("requisition", requsition);
		requisitionStatus.put("status", RequisitionStatus.RequisitionStatusCode.REQUESTED);
		
		MockHttpServletRequest newPostRequest = newPostRequest("store/requeststatus", requisitionStatus);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		StoreService storeService = Context.getService(StoreService.class);
		List<RequisitionStatus> list = storeService.getRequisitionStatuses();
		
		List<Requisition> reqs = storeService.getRequestsByRequestingLocation("44938888-e444-ggg3-8aee-61d22227c22e");
		
		//get the requests
		
		MockHttpServletRequest newGetRequest = newGetRequest("store/requests", new Parameter("requestingLocationUuid",
		        "44938888-e444-ggg3-8aee-61d22227c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> requests = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		Map<String, Object> request = requests.get(0);
		
		assertThat("requisition statuses are more than one for the request",
		    ((List) request.get("requisitionStatuses")).size(), is(1));
		
	}
	
	@Test
	public void testAddingStatusToIssue() throws Exception {
		//request
		Map<String, Object> requisitionMap = createRequisition();
		
		String dto = this.readFile("dto/store/issue-create.json");
		Map<String, Object> issue = (new ObjectMapper()).readValue(dto, Map.class);
		
		Map<String, Object> requsition = new HashMap<String, Object>();
		requsition.put("uuid", requisitionMap.get("uuid").toString());
		
		issue.put("requisition", requsition);
		
		//post an issue
		MockHttpServletRequest newPostRequest = newPostRequest("store/issue", issue);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		List<Map<String, Object>> issues = getIssuesIssuedFromStoreA();
		Map<String, Object> issueMap = issues.get(0);
		
		String dtoIssueStatus = this.readFile("dto/store/issue-status-create.json");
		Map<String, Object> issueStatus = (new ObjectMapper()).readValue(dtoIssueStatus, Map.class);
		
		Map<String, Object> issueObject = new HashMap<String, Object>();
		issueObject.put("uuid", issueMap.get("uuid").toString());
		
		issueStatus.put("issue", issueObject);
		issueStatus.put("status", IssueStatus.IssueStatusCode.ISSUED);
		
		//post an issue status
		MockHttpServletRequest issueStatusPostRequest = newPostRequest("store/issuestatus", issueStatus);
		MockHttpServletResponse handleIssueStatusPostRequest = handle(issueStatusPostRequest);
		
		StoreService storeService = Context.getService(StoreService.class);
		List<IssueStatus> issueStatuses = storeService.getIssueStatuses();
		
		issues = getIssuesIssuedFromStoreA();
		
		Map<String, Object> issueObjectMap = issues.get(0);
		
		assertThat("issues statuses are more than one for the request", ((List) issueObjectMap.get("issueStatuses")).size(),
		    is(2));
		
	}
	
	@Test
	public void testGettingAllStock() throws Exception {
		
		//get stock status
		MockHttpServletRequest newGetRequest = newGetRequest("store/stock");
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> stockList = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("stock listing has 5 entries:", stockList.size(), is(5));
		
		//assertThat("The stock quantity is 100", (stockList.get(0).get("quantity")).toString(), is("100.0"));
		
	}
	
	@Test
	public void testGettingStockByLocation() throws Exception {
		
		//get stock status
		MockHttpServletRequest newGetRequest = newGetRequest("store/stock", new Parameter("locationUuid",
		        "44939999-d333-fff2-9bff-61d11117c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> stockList = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("stock listing has 5 entries:", stockList.size(), is(5));
		
		//assertThat("The stock quantity is 100", (stockList.get(0).get("quantity")).toString(), is("100.0"));
		
	}
	
	@Test
	public void testGettingStockByUnknownLocation() throws Exception {
		
		//get stock status
		MockHttpServletRequest newGetRequest = newGetRequest("store/stock", new Parameter("locationUuid",
		        "55555999-d333-fff2-9bff-61d11117c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> stockList = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("stock listing has no entry:", stockList.size(), is(0));
		
	}
	
	@Test
	public void testGettingStockByItemAndLocation() throws Exception {
		//get stock status
		MockHttpServletRequest newGetRequest = newGetRequest("store/item/8o00d43570-8y37-11f3-1234-08002007777/stock",
		    new Parameter("locationUuid", "44939999-d333-fff2-9bff-61d11117c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> stockList = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("stock listing has 4 entries:", stockList.size(), is(4));
		
		//assertThat("The stock quantity is 100", (stockList.get(0).get("quantity")).toString(), is("100.0"));
		
	}
	
	@Test
	public void testGettingStockByItem() throws Exception {
		//get stock status
		MockHttpServletRequest newGetRequest = newGetRequest("store/item/8o00d43570-8y37-11f3-1234-08002007777/stock");
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> stockList = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("stock listing has 4 entries:", stockList.size(), is(4));
		
		boolean found = false;
		
		for (Map<String, Object> stockMap : stockList) {
			if (stockMap.get("quantity").toString().equals("100.0")) {
				found = true;
				assertThat("The stock quantity is 100", (stockMap.get("quantity")).toString(), is("100.0"));
			}
		}
		
		assertThat("The stock is found", found, is(true));
		
	}
	
	@Test
	public void testGettingStockout() throws Exception {
		// Given
		
		//get stock status
		MockHttpServletRequest newGetRequest = newGetRequest("store/stockout");
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> stockoutList = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("stockOut listing has one entry:", stockoutList.size(), is(1));
	}
	
	@Test
	public void testGettingStockoutByLocationWithStock() throws Exception {
		//Given
		LocationService locationService = Context.getLocationService();
		//When
		MockHttpServletRequest newGetRequest = newGetRequest("store/stockout", new Parameter("location",
		        "44939999-d333-fff2-9bff-61d11117c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		//Then
		String result = handleGet.getContentAsString();
		List<Map<String, Object>> stockoutList = (new ObjectMapper()).readValue(result, List.class);
		assertThat("stockOut listing has no entry:", stockoutList.size(), is(1));
	}
	
	@Test
	public void testGettingStockoutByLocationWithoutStock() throws Exception {
		//Given
		LocationService locationService = Context.getLocationService();
		//When
		MockHttpServletRequest newGetRequest = newGetRequest("store/stockout", new Parameter("location",
		        "44938888-e444-ggg3-8aee-61d22227c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		//Then
		List<Map<String, Object>> stockoutList = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		assertThat("stockOut listing has no entry:", stockoutList.size(), is(3));
	}
	
	@Test
	public void testStockMetricsEndpoint() throws Exception {
		//Give
		
		//When
		
		MockHttpServletRequest newGetRequest = newGetRequest("store/metrics", new Parameter("location",
		        "44939999-d333-fff2-9bff-61d11117c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		//Then
		
	}
	
	public Map<String, Object> createRequisition() throws Exception {
		String dto = this.readFile("dto/store/requisition-create.json");
		Map<String, Object> requisition = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest newPostRequest = newPostRequest("store/request", requisition);
		MockHttpServletResponse handle = handle(newPostRequest);
		
		return (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
	}
	
	public Map<String, Object> createRequisitionAndIssue() throws Exception {
		String dto = this.readFile("dto/store/requisition-create.json");
		Map<String, Object> requisition = (new ObjectMapper()).readValue(dto, Map.class);
		
		MockHttpServletRequest postRequest = newPostRequest("store/request", requisition);
		MockHttpServletResponse handle = handle(postRequest);
		
		Map<String, Object> requisitionMap = (new ObjectMapper()).readValue(handle.getContentAsString(), Map.class);
		
		String dtoIssue = this.readFile("dto/store/issue-create.json");
		Map<String, Object> issue = (new ObjectMapper()).readValue(dtoIssue, Map.class);
		
		Map<String, Object> requsition = new HashMap<String, Object>();
		requsition.put("uuid", requisitionMap.get("uuid").toString());
		
		issue.put("requisition", requsition);
		
		//post an issue
		MockHttpServletRequest newPostRequest = newPostRequest("store/issue", issue);
		MockHttpServletResponse handleIssue = handle(newPostRequest);
		
		return (new ObjectMapper()).readValue(handleIssue.getContentAsString(), Map.class);
		
	}
	
	public List<Map<String, Object>> getIssuesIssuedFromStoreA() throws Exception {
		//get issues
		MockHttpServletRequest newGetRequest = newGetRequest("store/issues", new Parameter("issuedLocationUuid",
		        "44938888-e444-ggg3-8aee-61d22227c22e"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> issues = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		return issues;
	}
	
	@Test
	public void getStockByConceptClassName() throws Exception {
		MockHttpServletRequest newGetRequest = newGetRequest("store/stock", new Parameter("locationUuid",
		        "44939999-d333-fff2-9bff-61d11117c22e"), new Parameter("conceptClassName", "Test"));
		MockHttpServletResponse handleGet = handle(newGetRequest);
		
		List<Map<String, Object>> stockList = (new ObjectMapper()).readValue(handleGet.getContentAsString(), List.class);
		
		System.out.println(stockList);
		assertThat("stock listing has 4 entries:", stockList.size(), is(4));
	}
}
