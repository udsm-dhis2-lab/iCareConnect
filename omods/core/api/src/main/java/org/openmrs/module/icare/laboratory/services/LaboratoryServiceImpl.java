package org.openmrs.module.icare.laboratory.services;

import org.apache.commons.collections.IteratorUtils;
import org.openmrs.*;
//import org.openmrs.api.ObsService;
import org.openmrs.api.ObsService;
import org.openmrs.api.context.Context;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.Summary;
import org.openmrs.module.icare.laboratory.dao.*;
import org.openmrs.module.icare.laboratory.models.*;

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
	        String testCategory) {
		return this.sampleDAO.getSamples(startDate, endDate, pager, location, sampleCategory, testCategory);
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
	public List<TestAllocation> getAllocationBySample(String sampleId) {
		
		return this.testAllocationDAO.getAllocationBySample(sampleId);
		
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
		
		this.resultDAO.save(result);
		
		return result;
		
	}
	
	@Override
	public Sample getSampleByUuid(String sampleUuid) {
		return this.sampleDAO.findByUuid(sampleUuid);
	}
	
	@Override
	public List<Result> getResults() {
		return IteratorUtils.toList(this.resultDAO.findAll().iterator());
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
		testAllocationStatus.setTestAllocation(testAllocation);
		testAllocationStatus.setUser(user);
		TestAllocationStatus createdStatus = this.testAllocationStatusDAO.save(testAllocationStatus);
		
		//		if (countTestAllocationApprovedStatuses(testAllocation.getUuid()) == 2) {
		
		if (testAllocationStatus.getRemarks().equals("SECOND_APPROVAL")) {
			List<Result> resList = testAllocation.getTestAllocationResults();
			
			Collections.sort(resList, new Comparator<Result>() {
				
				@Override
				public int compare(Result r1, Result r2) {
					return r2.getDateCreated().compareTo(r1.getDateCreated());
				}
			});
			
			Result allocationResults = resList.get(resList.size() - 1);
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
					if (status.getStatus().equals("COMMENT") || status.getStatus().equals("ANSWER DESCRIPTION")) {
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
					if (resultsRemark.getStatus().equals("ANSWER DESCRIPTION")) {
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
	
}
