package org.openmrs.module.icare.web.controller;

import org.openmrs.Concept;
import org.openmrs.User;
import org.openmrs.Visit;
import org.openmrs.api.*;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.utils.VisitWrapper;
import org.openmrs.module.icare.laboratory.models.*;
import org.openmrs.module.icare.laboratory.services.LaboratoryService;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Controller
@RequestMapping(value = "/rest/" + RestConstants.VERSION_1 + "/lab")
public class LaboratoryController {
	
	@Autowired
	LaboratoryService laboratoryService;
	
	@Autowired
	VisitService visitService;
	
	@Autowired
	ConceptService conceptService;
	
	@Autowired
	OrderService orderService;
	
	@Autowired
	ProviderService providerService;
	
	@Autowired
	UserService userService;
	
	@RequestMapping(value = "visit", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getPendingVisit(@RequestParam(defaultValue = "100") Integer limit,
	        @RequestParam(defaultValue = "0") Integer startIndex) {
		
		List<Visit> visits = laboratoryService.getSamplePendingVisits(limit, startIndex);
		
		List<Map<String, Object>> responseSamplesObject = new ArrayList<Map<String, Object>>();
		for (Visit visit : visits) {
			
			Map<String, Object> sampleObject = (new VisitWrapper(visit)).toMap();
			
			//add the sample after creating its object
			responseSamplesObject.add(sampleObject);
			
		}
		Map<String,Object> retults = new HashMap<>();
		retults.put("results", responseSamplesObject);
		return retults;
	}
	
	@RequestMapping(value = "sample", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, Object> createNewSample(@RequestBody Map<String, Object> sample) throws IOException {
		
		Sample newSample = new Sample();
		
		Visit existingVisit = visitService.getVisitByUuid(((Map) sample.get("visit")).get("uuid").toString());
		Concept concept = conceptService.getConceptByUuid(((Map) sample.get("concept")).get("uuid").toString());
		
		newSample.setVisit(existingVisit);
		newSample.setConcept(concept);
		newSample.setLabel((String) sample.get("label"));
		
		List<SampleOrder> sampleOrders = new ArrayList<SampleOrder>();
		
		for (Map order : (List<Map>) sample.get("orders")) {
			SampleOrder sampleOrder = new SampleOrder();
			sampleOrder.setOrder(orderService.getOrderByUuid(order.get("uuid").toString()));
			sampleOrder.setSample(newSample);
			
			sampleOrders.add(sampleOrder);
		}
		
		Date date = new Date();
		newSample.setDateTime(date);
		
		newSample.setSampleOrders(sampleOrders);
		
		Sample createdSample = laboratoryService.createSample(newSample);
		
		HashMap<String, Object> response = new HashMap<String, Object>();
		response.put("label", createdSample.getLabel());
		
		HashMap<String, Object> visitObject = new HashMap<String, Object>();
		visitObject.put("uuid", createdSample.getVisit().getUuid());
		visitObject.put("type", createdSample.getVisit().getVisitType().getUuid());
		response.put("visit", visitObject);
		
		HashMap<String, Object> conceptObject = new HashMap<String, Object>();
		conceptObject.put("uuid", createdSample.getConcept().getUuid());
		response.put("concept", conceptObject);
		
		List<Map<String, Object>> orders = new ArrayList<Map<String, Object>>();
		for (SampleOrder sampleOrder : createdSample.getSampleOrders()) {
			
			Map<String, Object> order = new HashMap<String, Object>();
			order.put("uuid", sampleOrder.getOrder().getUuid());
			order.put("orderNumber", sampleOrder.getOrder().getOrderNumber());
			//
			//			List<TestTimeConfig> testTimeConfigs = laboratoryService.getTestTimeConfigByConcept(sampleOrder.getOrder()
			//			        .getConcept().getUuid());
			//			List<Map<String, Object>> mapListTestTimeConfigs = new ArrayList<Map<String, Object>>();
			//			for (TestTimeConfig testTimeConfig : testTimeConfigs) {
			//				mapListTestTimeConfigs.add(testTimeConfig.toMap());
			//			}
			//
			//			order.put("tatconfigs", mapListTestTimeConfigs);
			
			orders.add(order);
			
		}
		response.put("orders", orders);
		
		List<HashMap<String, Object>> sampleStatusesList = new ArrayList<HashMap<String, Object>>();
		for (SampleStatus sampleStatus : createdSample.getSampleStatuses()) {
			HashMap<String, Object> statusesObject = new HashMap<String, Object>();
			statusesObject.put("status", sampleStatus.getStatus());
			statusesObject.put("changedAt", sampleStatus.getTimestamp());
			sampleStatusesList.add(statusesObject);
		}
		
		response.put("status", sampleStatusesList);
		response.put("uuid", createdSample.getUuid());
		
		return response;
	}
	
	@RequestMapping(value = "sample", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getSamplesByVisit(@RequestParam(value = "visit", required = false) String visitId,
	        @RequestParam(value = "patient", required = false) String patient,
	        @RequestParam(value = "startDate", required = false) String startDate,
	        @RequestParam(value = "endDate", required = false) String endDate) {
		
		Date sampleCreatedStartDate = null;
		Date sampleCreatedEndDate = null;
		
		if ((startDate != null || endDate != null) && (startDate.length() > 0 || endDate.length() > 0)) {
			
			SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
			try {
				sampleCreatedStartDate = formatter.parse(startDate);
				if (endDate != null) {
					sampleCreatedEndDate = formatter.parse(endDate);
				}
			}
			catch (Exception e) {
				System.out
				        .println("Dates provided were not in correct format, please format in year-month-date e.g 1990-01-05");
			}
		}
		
		List<Sample> samples = laboratoryService.getSamplesByVisitOrPatientAndOrDates(visitId, patient,
		    sampleCreatedStartDate, sampleCreatedEndDate);
		
		List<Map<String, Object>> responseSamplesObject = new ArrayList<Map<String, Object>>();
		for (Sample sample : samples) {
			
			Map<String, Object> sampleObject = sample.toMap();
			
			//add the sample after creating its object
			responseSamplesObject.add(sampleObject);
			
		}
		
		return responseSamplesObject;
	}
	
	@RequestMapping(value = "sample/{sampleUuid}", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getSamplesByUuid(@PathVariable String sampleUuid) {
		Sample sample = laboratoryService.getSampleByUuid(sampleUuid);
		
		Map<String, Object> sampleObject = sample.toMap();
		return sampleObject;
	}
	
	@RequestMapping(value = "samples", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getAllSamples(@RequestParam(value = "startDate", required = false) String startDate,
	        @RequestParam(value = "endDate", required = false) String endDate,
	        @RequestParam(defaultValue = "true", value = "paging", required = false) boolean paging,
	        @RequestParam(defaultValue = "50", value = "pageSize", required = false) Integer pageSize,
	        @RequestParam(defaultValue = "1", value = "page", required = false) Integer page,
	        @RequestParam(value = "location", required = false) String locationUuid,
	        @RequestParam(value = "sampleCategory", required = false) String sampleCategory,
	        @RequestParam(value = "testCategory", required = false) String testCategory) throws ParseException {
		
		Date start = null;
		Date end = null;
		if (startDate != null && endDate != null) {
			
			SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
			
			start = formatter.parse(startDate);
			end = formatter.parse(endDate);
			
		}
		Pager pager = new Pager();
		pager.setAllowed(paging);
		pager.setPageSize(pageSize);
		pager.setPage(page);
		ListResult<Sample> sampleResults = laboratoryService.getSamples(start, end, pager, locationUuid, sampleCategory,
		    testCategory);
		return sampleResults.toMap();
		/*List<Sample> samples;
		
		if (startDate != null && endDate != null) {
			
			SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
			
			Date start = formatter.parse(startDate);
			Date end = formatter.parse(endDate);
			
			samples = laboratoryService.getSampleByDates(start, end);
			
		} else {
			samples = laboratoryService.getAllSamples();
		}
		
		List<Map<String, Object>> responseSamplesObject = new ArrayList<Map<String, Object>>();
		for (Sample sample : samples) {
			
			Map<String, Object> sampleObject = sample.toMap();
			
			//add the sample after creating its object
			responseSamplesObject.add(sampleObject);
		}
		
		return responseSamplesObject;*/
	}
	
	@RequestMapping(value = "sampleaccept", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, Object> acceptSample(@RequestBody Map<String, Object> sampleStatusWithAllocations) throws Exception {
		
		Map<String, Object> sampleStatusMap = (Map<String, Object>) sampleStatusWithAllocations.get("status");
		SampleStatus sampleStatus = SampleStatus.fromMap(sampleStatusMap);
		SampleStatus savedSampleStatus = laboratoryService.updateSampleStatus(sampleStatus);
		
		List<Map<String, Object>> allocationsMapList = (List<Map<String, Object>>) sampleStatusWithAllocations
		        .get("allocations");
		
		List<TestAllocation> allocationsToSave = new ArrayList<TestAllocation>();
		for (Map<String, Object> allocationMap : allocationsMapList) {
			
			TestAllocation testAllocation = TestAllocation.fromMap(allocationMap);
			
			allocationsToSave.add(testAllocation);
			
		}
		
		List<TestAllocation> savedAllocations = laboratoryService.createAllocationsForSample(allocationsToSave);
		Map<String, Object> response = new HashMap<String, Object>();
		List<Map<String, Object>> savedAllocationsListMap = new ArrayList<Map<String, Object>>();
		for (TestAllocation savedAllocation : savedAllocations) {
			
			savedAllocationsListMap.add((savedAllocation.toMap()));
			
		}
		
		response.put("status", savedSampleStatus.toMap());
		response.put("allocations", savedAllocationsListMap);
		
		return response;
		
	}
	
	@RequestMapping(value = "samplestatus", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addSampleStatus(@RequestBody Map<String, Object> sampleStatusObject) throws Exception {
		
		SampleStatus sampleStatus = SampleStatus.fromMap(sampleStatusObject);
		
		SampleStatus savedSampleStatus = laboratoryService.updateSampleStatus(sampleStatus);
		
		return savedSampleStatus.toMap();//sampleStatusResponse;
		
	}
	
	@RequestMapping(value = "assign", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> updateSampleOrder(@RequestBody Map<String, Object> sampleOrderObject) throws Exception {
		//save a sample order with the technician
		SampleOrder sampleOrder = SampleOrder.fromMap(sampleOrderObject);
		SampleOrder newSampleOrder = laboratoryService.updateSampleOrder(sampleOrder);
		//save the sampleorder
		return newSampleOrder.toMap();
	}
	
	@RequestMapping(value = "allocation", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addTestAllocation(@RequestBody Map<String, Object> testAllocationObject) throws Exception {
		TestAllocation testAllocation = TestAllocation.fromMap(testAllocationObject);
		TestAllocation createdTestAllocation = laboratoryService.allocateTestWithSample(testAllocation);
		return createdTestAllocation.toMap();
	}
	
	@RequestMapping(value = "allocation", method = RequestMethod.GET)
	@ResponseBody
	public List<TestAllocation> getAllocation() {
		return laboratoryService.getAllAllocations();
		
	}
	
	@RequestMapping(value = "results", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addTestAllocationResult(@RequestBody Map<String, Object> resultObject) throws Exception {
		Result result = Result.fromMap(resultObject);
		result.setCreator(Context.getAuthenticatedUser());
		Result savedResults = laboratoryService.recordTestAllocationResults(result);
		return savedResults.toMap();
		
	}
	
	@RequestMapping(value = "results", method = RequestMethod.GET)
	@ResponseBody
	public List<Result> getResults() {
		
		return laboratoryService.getResults();
		
	}
	
	@RequestMapping(value = "allocationstatus", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addTestAllocationStatus(@RequestBody HashMap<String, Object> testAllocationStatusObject)
	        throws Exception {
		TestAllocationStatus testAllocationStatus = TestAllocationStatus.fromMap(testAllocationStatusObject);
		TestAllocationStatus savedTestAllocationStatus = laboratoryService.updateTestAllocationStatus(testAllocationStatus);
		return savedTestAllocationStatus.toMap();
		
	}
	
	@RequestMapping(value = "testtime", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addTestTimeConfiguration(@RequestBody HashMap<String, Object> testTimeConfigurationMap) {
		
		TestTimeConfig testTimeConfig = TestTimeConfig.fromMap(testTimeConfigurationMap);
		
		Concept testConcept = conceptService.getConceptByUuid(testTimeConfig.getConcept().getUuid());
		
		testTimeConfig.setConcept(testConcept);
		
		TestTimeConfig savedTestTimeConfig = laboratoryService.createTestTimeConfig(testTimeConfig);
		
		return savedTestTimeConfig.toMap();
		
	}
	
	@RequestMapping(value = "testtime/{configUUid}", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> updateTestTimeConfiguration(@PathVariable String configUUid,
	        @RequestBody Map<String, Object> testTimeConfigurationMap) {
		
		TestTimeConfig testTimeConfig = TestTimeConfig.fromMap(testTimeConfigurationMap);
		
		TestTimeConfig oldTestTimeConfig = laboratoryService.getTestTimeConfig(configUUid);
		
		testTimeConfig.setDateCreated(oldTestTimeConfig.getDateCreated());
		
		testTimeConfig.setCreator(oldTestTimeConfig.getCreator());
		
		Concept testConcept = conceptService.getConceptByUuid(testTimeConfig.getConcept().getUuid());
		
		testTimeConfig.setConcept(testConcept);
		
		User userUpdating = Context.getAuthenticatedUser();
		
		testTimeConfig.setChangedBy(userUpdating);
		
		testTimeConfig.setDateChanged(new Date());
		
		TestTimeConfig savedTestTimeConfig = laboratoryService.updateTestTimeConfig(testTimeConfig);
		
		return savedTestTimeConfig.toMap();
		
	}
	
	@RequestMapping(value = "testtime", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getTestTimeConfigurations(
	        @RequestParam(value = "concept", required = false) String conceptUuid) {
		
		if (conceptUuid == null) {
			List<TestTimeConfig> testTimeConfigs = this.laboratoryService.getTestTimeConfigs();
			
			List<Map<String, Object>> configsMapList = new ArrayList<Map<String, Object>>();
			
			for (TestTimeConfig config : testTimeConfigs) {
				configsMapList.add(config.toMap());
			}
			return configsMapList;
			
		} else {
			List<TestTimeConfig> testTimeConfigs = this.laboratoryService.getTestTimeConfigByConcept(conceptUuid);
			
			List<Map<String, Object>> configsMapList = new ArrayList<Map<String, Object>>();
			
			for (TestTimeConfig config : testTimeConfigs) {
				configsMapList.add(config.toMap());
			}
			return configsMapList;
			
		}
		
	}
	
	@RequestMapping(value = "testrange", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addTestRangeConfiguration(@RequestBody HashMap<String, Object> testRangeConfigurationMap) {
		
		TestRangeConfig testRangeConfig = TestRangeConfig.fromMap(testRangeConfigurationMap);
		
		List<TestRangeConfig> testRangeConfigs = laboratoryService.getTestRangeByConceptAndGender(testRangeConfig
		        .getConcept().getUuid(), testRangeConfig.getGender());
		
		//		if(testRangeConfigs.size() > 0){
		//
		//			Map<String, Object> configsExistNotification = new HashMap<>();
		//			configsExistNotification.put("message", "Range configurations for test concept ".concat(testRangeConfig.getConcept().getUuid()).concat(" for gender ").concat(testRangeConfig.getGender()).concat(" already exists"));
		//
		//			return configsExistNotification;
		//
		//		}
		
		Concept testConcept = conceptService.getConceptByUuid(testRangeConfig.getConcept().getUuid());
		
		testRangeConfig.setConcept(testConcept);
		
		TestRangeConfig savedTestRangeConfig = laboratoryService.createTestRangeConfig(testRangeConfig);
		
		return savedTestRangeConfig.toMap();
		
	}
	
	@RequestMapping(value = "testrange/{configUuid}", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> updateTestRangeConfiguration(@PathVariable String configUuid,
	        @RequestBody HashMap<String, Object> testRangeConfigurationMap) {
		
		TestRangeConfig testRangeConfig = TestRangeConfig.fromMap(testRangeConfigurationMap);
		
		TestRangeConfig oldTestRangeConfig = laboratoryService.getTestRangeConfig(configUuid);
		
		testRangeConfig.setDateCreated(oldTestRangeConfig.getDateCreated());
		
		testRangeConfig.setCreator(oldTestRangeConfig.getCreator());
		
		Concept testConcept = conceptService.getConceptByUuid(testRangeConfig.getConcept().getUuid());
		
		testRangeConfig.setConcept(testConcept);
		
		User userUpdating = Context.getAuthenticatedUser();
		
		testRangeConfig.setChangedBy(userUpdating);
		
		testRangeConfig.setDateChanged(new Date());
		
		TestRangeConfig updatedTestRangeConfig = laboratoryService.updateTestRangeConfig(testRangeConfig);
		
		return updatedTestRangeConfig.toMap();
		
	}
	
	@RequestMapping(value = "testrange", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getTestRangeConfigurations(
	        @RequestParam(value = "concept", required = false) String conceptUuid) {
		
		if (conceptUuid == null) {
			List<TestRangeConfig> testRangeConfigs = this.laboratoryService.getTestRangeConfigs();
			
			List<Map<String, Object>> configsMapList = new ArrayList<Map<String, Object>>();
			
			for (TestRangeConfig config : testRangeConfigs) {
				configsMapList.add(config.toMap());
			}
			return configsMapList;
			
		} else {
			List<TestRangeConfig> testRangeConfigs = this.laboratoryService.getTestRangeConfigByConcept(conceptUuid);
			
			List<Map<String, Object>> configsMapList = new ArrayList<Map<String, Object>>();
			
			for (TestRangeConfig config : testRangeConfigs) {
				configsMapList.add(config.toMap());
			}
			return configsMapList;
		}
	}
	
	@RequestMapping(value = "samplelable", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> geenerateSampleLable() {
		
		//check if there is a lable existing
		List<SampleLable> sampleLables = laboratoryService.getSampleLables();
		
		if (sampleLables.size() > 0) {
			
			SampleLable existingSampleLable = sampleLables.get(0);
			Date lastDate = existingSampleLable.getTime();
			
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(lastDate);
			
			Integer existingMonth = calendar.get(Calendar.MONTH);
			Integer existingDate = calendar.get(Calendar.DATE);
			
			Date now = new Date();
			Calendar calendar1 = Calendar.getInstance();
			Integer currentMonth = calendar1.get(Calendar.MONTH);
			Integer currentDate = calendar1.get(Calendar.DATE);
			
			if (currentDate == existingDate && currentMonth == existingMonth) {
				SampleLable sampleLable = new SampleLable();
				sampleLable.setTime(now);
				sampleLable.setCurrentLable(existingSampleLable.getCurrentLable() + 1);
				sampleLable.setId(existingSampleLable.getId());
				
				SampleLable savedSampleLable = laboratoryService.updateSampleLable(sampleLable,
				    existingSampleLable.getCurrentLable());
				
				return savedSampleLable.toMap();
			} else {
				
				SampleLable sampleLable = new SampleLable();
				sampleLable.setTime(now);
				sampleLable.setCurrentLable(1);
				sampleLable.setId(existingSampleLable.getId());
				
				SampleLable savedSampleLable = laboratoryService.updateSampleLable(sampleLable,
				    existingSampleLable.getCurrentLable());
				
				return savedSampleLable.toMap();
				
			}
		} else {
			
			SampleLable sampleLable = new SampleLable();
			sampleLable.setCurrentLable(1);
			
			Date currentTime = new Date();
			sampleLable.setTime(currentTime);
			
			SampleLable savedSampleLable = laboratoryService.addSampleLable(sampleLable);
			
			return savedSampleLable.toMap();
			
		}
		
	}
	
	@RequestMapping(value = "testorderlocation", method = RequestMethod.POST)
	@ResponseBody
	public TestOrderLocation createTestOrderWithLocation(@RequestBody Map<String, Object> testOrderLocation) {
		
		return laboratoryService.addTestOrderWithLocation(TestOrderLocation.fromMap(testOrderLocation));
		
	}
	
	@RequestMapping(value = "workloadsummary", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> onGetWorkloadSummary(@RequestParam(value = "startDate", required = false) String startDate,
	        @RequestParam(value = "endDate", required = false) String endDate) throws ParseException {
		
		Date start = null;
		Date end = null;
		if (startDate != null && endDate != null) {
			
			SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
			
			start = formatter.parse(startDate);
			end = formatter.parse(endDate);
			
		}
		
		WorkloadSummary workloadSummary = laboratoryService.getWorkLoadSummary(start, end);
		
		return workloadSummary.toMap();
	}
	
}
