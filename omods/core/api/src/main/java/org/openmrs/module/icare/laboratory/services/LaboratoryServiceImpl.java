package org.openmrs.module.icare.laboratory.services;

import org.apache.commons.collections.IteratorUtils;
import org.openmrs.*;
//import org.openmrs.api.ObsService;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.ObsService;
import org.openmrs.api.context.Context;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.Summary;
import org.openmrs.module.icare.laboratory.dao.*;
import org.openmrs.module.icare.laboratory.models.*;

import javax.naming.ConfigurationException;
import java.util.*;

public class LaboratoryServiceImpl extends BaseOpenmrsService implements LaboratoryService {
	
	SampleDAO sampleDAO;
	
	SampleStatusDAO sampleStatusDAO;
	
	TestAllocationDAO testAllocationDAO;
	
	ResultDAO resultDAO;
	
	TestAllocationStatusDAO testAllocationStatusDAO;
	
	DeviceDAO deviceDAO;
	
	SampleOrderDAO sampleOrderDAO;
	
	TestRangeConfigDAO testRangeConfigDAO;
	
	TestTimeConfigDAO testTimeConfigDAO;
	
	SampleLableDAO sampleLableDAO;
	
	TestOrderLocationDAO testOrderLocationDAO;
	
	BatchDAO batchDAO;
	
	BatchSetDAO batchSetDAO;
	
	BatchSetStatusDAO batchSetStatusDAO;
	
	BatchStatusDAO batchStatusDAO;
	
	public void setSampleDAO(SampleDAO sampleDAO) {
		this.sampleDAO = sampleDAO;
	}
	
	public void setSampleStatusDAO(SampleStatusDAO sampleStatusDAO) {
		this.sampleStatusDAO = sampleStatusDAO;
	}
	
	public void setTestAllocationDAO(TestAllocationDAO testAllocationDAO) {
		this.testAllocationDAO = testAllocationDAO;
	}
	
	public void setResultDAO(ResultDAO resultDAO) {
		this.resultDAO = resultDAO;
	}
	
	public void setDeviceDAO(DeviceDAO deviceDAO) {
		this.deviceDAO = deviceDAO;
	}
	
	public void setSampleOrderDAO(SampleOrderDAO sampleOrderDAO) {
		this.sampleOrderDAO = sampleOrderDAO;
	}
	
	public void setTestAllocationStatusDAO(TestAllocationStatusDAO testAllocationStatusDAO) {
		this.testAllocationStatusDAO = testAllocationStatusDAO;
	}
	
	public void setTestRangeConfigDAO(TestRangeConfigDAO testRangeConfigDAO) {
		this.testRangeConfigDAO = testRangeConfigDAO;
	}
	
	public void setTestTimeConfigDAO(TestTimeConfigDAO testTimeConfigDAO) {
		this.testTimeConfigDAO = testTimeConfigDAO;
	}
	
	public void setSampleLableDAO(SampleLableDAO sampleLableDAO) {
		this.sampleLableDAO = sampleLableDAO;
	}
	
	public void setBatchSetDAO(BatchSetDAO batchSetDAO) {
		this.batchSetDAO = batchSetDAO;
	}
	
	public void setBatchDAO(BatchDAO batchDAO) {
		this.batchDAO = batchDAO;
	}
	
	public void setBatchSetStatusDAO(BatchSetStatusDAO batchSetStatusDAO) {
		this.batchSetStatusDAO = batchSetStatusDAO;
	}
	
	public void setBatchStatusDAO(BatchStatusDAO batchStatusDAO) {
		this.batchStatusDAO = batchStatusDAO;
	}
	
	@Override
	public Sample createSample(Sample sample) {
		this.sampleDAO.save(sample);
		return sample;
	}
	
	@Override
	public List<Sample> getSamplesByVisit(String id) {
		return this.sampleDAO.getSamplesByVisit(id);
	}
	
