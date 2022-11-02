package org.openmrs.module.icare.laboratory.services;

import org.openmrs.Visit;
import org.openmrs.api.OpenmrsService;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.laboratory.models.*;

import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;

@Transactional
public interface LaboratoryService extends OpenmrsService {
	
	@Transactional
	Sample createSample(Sample sample);
	
	List<Sample> getSamplesByVisit(String id);
	
	List<Sample> getAllSamples();
	
	ListResult<Sample> getSamples(Date startDate, Date endDate, Pager pager, String location, String sampleCategory,
	        String testCategory);
	
	List<Sample> getSampleByDates(Date startDate, Date endDate);
	
	SampleStatus updateSampleStatus(SampleStatus sampleStatus) throws Exception;
	
	@Transactional
	TestAllocation allocateTestWithSample(TestAllocation testAllocation) throws Exception;
	
	List<TestAllocation> createAllocationsForSample(List<TestAllocation> testAllocationList) throws Exception;
	
	SampleOrder updateSampleOrder(SampleOrder sampleOrder) throws Exception;
	
	List<SampleOrder> getSampleOrders();
	
	SampleOrder saveSampleOrder(SampleOrder sampleOrder);
	
	List<TestAllocation> getAllocationBySample(String sampleUuid);
	
	List<TestAllocation> getAllAllocations();
	
	TestAllocation getAllocationByUuid(String allocationUuid);
	
	@Transactional
	Result recordTestAllocationResults(Result result) throws Exception;
	
	Sample getSampleByUuid(String sampleUuid);
	
	List<Result> getResults();
	
	TestAllocationStatus updateTestAllocationStatus(TestAllocationStatus testAllocationStatus) throws Exception;
	
	Device getDeviceByUuid(String deviceUuid);
	
	TestRangeConfig createTestRangeConfig(TestRangeConfig testRangeConfig);
	
	TestRangeConfig updateTestRangeConfig(TestRangeConfig testRangeConfig);
	
	List<TestRangeConfig> getTestRangeConfigs();
	
	TestRangeConfig getTestRangeConfig(String uuid);
	
	List<TestRangeConfig> getTestRangeConfigByConcept(String testConceptUuid);
	
	List<TestRangeConfig> getTestRangeByConceptAndGender(String testConceptUuid, String gender);
	
	TestTimeConfig createTestTimeConfig(TestTimeConfig testTimeConfig);
	
	TestTimeConfig updateTestTimeConfig(TestTimeConfig testTimeConfig);
	
	List<TestTimeConfig> getTestTimeConfigs();
	
	TestTimeConfig getTestTimeConfig(String uuid);
	
	List<TestTimeConfig> getTestTimeConfigByConcept(String testConceptUuid);
	
	List<SampleLable> getSampleLables();
	
	SampleLable addSampleLable(SampleLable sampleLable);
	
	SampleLable updateSampleLable(SampleLable sampleLable, Integer previousLable);
	
	List<Visit> getSamplePendingVisits(Integer limit, Integer startIndex);
	
	TestOrderLocation addTestOrderWithLocation(TestOrderLocation testOrderLocation);
	
	List<Sample> getSamplesByVisitOrPatientAndOrDates(String visitId, String patient, Date startDate, Date endDate);
	
	WorkloadSummary getWorkLoadSummary(Date startDate, Date endDate);
	
}