	@Override
	public List<Sample> getAllSamples() {
		return IteratorUtils.toList(this.sampleDAO.findAll().iterator());
	}
	
	@Override
	public ListResult<Sample> getSamples(Date startDate, Date endDate, Pager pager, String location, String sampleCategory,
	        String testCategory, String q) {
		return this.sampleDAO.getSamples(startDate, endDate, pager, location, sampleCategory, testCategory, q);
	}
	
	@Override
	public List<Sample> getSampleByDates(Date startDate, Date endDate) {
		return this.sampleDAO.getSamplesByDates(startDate, endDate);
	}
	
	@Override
	public SampleStatus updateSampleStatus(SampleStatus sampleStatus) throws Exception {
		
		Sample sample = this.getSampleByUuid(sampleStatus.getSample().getUuid());
		if (sample == null) {
			throw new Exception("Sample with ID '" + sampleStatus.getSample().getUuid() + "' does not exist.");
		}
		User user = Context.getUserService().getUserByUuid(sampleStatus.getUser().getUuid());
		if (user == null) {
			throw new Exception("The user is not authenticated.");
		}
		sampleStatus.setSample(sample);
		sampleStatus.setUser(user);
		return this.sampleStatusDAO.save(sampleStatus);
	}
	
	@Override
	public TestAllocation allocateTestWithSample(TestAllocation testAllocation) throws Exception {
		//Check preconditions
		if (testAllocation.getContainer().getUuid() == null) {
			throw new Exception("Container UUID does not exist. Container uuid must be specified");
		}
		if (testAllocation.getSampleOrder().getSample().getUuid() == null) {
			throw new Exception("Sample UUID does not exist. Sample uuid must be specified");
		}
		if (testAllocation.getSampleOrder().getOrder().getUuid() == null) {
			throw new Exception("Order UUID does not exist. Order uuid must be specified");
		}
		
		//Setting Values
		Order order = Context.getOrderService().getOrderByUuid(testAllocation.getSampleOrder().getOrder().getUuid());
		if (order == null) {
			throw new Exception("Order with ID '" + testAllocation.getSampleOrder().getOrder().getUuid()
			        + "' does not exist.");
		}
		
		Sample sample = this.getSampleByUuid(testAllocation.getSampleOrder().getSample().getUuid());
		if (sample == null) {
			throw new Exception("Sample with ID '" + testAllocation.getSampleOrder().getSample().getUuid()
			        + "' does not exist.");
		}
		
		Concept containerConcept = Context.getConceptService().getConceptByUuid(testAllocation.getContainer().getUuid());
		if (containerConcept == null) {
			throw new Exception("Container Concept with ID '" + testAllocation.getContainer().getUuid()
			        + "' does not exist.");
		}
		
		Concept testConcept = Context.getConceptService().getConceptByUuid(testAllocation.getTestConcept().getUuid());
		if (testConcept == null) {
			throw new Exception("Test Concept with ID '" + testAllocation.getTestConcept().getUuid() + "' does not exist.");
		}
		
		testAllocation.setTestConcept(testConcept);
		testAllocation.setContainer(containerConcept);
		testAllocation.getSampleOrder().setSample(sample);
		testAllocation.getSampleOrder().setOrder(order);
		return this.testAllocationDAO.save(testAllocation);
	}
	
	@Override
	public List<TestAllocation> createAllocationsForSample(List<TestAllocation> testAllocationList) throws Exception {
		
		List<TestAllocation> testAllocationsListToReturn = new ArrayList<TestAllocation>();
		
		for (TestAllocation testAllocation : testAllocationList) {
			
			if (testAllocation.getContainer().getUuid() == null) {
				throw new Exception("Container UUID does not exist. Container uuid must be specified");
			}
			if (testAllocation.getSampleOrder().getSample().getUuid() == null) {
				throw new Exception("Sample UUID does not exist. Sample uuid must be specified");
			}
			if (testAllocation.getSampleOrder().getOrder().getUuid() == null) {
				throw new Exception("Order UUID does not exist. Order uuid must be specified");
			}
			
			//Setting Values
			Order order = Context.getOrderService().getOrderByUuid(testAllocation.getSampleOrder().getOrder().getUuid());
			if (order == null) {
				throw new Exception("Order with ID '" + testAllocation.getSampleOrder().getOrder().getUuid()
				        + "' does not exist.");
			}
			
			Sample sample = this.getSampleByUuid(testAllocation.getSampleOrder().getSample().getUuid());
			if (sample == null) {
				throw new Exception("Sample with ID '" + testAllocation.getSampleOrder().getSample().getUuid()
				        + "' does not exist.");
			}
			
			Concept containerConcept = Context.getConceptService().getConceptByUuid(testAllocation.getContainer().getUuid());
			if (containerConcept == null) {
				throw new Exception("Container Concept with ID '" + testAllocation.getContainer().getUuid()
				        + "' does not exist.");
			}
			
			Concept testConcept = Context.getConceptService().getConceptByUuid(testAllocation.getTestConcept().getUuid());
			if (testConcept == null) {
				throw new Exception("Test Concept with ID '" + testAllocation.getTestConcept().getUuid()
				        + "' does not exist.");
			}
			
			testAllocation.setTestConcept(testConcept);
			testAllocation.setContainer(containerConcept);
			testAllocation.getSampleOrder().setSample(sample);
			testAllocation.getSampleOrder().setOrder(order);
			
			TestAllocation savedTestAllocation = this.testAllocationDAO.save(testAllocation);
			
			testAllocationsListToReturn.add(savedTestAllocation);
			
		}
		
		return testAllocationsListToReturn;
	}
	
	@Override
	public SampleOrder saveSampleOrder(SampleOrder sampleOrder) {
		
		Order order = Context.getOrderService().getOrderByUuid(sampleOrder.getOrder().getUuid());
		Sample sample = this.sampleDAO.findByUuid(sampleOrder.getSample().getUuid());
		User technician = null;
		if (sampleOrder.getTechnician().getUuid() != null) {
			technician = Context.getUserService().getUserByUuid(sampleOrder.getTechnician().getUuid());
		}
		
		sampleOrder.setSample(sample);
		sampleOrder.setOrder(order);
		if (technician != null) {
			sampleOrder.setTechnician(technician);
		}
		
		return this.sampleOrderDAO.save(sampleOrder);
	}
	
	@Override
	public SampleOrder updateSampleOrder(SampleOrder sampleOrder) throws Exception {
		Order order = Context.getOrderService().getOrderByUuid(sampleOrder.getOrder().getUuid());
		sampleOrder.setOrder(order);
		
		Sample sample = this.sampleDAO.findByUuid(sampleOrder.getSample().getUuid());
		sampleOrder.setSample(sample);
		SampleOrder savedSampleOrder = this.sampleOrderDAO.get(sampleOrder.getId());
		
		User user = Context.getUserService().getUserByUuid(sampleOrder.getTechnician().getUuid());
		if (user == null) {
			throw new Exception("The user with uuid '" + sampleOrder.getTechnician().getUuid() + "' does not exists");
		}
		savedSampleOrder.setTechnician(user);
		return this.sampleOrderDAO.save(savedSampleOrder);
		
	}
	
	@Override
	public List<SampleOrder> getSampleOrders() {
		return IteratorUtils.toList(this.sampleOrderDAO.findAll().iterator());
	}
	
	@Override
	public List<Sample> getSampleOrdersBySampleUuid(String sampleUuid) {
		return IteratorUtils.toList(this.sampleOrderDAO.getSampleOrdersBySampleUuid(sampleUuid).iterator());
	}
	
	@Override
	public List<Sample> getAllocationsBySample(String sampleUuid) {
		Sample sample = this.sampleDAO.findByUuid(sampleUuid);
		List<Map<String, Object>> allocations = new ArrayList<>();
		if (sample.getSampleOrders().size() > 0) {
			for (SampleOrder order: sample.getSampleOrders()) {
				if (order.getTestAllocations().size() > 0) {
					for (TestAllocation allocation: order.getTestAllocations()) {
						allocations.add(allocation.toMap());
					}
				}
			}
		}
		return this.testAllocationDAO.getAllocationsBySample(sampleUuid);
	}
	
	@Override
	public List<TestAllocation> getAllocationsByOrder(String orderUuid) {
		return this.testAllocationDAO.getAllocationsByOrder(orderUuid);
	}
	
	@Override
	public List<TestAllocation> getAllAllocations() {
		return IteratorUtils.toList(this.testAllocationDAO.findAll().iterator());
	}
	
	@Override
	public TestAllocation getAllocationByUuid(String allocationUuid) {
		return this.testAllocationDAO.findByUuid(allocationUuid);
	}
	
	@Override
	public Result recordTestAllocationResults(Result result) throws Exception {
		if (result.getConcept().getUuid() == null) {
			throw new Exception("Concept is null. Concept for the result must be provided");
		}
		if (result.getTestAllocation().getUuid() == null) {
			throw new Exception("Test Allocation is null. Test allocation uuid must be provided");
		}
		
		Concept concept = Context.getConceptService().getConceptByUuid(result.getConcept().getUuid());
		if (concept == null) {
			throw new Exception("Concept with id '" + result.getConcept().getUuid() + "' does not exist");
		}
		
		result.setConcept(concept);
		
		TestAllocation testAllocation = this.testAllocationDAO.findByUuid(result.getTestAllocation().getUuid());
		if (testAllocation == null) {
			throw new Exception("Test Allocation with id '" + result.getTestAllocation().getUuid() + "' does not exist");
		}
		result.setTestAllocation(testAllocation);
		
		if (result.getValueCoded() != null) {
			Concept valueCoded = Context.getConceptService().getConceptByUuid(result.getValueCoded().getUuid());
			result.setValueCoded(valueCoded);
		}
		
		if (result.getValueDrug() != null) {
			Drug drug = Context.getConceptService().getDrugByUuid(result.getValueDrug().getUuid());
			result.setValueDrug(drug);
		}
		
		Date date = new Date();
		result.setDateCreated(date);
		
		this.resultDAO.save(result);
		
		return result;
		
	}
	
	public List<Map<String, Object>> saveMultipleResults(List<Result> results) throws Exception {
		List<Map<String, Object>> resultResponses = new ArrayList<>();
		for (Result result: results) {
			if (result.getConcept().getUuid() == null) {
				throw new Exception("Concept is null. Concept for the result must be provided");
			}
			if (result.getTestAllocation().getUuid() == null) {
				throw new Exception("Test Allocation is null. Test allocation uuid must be provided");
			}

			Concept concept = Context.getConceptService().getConceptByUuid(result.getConcept().getUuid());
			if (concept == null) {
				throw new Exception("Concept with id '" + result.getConcept().getUuid() + "' does not exist");
			}

			result.setConcept(concept);

			TestAllocation testAllocation = this.testAllocationDAO.findByUuid(result.getTestAllocation().getUuid());
			if (testAllocation == null) {
				throw new Exception("Test Allocation with id '" + result.getTestAllocation().getUuid() + "' does not exist");
			}
			result.setTestAllocation(testAllocation);

			if (result.getValueCoded() != null) {
				Concept valueCoded = Context.getConceptService().getConceptByUuid(result.getValueCoded().getUuid());
				result.setValueCoded(valueCoded);
			}

			if (result.getValueDrug() != null) {
				Drug drug = Context.getConceptService().getDrugByUuid(result.getValueDrug().getUuid());
				result.setValueDrug(drug);
			}

			if (result.getValueGroup() != null && result.getValueGroup().getUuid() != null) {
				Result valueGroup = this.resultDAO.findByUuid(result.getValueGroup().getUuid());
				System.out.println(valueGroup.getValueText());
				result.setValueGroup(valueGroup);
			}

			if (result.getInstrument() != null) {
				Concept instrument = Context.getConceptService().getConceptByUuid(result.getInstrument().getUuid());
				result.setInstrument(instrument);
			}

			Date date = new Date();
			result.setDateCreated(date);
			System.out.println(result.getValueGroup());

			Result response = this.resultDAO.save(result);

			/*
			Save status via results
			* */
			TestAllocationStatus resultStatus = new TestAllocationStatus();
			resultStatus.setStatus(result.getStatus());
			resultStatus.setCategory(result.getStatusCategory());
			resultStatus.setRemarks(result.getStatusRemarks());
			resultStatus.setTestResult(response);
			resultStatus.setUser(response.getCreator());
			resultStatus.setTestAllocation(response.getTestAllocation());
			this.testAllocationStatusDAO.save(resultStatus);
			/*
			End of save status via results
			* */
//			TODO: Add support to accommodate new status on the allocation response
			resultResponses.add(response.toMap());
		}
		return  resultResponses;
	}
	
	public Map<String, Object> saveResultsInstrument(Map<String, Object> resultsInstrumentObject)throws Exception  {
		Concept instrument = new Concept();
		List responses = new ArrayList();
		if (resultsInstrumentObject.get("instrument") == null || ((Map) resultsInstrumentObject.get("instrument")).get("uuid") == null) {
			throw new Exception("Instrument is not set");
		} else {
//			instrument.setUuid(((Map) resultsInstrumentObject.get("instrument")).get("uuid").toString());
		}

		for (Map<String, Object> resultObject: (ArrayList<Map<String, Object>>) resultsInstrumentObject.get("results")) {
			Result result = new Result();
			result = resultDAO.findByUuid(resultObject.get("uuid").toString());
			String instrumentUuid = ((Map) resultsInstrumentObject.get("instrument")).get("uuid").toString();
			instrument = Context.getConceptService().getConceptByUuid(instrumentUuid);
			Result response = this.resultDAO.updateResultsBySettingInstrument(result, instrument);
			responses.add(response.toMap());
		}
		Map<String, Object> returnResponse = new HashMap<>();
		returnResponse.put("results", responses);
		return returnResponse;
	}
	
	@Override
	public Sample getSampleByUuid(String sampleUuid) {
		return this.sampleDAO.findByUuid(sampleUuid);
	}
	
	@Override
	public List<Result> getResults() {
		return IteratorUtils.toList(this.resultDAO.findAll().iterator());
	}
	
	private Result getResultsByUuid(String uuid) {
		return this.resultDAO.findByUuid(uuid);
	}
	
	private Integer getResultsId(String uuid) {
		return this.resultDAO.findByUuid(uuid).getId();
	}
	
	@Override
	public TestAllocationStatus updateTestAllocationStatus(TestAllocationStatus testAllocationStatus) throws Exception {
		TestAllocation testAllocation = this.testAllocationDAO
		        .findByUuid(testAllocationStatus.getTestAllocation().getUuid());
		if (testAllocation == null) {
			throw new Exception("Test Allocation with ID '" + testAllocationStatus.getTestAllocation().getUuid()
			        + "' does not exist.");
		}
		User user = Context.getUserService().getUserByUuid(testAllocationStatus.getUser().getUuid());
		if (user == null) {
			throw new Exception("The user is not authenticated.");
		}
		
		Result testResult = this.resultDAO.findByUuid(testAllocationStatus.getTestResult().getUuid());
		//		System.out.println(testAllocationStatus.getTestResult().getUuid());
		testAllocationStatus.setTestAllocation(testAllocation);
		testAllocationStatus.setUser(user);
		if (testResult != null) {
			testAllocationStatus.setTestResult(testResult);
		}
		TestAllocationStatus createdStatus = this.testAllocationStatusDAO.save(testAllocationStatus);
		
		//		if (countTestAllocationApprovedStatuses(testAllocation.getUuid()) == 2) {
		
		AdministrationService administrationService = Context.getAdministrationService();
		String labResultApprovalConfig = administrationService
		        .getGlobalProperty(ICareConfig.LAB_RESULT_APPROVAL_CONFIGURATION);
		if (labResultApprovalConfig == null) {
			throw new ConfigurationException("Lab result approval configuration is not set. Please set '"
			        + ICareConfig.LAB_RESULT_APPROVAL_CONFIGURATION + "'");
		}
		
		if ((testAllocationStatus.getStatus().equals("AUTHORIZED") && labResultApprovalConfig.equals("2"))) {
			List<Result> resList = testAllocation.getTestAllocationResults();
			
			Collections.sort(resList, new Comparator<Result>() {
				
				@Override
				public int compare(Result r1, Result r2) {
					return r2.getDateCreated().compareTo(r1.getDateCreated());
				}
			});
			
			Result allocationResults = testResult;
			//					resList.get(resList.size() - 1);
			//			for (Result allocationResults : testAllocation.getTestAllocationResults()) {
			
			if (allocationResults != null) {
				
				ObsService observationService = Context.getObsService();
				
				Encounter encounter = testAllocation.getSampleOrder().getOrder().getEncounter();
				
				Order order = testAllocation.getSampleOrder().getOrder();
				
				Concept concept = Context.getConceptService().getConceptByUuid(allocationResults.getConcept().getUuid());
				
				Person person = testAllocation.getSampleOrder().getOrder().getPatient();
				
				List<TestAllocationStatus> testAllocationStatuses = testAllocation.getTestAllocationStatuses();
				
				List<TestAllocationStatus> resultsRemarks = new ArrayList<TestAllocationStatus>();
				for (TestAllocationStatus status : testAllocationStatuses) {
					if (status.getStatus() != null
					        && (status.getStatus().equals("COMMENT") || status.getStatus().equals("ANSWER DESCRIPTION"))) {
						resultsRemarks.add(status);
					}
				}
				
				Obs observation = new Obs();
				observation.setConcept(concept);
				observation.setEncounter(encounter);
				observation.setCreator(user);
				observation.setOrder(order);
				observation.setPerson(person);
				observation.setObsDatetime(new Date());
				observation.setDateCreated(new Date());
				observation.setVoided(false);
				for (TestAllocationStatus resultsRemark : resultsRemarks) {
					if (resultsRemark.getStatus() != null && resultsRemark.getStatus().equals("ANSWER DESCRIPTION")) {
						observation.setComment(resultsRemark.getRemarks());
					}
				}
				
				//quick fix for lab - to capture coded results
				Concept codedAnswer = Context.getConceptService().getConceptByUuid(allocationResults.getValueText());
				if (codedAnswer != null) {
					observation.setValueCoded(codedAnswer);
				} else {
					if (allocationResults.getValueText() != null) {
						observation.setValueText(allocationResults.getValueText());
					}
					
					if (allocationResults.getValueCoded() != null) {
						observation.setValueCoded(Context.getConceptService().getConceptByUuid(
						    allocationResults.getValueCoded().getUuid()));
					}
					
					if (allocationResults.getValueDrug() != null) {
						observation.setValueDrug(Context.getConceptService().getDrugByUuid(
						    allocationResults.getValueDrug().getUuid()));
					}
					
					if (allocationResults.getValueBoolean() != null) {
						observation.setValueBoolean(allocationResults.getValueBoolean());
					}
					
					if (allocationResults.getValueNumeric() != null) {
						observation.setValueNumeric(allocationResults.getValueNumeric());
					}
				}
				
				observationService.saveObs(observation, "");
				
			}
			
		}
		
		return createdStatus;
	}
	
	public List<Map<String, Object>> updateTestAllocationStatuses(List<TestAllocationStatus> testAllocationStatuses) throws Exception {
		List<Map<String, Object>> responses = new ArrayList<>();
		for(TestAllocationStatus testAllocationStatus: testAllocationStatuses) {
			TestAllocationStatus response = this.updateTestAllocationStatus(testAllocationStatus);
			responses.add(response.toMap());
		}
		return responses;
	}
	
	@Override
	public Device getDeviceByUuid(String deviceUuid) {
		return this.deviceDAO.findByUuid(deviceUuid);
	}
	
	@Override
	public TestRangeConfig createTestRangeConfig(TestRangeConfig testRangeConfig) {
		TestRangeConfig savedTestRangeConfig = this.testRangeConfigDAO.save(testRangeConfig);
		
		return savedTestRangeConfig;
	}
	
	@Override
	public TestRangeConfig updateTestRangeConfig(TestRangeConfig testRangeConfig) {
		
		TestRangeConfig updatedTestRangeConfig = this.testRangeConfigDAO.updateRangeConfigs(testRangeConfig);
		
		return updatedTestRangeConfig;
	}
	
	@Override
	public List<TestRangeConfig> getTestRangeConfigs() {
		return IteratorUtils.toList(this.testRangeConfigDAO.findAll().iterator());
	}
	
	@Override
	public TestRangeConfig getTestRangeConfig(String uuid) {
		return this.testRangeConfigDAO.findByUuid(uuid);
	}
	
	@Override
	public List<TestRangeConfig> getTestRangeConfigByConcept(String testConceptUuid) {
		return this.testRangeConfigDAO.getConfigsByConcept(testConceptUuid);
	}
	
	@Override
	public List<TestRangeConfig> getTestRangeByConceptAndGender(String testConceptUuid, String gender) {
		return this.testRangeConfigDAO.getConfigsByConceptAndGender(testConceptUuid, gender);
	}
	
	@Override
	public TestTimeConfig createTestTimeConfig(TestTimeConfig testTimeConfig) {
		
		TestTimeConfig savedTestTimeConfig = this.testTimeConfigDAO.save(testTimeConfig);
		
		return savedTestTimeConfig;
	}
	
	@Override
	public TestTimeConfig updateTestTimeConfig(TestTimeConfig testTimeConfig) {
		
		TestTimeConfig updatedTestTimeConfig = this.testTimeConfigDAO.updateConfig(testTimeConfig);
		
		return updatedTestTimeConfig;
	}
	
	@Override
	public List<TestTimeConfig> getTestTimeConfigs() {
		return IteratorUtils.toList(this.testTimeConfigDAO.findAll().iterator());
	}
	
	@Override
	public TestTimeConfig getTestTimeConfig(String uuid) {
		return this.testTimeConfigDAO.findByUuid(uuid);
	}
	
	@Override
	public List<TestTimeConfig> getTestTimeConfigByConcept(String testConceptUuid) {
		
		List<TestTimeConfig> configsList = this.testTimeConfigDAO.getConfigsByConcept(testConceptUuid);
		
		return configsList;
	}
	
	@Override
	public List<SampleLable> getSampleLables() {
		return IteratorUtils.toList(this.sampleLableDAO.findAll().iterator());
	}
	
	@Override
	public String generateSampleLabel() {
		return this.sampleLableDAO.generateSampleLabel();
	}
	
	@Override
	public SampleLable addSampleLable(SampleLable sampleLable) {
		return this.sampleLableDAO.save(sampleLable);
	}
	
	@Override
	public SampleLable updateSampleLable(SampleLable sampleLable, Integer previousLable) {
		return this.sampleLableDAO.updateSampleLable(sampleLable, previousLable);
	}
	
	@Override
	public List<Visit> getSamplePendingVisits(Integer limit, Integer startIndex) {
		return this.sampleDAO.getPendingSampleCollectionVisits(limit, startIndex);
	}
	
	Integer countTestAllocationApprovedStatuses(String testAllocationUuid) {
		
		List<TestAllocationStatus> testAllocationsStatuses = this.testAllocationStatusDAO
		        .findTestAllocationStatusByStatusAndTestAllocation(testAllocationUuid);
		
		return testAllocationsStatuses.size();
		
	}
	
	@Override
	public List<Sample> getSamplesByVisitOrPatientAndOrDates(String visitId, String patient, Date startDate, Date endDate) {
		return this.sampleDAO.getSamplesByVisitOrPatientAndOrDates(visitId, patient, startDate, endDate);
	}
	
	@Override
	public TestOrderLocation addTestOrderWithLocation(TestOrderLocation testOrderLocation) {
		
		Concept concept = Context.getConceptService().getConceptByUuid(testOrderLocation.getConcept().getUuid());
		Location location = Context.getLocationService().getLocationByUuid(testOrderLocation.getLocation().getUuid());
		//User user = Context.getUserService().getUserByUuid(testOrderLocation.getUser().getUuid());
		User user = Context.getAuthenticatedUser();
		
		Date date = new Date();
		
		testOrderLocation.setConcept(concept);
		testOrderLocation.setLocation(location);
		testOrderLocation.setUser(user);
		testOrderLocation.setDateTime(date);
		System.out.println(testOrderLocation.toMap());
		
		testOrderLocationDAO.save(testOrderLocation);
		
		return testOrderLocation;
	}
	
	public WorkloadSummary getWorkLoadSummary(Date startDate, Date endDate) {
		
		return sampleDAO.getWorkloadSummary(startDate, endDate);
	}
	
	@Override
	public List<Batch> getBatches(Date startDate, Date endDate, String q, Integer startIndex, Integer limit) {
		return batchDAO.getBatches(startDate, endDate, q, startIndex, limit);
	}
	
	@Override
	public Batch getBatchByUuid(String batchUuid) {
		return batchDAO.findByUuid(batchUuid);
	}
	
	@Override
	public Batch addBatch(Batch batch) {
		return batchDAO.save(batch);
	}
	
	public BatchSet addBatchSet(BatchSet batchSet) {
		return batchSetDAO.save(batchSet);
	}
	
	@Override
	public BatchStatus addBatchStatus(BatchStatus batchStatus) throws Exception {
		
		Batch batch = this.getBatchByUuid(batchStatus.getBatch().getUuid());
		
		if (batch == null) {
			throw new Exception("The batch with id " + batchStatus.getBatch().getUuid() + " does not exist");
		}
		User user = Context.getUserService().getUserByUuid(batchStatus.getUser().getUuid());
		if (user == null) {
			throw new Exception("The user with id " + batchStatus.getUser().getUuid() + " does not exist");
		}
		
		batchStatus.setBatch(batch);
		batchStatus.setUser(user);
		return batchStatusDAO.save(batchStatus);
	}
	
	@Override
	public List<BatchSet> getBatchSets(Date startDate, Date endDate, String q, Integer startIndex, Integer limit) {
		return batchSetDAO.getBatchSets(startDate, endDate, q, startIndex, limit);
	}
	
	@Override
	public BatchSet getBatchSetByUuid(String batchSetUuid) {
		return batchSetDAO.findByUuid(batchSetUuid);
	}
	
	@Override
	public BatchSetStatus addBatchSetStatus(BatchSetStatus batchSetStatus) throws Exception {
		
		BatchSet batchSet = this.getBatchSetByUuid(batchSetStatus.getBatchSet().getUuid());
		if (batchSet == null) {
			throw new Exception("The batchSet with id " + batchSetStatus.getBatchSet().getUuid() + " does not exist");
		}
		
		User user = Context.getUserService().getUserByUuid(batchSetStatus.getUser().getUuid());
		if (user == null) {
			throw new Exception(" The user with id " + batchSetStatus.getUser().getUuid() + " does not exist");
		}
		
		batchSetStatus.setBatchSet(batchSet);
		batchSetStatus.setUser(user);
		
		BatchSetStatus savedBatchSetStatus = batchSetStatusDAO.save(batchSetStatus);
		
		return savedBatchSetStatus;
	}
	
}
