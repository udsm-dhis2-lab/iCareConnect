package org.openmrs.module.icare.laboratory.services;

import org.apache.commons.collections.IteratorUtils;
import org.openmrs.*;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.ObsService;
import org.openmrs.api.context.Context;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.core.ICareService;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.laboratory.dao.*;
import org.openmrs.module.icare.laboratory.models.*;

import javax.naming.ConfigurationException;
import java.util.*;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LaboratoryServiceImpl extends BaseOpenmrsService implements LaboratoryService {
	
	SampleDAO sampleDAO;
	
	SampleStatusDAO sampleStatusDAO;
	
	StorageDAO storageDAO;
	
	StorageTypeDAO storageTypeDAO;
	
	StorageLocationTypeDAO storageLocationTypeDAO;
	
	StorageLocationDAO storageLocationDAO;
	
	SampleStorageOccupancyDAO sampleStorageOccupancyDAO;
	
	SampleDisposalRecordDAO sampleDisposalRecordDAO;
	
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
	
	WorksheetDAO worksheetDAO;
	
	WorksheetControlDAO worksheetControlDAO;
	
	WorksheetDefinitionDAO worksheetDefinitionDAO;
	
	WorksheetSampleDAO worksheetSampleDAO;
	
	WorksheetStatusDAO worksheetStatusDAO;
	
	WorksheetSampleStatusDAO worksheetSampleStatusDAO;
	
	BatchSampleDAO batchSampleDAO;
	
	AssociatedFieldDAO associatedFieldDAO;
	
	TestAllocationAssociatedFieldDAO testAllocationAssociatedFieldDAO;
	
	AssociatedFieldResultDAO associatedFieldResultDAO;
	
	public void setSampleDAO(SampleDAO sampleDAO) {
		this.sampleDAO = sampleDAO;
	}
	
	public void setSampleStatusDAO(SampleStatusDAO sampleStatusDAO) {
		this.sampleStatusDAO = sampleStatusDAO;
	}
	
	public void setStorageDAO(StorageDAO storageDAO) {
		this.storageDAO = storageDAO;
	}
	
	public void setStorageTypeDAO(StorageTypeDAO storageTypeDAO) {
		this.storageTypeDAO = storageTypeDAO;
	}
	
	public void setStorageLocationTypeDAO(StorageLocationTypeDAO storageLocationTypeDAO) {
		this.storageLocationTypeDAO = storageLocationTypeDAO;
	}
	
	public void setStorageLocationDAO(StorageLocationDAO storageLocationDAO) {
		this.storageLocationDAO = storageLocationDAO;
	}
	
	public void setSampleStorageOccupancyDAO(SampleStorageOccupancyDAO sampleStorageOccupancyDAO) {
		this.sampleStorageOccupancyDAO = sampleStorageOccupancyDAO;
	}
	
	public void setSampleDisposalRecordDAO(SampleDisposalRecordDAO sampleDisposalRecordDAO) {
		this.sampleDisposalRecordDAO = sampleDisposalRecordDAO;
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
	
	public void setBatchSampleDAO(BatchSampleDAO batchSampleDAO) {
		this.batchSampleDAO = batchSampleDAO;
	}
	
	public void setBatchSetStatusDAO(BatchSetStatusDAO batchSetStatusDAO) {
		this.batchSetStatusDAO = batchSetStatusDAO;
	}
	
	public void setBatchStatusDAO(BatchStatusDAO batchStatusDAO) {
		this.batchStatusDAO = batchStatusDAO;
	}
	
	public void setWorksheetDAO(WorksheetDAO worksheetDAO) {
		this.worksheetDAO = worksheetDAO;
	}
	
	public void setWorksheetControlDAO(WorksheetControlDAO worksheetControlDAO) {
		this.worksheetControlDAO = worksheetControlDAO;
	}
	
	public void setWorksheetDefinitionDAO(WorksheetDefinitionDAO worksheetDefinitionDAO) {
		this.worksheetDefinitionDAO = worksheetDefinitionDAO;
	}
	
	public void setWorksheetSampleDAO(WorksheetSampleDAO worksheetSampleDAO) {
		this.worksheetSampleDAO = worksheetSampleDAO;
	}
	
	public void setWorksheetStatusDAO(WorksheetStatusDAO worksheetStatusDAO) {
		this.worksheetStatusDAO = worksheetStatusDAO;
	}
	
	public void setWorksheetSampleStatusDAO(WorksheetSampleStatusDAO worksheetSampleStatusDAO) {
		this.worksheetSampleStatusDAO = worksheetSampleStatusDAO;
	}
	
	public void setAssociatedFieldDAO(AssociatedFieldDAO associatedFieldDAO) {
		this.associatedFieldDAO = associatedFieldDAO;
	}
	
	public void setTestAllocationAssociatedFieldDAO(TestAllocationAssociatedFieldDAO testAllocationAssociatedFieldDAO) {
		this.testAllocationAssociatedFieldDAO = testAllocationAssociatedFieldDAO;
	}
	
	public void setAssociatedFieldResultDAO(AssociatedFieldResultDAO associatedFieldResultDAO) {
		this.associatedFieldResultDAO = associatedFieldResultDAO;
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
	        String testCategory, String q, String hasStatus, String acceptedByUuid, String testConceptUuid,
	        String departmentUuid, String specimenSourceUuid, String instrumentUuid, String visitUuid, String excludeStatus) {
		return this.sampleDAO.getSamples(startDate, endDate, pager, location, sampleCategory, testCategory, q, hasStatus,
		    acceptedByUuid, testConceptUuid, departmentUuid, specimenSourceUuid, instrumentUuid, visitUuid, excludeStatus);
	}
	
	@Override
	public ListResult<Sample> getSamplesByOrderType(Date startDate, Date endDate, Pager pager, String orderTypeUuid,
	        Boolean haveThisOrderType, String q, String fulfillerStatus, String formUuid, Boolean haveThisForm,
	        Boolean combineWithOr) {
		return this.sampleDAO.getSamplesByOrderType(startDate, endDate, pager, orderTypeUuid, haveThisOrderType, q,
		    fulfillerStatus, formUuid, haveThisForm, combineWithOr);
	}
	
	@Override
	public List<Sample> getSampleByDates(Date startDate, Date endDate) {
		return this.sampleDAO.getSamplesByDates(startDate, endDate);
	}
	
	@Override
	public SampleStatus saveSampleStatus(SampleStatus sampleStatus) throws Exception {
		return this.sampleStatusDAO.save(sampleStatus);
	}
	
	@Override
	public SampleStatus updateSampleStatus(SampleStatus sampleStatus) throws Exception {
		
		// Retrieve the sample from the database by UUID
		Sample sample = this.getSampleByUuid(sampleStatus.getSample().getUuid());
		if (sample == null) {
			throw new Exception("Sample with ID '" + sampleStatus.getSample().getUuid() + "' does not exist.");
		}
		
		User user;
		if (sampleStatus.getUser() != null && sampleStatus.getUser().getUuid() != null) {
			// Retrieve the existing user by UUID if specified
			user = Context.getUserService().getUserByUuid(sampleStatus.getUser().getUuid());
			if (user == null) {
				throw new Exception("User with UUID '" + sampleStatus.getUser().getUuid() + "' does not exist.");
			}
		} else {
			// Otherwise, use the authenticated user
			user = Context.getAuthenticatedUser();
			if (user == null) {
				throw new Exception("The user is not authenticated.");
			}
		}
		
		// Ensure that sample and user are set on the sampleStatus object
		sampleStatus.setSample(sample);
		sampleStatus.setUser(user);
		
		// Save the sampleStatus entity
		return this.sampleStatusDAO.save(sampleStatus);
	}
	
	@Override
	public SampleStatus addSampleStorageStatus(SampleStatus sampleStatus) throws Exception {
		if (sampleStatus == null) {
			throw new Exception("Sample storage status details are required.");
		}
		if (sampleStatus.getCategory() == null || sampleStatus.getCategory().trim().equals("")) {
			sampleStatus.setCategory("STORAGE");
		}
		if (sampleStatus.getStatus() == null || sampleStatus.getStatus().trim().equals("")) {
			sampleStatus.setStatus("STORED");
		}
		if (sampleStatus.getTimestamp() == null) {
			sampleStatus.setTimestamp(new Date());
		}
		return updateSampleStatus(sampleStatus);
	}
	
	@Override
	public SampleStatus addSampleDisposalStatus(SampleStatus sampleStatus) throws Exception {
		if (sampleStatus == null) {
			throw new Exception("Sample disposal status details are required.");
		}
		if (sampleStatus.getCategory() == null || sampleStatus.getCategory().trim().equals("")) {
			sampleStatus.setCategory("DISPOSAL");
		}
		if (sampleStatus.getStatus() == null || sampleStatus.getStatus().trim().equals("")) {
			sampleStatus.setStatus("DISPOSED");
		}
		if (sampleStatus.getTimestamp() == null) {
			sampleStatus.setTimestamp(new Date());
		}
		return updateSampleStatus(sampleStatus);
	}
	
	@Override
	public StorageType addStorageType(StorageType storageType) throws Exception {
		if (storageType == null || storageType.getName() == null || storageType.getName().trim().equals("")) {
			throw new Exception("Storage type name is required.");
		}
		String normalizedName = storageType.getName().trim();
		for (StorageType existingStorageType : getAllStorageTypesUnsafe()) {
			if (isActive(existingStorageType) && existingStorageType.getName() != null
			        && existingStorageType.getName().trim().equalsIgnoreCase(normalizedName)) {
				throw new Exception("Storage type '" + normalizedName + "' already exists.");
			}
		}
		storageType.setName(normalizedName);
		applyCreationAudit(storageType);
		return this.storageTypeDAO.save(storageType);
	}
	
	@Override
	public ListResult<StorageType> getStorageTypes(Pager pager, String q) {
		return this.storageTypeDAO.getStorageTypes(pager, q);
	}
	
	@Override
	public StorageType getStorageTypeByUuid(String storageTypeUuid) throws Exception {
		StorageType storageType = this.storageTypeDAO.findByUuid(storageTypeUuid);
		if (!isActive(storageType)) {
			throw new Exception("Storage type with uuid '" + storageTypeUuid + "' does not exist.");
		}
		return storageType;
	}
	
	@Override
	public StorageType updateStorageType(String storageTypeUuid, StorageType storageType) throws Exception {
		StorageType existingStorageType = getStorageTypeByUuid(storageTypeUuid);
		if (storageType != null && storageType.getName() != null && !storageType.getName().trim().equals("")) {
			String normalizedName = storageType.getName().trim();
			for (StorageType candidate : getAllStorageTypesUnsafe()) {
				if (isActive(candidate) && candidate.getName() != null
				        && candidate.getName().trim().equalsIgnoreCase(normalizedName)
				        && !candidate.getUuid().equals(existingStorageType.getUuid())) {
					throw new Exception("Storage type '" + normalizedName + "' already exists.");
				}
			}
			existingStorageType.setName(normalizedName);
		}
		applyChangeAudit(existingStorageType);
		return this.storageTypeDAO.update(existingStorageType);
	}
	
	@Override
	public StorageType deleteStorageType(String storageTypeUuid, String reason) throws Exception {
		StorageType existingStorageType = getStorageTypeByUuid(storageTypeUuid);
		for (Storage storage : getAllStoragesUnsafe()) {
			if (isActive(storage) && storage.getStorageType() != null
			        && existingStorageType.getUuid().equals(storage.getStorageType().getUuid())) {
				throw new Exception("Storage type '" + existingStorageType.getName()
				        + "' is still in use and cannot be deleted.");
			}
		}
		applyDeleteAudit(existingStorageType, reason);
		return this.storageTypeDAO.update(existingStorageType);
	}
	
	@Override
	public Storage addStorage(Storage storage) throws Exception {
		if (storage == null) {
			throw new Exception("Storage details are required.");
		}
		if (storage.getName() == null || storage.getName().trim().equals("")) {
			throw new Exception("Storage name is required.");
		}
		StorageType resolvedStorageType = resolveStorageTypeReference(storage.getStorageType());
		String normalizedName = storage.getName().trim();
		for (Storage existingStorage : getAllStoragesUnsafe()) {
			if (isActive(existingStorage) && existingStorage.getName() != null
			        && existingStorage.getName().trim().equalsIgnoreCase(normalizedName)
			        && existingStorage.getStorageType() != null
			        && resolvedStorageType.getUuid().equals(existingStorage.getStorageType().getUuid())) {
				throw new Exception("Storage '" + normalizedName + "' already exists for storage type '"
				        + resolvedStorageType.getName() + "'.");
			}
		}
		storage.setName(normalizedName);
		storage.setStorageType(resolvedStorageType);
		applyCreationAudit(storage);
		return this.storageDAO.save(storage);
	}
	
	@Override
	public ListResult<Storage> getStorages(Pager pager, String q, String storageTypeUuid) {
		return this.storageDAO.getStorages(pager, q, storageTypeUuid);
	}
	
	@Override
	public Storage getStorageByUuid(String storageUuid) throws Exception {
		Storage storage = this.storageDAO.findByUuid(storageUuid);
		if (!isActive(storage)) {
			throw new Exception("Storage with uuid '" + storageUuid + "' does not exist.");
		}
		return storage;
	}
	
	@Override
	public Storage updateStorage(String storageUuid, Storage storage) throws Exception {
		Storage existingStorage = getStorageByUuid(storageUuid);
		StorageType resolvedStorageType = existingStorage.getStorageType();
		if (storage != null
		        && storage.getStorageType() != null
		        && ((storage.getStorageType().getUuid() != null && !storage.getStorageType().getUuid().trim().equals("")) || hasValidStorageTypeId(storage
		                .getStorageType()))) {
			resolvedStorageType = resolveStorageTypeReference(storage.getStorageType());
		}
		String normalizedName = storage != null && storage.getName() != null && !storage.getName().trim().equals("") ? storage
		        .getName().trim() : existingStorage.getName();
		for (Storage candidate : getAllStoragesUnsafe()) {
			if (isActive(candidate) && candidate.getName() != null
			        && candidate.getName().trim().equalsIgnoreCase(normalizedName) && candidate.getStorageType() != null
			        && resolvedStorageType.getUuid().equals(candidate.getStorageType().getUuid())
			        && !candidate.getUuid().equals(existingStorage.getUuid())) {
				throw new Exception("Storage '" + normalizedName + "' already exists for storage type '"
				        + resolvedStorageType.getName() + "'.");
			}
		}
		existingStorage.setName(normalizedName);
		if (storage != null && storage.getCapacity() != null) {
			existingStorage.setCapacity(storage.getCapacity());
		}
		existingStorage.setStorageType(resolvedStorageType);
		applyChangeAudit(existingStorage);
		return this.storageDAO.update(existingStorage);
	}
	
	@Override
	public Storage deleteStorage(String storageUuid, String reason) throws Exception {
		Storage existingStorage = getStorageByUuid(storageUuid);
		applyDeleteAudit(existingStorage, reason);
		return this.storageDAO.update(existingStorage);
	}
	
	private StorageType resolveStorageTypeReference(StorageType storageTypeReference) throws Exception {
		if (storageTypeReference == null) {
			throw new Exception("Storage type is required.");
		}
		StorageType storageType = null;
		if (storageTypeReference.getUuid() != null && !storageTypeReference.getUuid().trim().equals("")) {
			storageType = this.storageTypeDAO.findByUuid(storageTypeReference.getUuid());
		}
		if (!isActive(storageType) && hasValidStorageTypeId(storageTypeReference)) {
			for (StorageType candidate : getAllStorageTypesUnsafe()) {
				if (isActive(candidate) && candidate.getId().intValue() == storageTypeReference.getId().intValue()) {
					storageType = candidate;
					break;
				}
			}
		}
		if (!isActive(storageType)) {
			throw new Exception("Storage type does not exist.");
		}
		return storageType;
	}
	
	@SuppressWarnings("unchecked")
	private List<StorageType> getAllStorageTypesUnsafe() {
		return (List<StorageType>) IteratorUtils.toList(this.storageTypeDAO.findAll().iterator());
	}
	
	@SuppressWarnings("unchecked")
	private List<Storage> getAllStoragesUnsafe() {
		return (List<Storage>) IteratorUtils.toList(this.storageDAO.findAll().iterator());
	}
	
	private boolean hasValidStorageTypeId(StorageType storageTypeReference) {
		return storageTypeReference != null && storageTypeReference.getId() != null
		        && storageTypeReference.getId().intValue() > 0;
	}
	
	private boolean isActive(BaseOpenmrsData data) {
		return data != null && (data.getVoided() == null || !data.getVoided());
	}
	
	private void applyCreationAudit(BaseOpenmrsData data) {
		if (data.getUuid() == null || data.getUuid().trim().equals("")) {
			data.setUuid(UUID.randomUUID().toString());
		}
		if (data.getCreator() == null) {
			data.setCreator(Context.getAuthenticatedUser());
		}
		if (data.getDateCreated() == null) {
			data.setDateCreated(new Date());
		}
		data.setVoided(false);
	}
	
	private void applyChangeAudit(BaseOpenmrsData data) {
		data.setChangedBy(Context.getAuthenticatedUser());
		data.setDateChanged(new Date());
	}
	
	private void applyDeleteAudit(BaseOpenmrsData data, String reason) {
		data.setVoided(true);
		data.setVoidedBy(Context.getAuthenticatedUser());
		data.setDateVoided(new Date());
		data.setVoidReason(reason != null && !reason.trim().equals("") ? reason.trim() : "Deleted via API");
	}
	
	@Override
	public StorageLocationType addStorageLocationType(StorageLocationType storageLocationType) throws Exception {
		if (storageLocationType == null) {
			throw new Exception("Storage location type details are required.");
		}
		if (storageLocationType.getCode() == null || storageLocationType.getCode().trim().equals("")) {
			throw new Exception("Storage location type code is required.");
		}
		if (storageLocationType.getName() == null || storageLocationType.getName().trim().equals("")) {
			throw new Exception("Storage location type name is required.");
		}
		String normalizedCode = storageLocationType.getCode().trim().toUpperCase(Locale.ENGLISH);
		String normalizedName = storageLocationType.getName().trim();
		for (StorageLocationType candidate : getAllStorageLocationTypesUnsafe()) {
			if (!isActive(candidate)) {
				continue;
			}
			if ((candidate.getCode() != null && candidate.getCode().trim().equalsIgnoreCase(normalizedCode))
			        || (candidate.getName() != null && candidate.getName().trim().equalsIgnoreCase(normalizedName))) {
				throw new Exception("Storage location type '" + normalizedName + "' already exists.");
			}
		}
		storageLocationType.setCode(normalizedCode);
		storageLocationType.setName(normalizedName);
		if (storageLocationType.getStructural() == null) {
			storageLocationType.setStructural(false);
		}
		if (storageLocationType.getSlotBearing() == null) {
			storageLocationType.setSlotBearing(false);
		}
		applyCreationAudit(storageLocationType);
		return this.storageLocationTypeDAO.save(storageLocationType);
	}
	
	@Override
	public ListResult<StorageLocationType> getStorageLocationTypes(Pager pager, String q) {
		return this.storageLocationTypeDAO.getStorageLocationTypes(pager, q);
	}
	
	@Override
	public StorageLocationType getStorageLocationTypeByUuid(String storageLocationTypeUuid) throws Exception {
		StorageLocationType type = this.storageLocationTypeDAO.findByUuid(storageLocationTypeUuid);
		if (!isActive(type)) {
			throw new Exception("Storage location type with uuid '" + storageLocationTypeUuid + "' does not exist.");
		}
		return type;
	}
	
	@Override
	public StorageLocationType updateStorageLocationType(String storageLocationTypeUuid,
	        StorageLocationType storageLocationType) throws Exception {
		StorageLocationType existing = getStorageLocationTypeByUuid(storageLocationTypeUuid);
		String normalizedCode = storageLocationType != null && storageLocationType.getCode() != null
		        && !storageLocationType.getCode().trim().equals("") ? storageLocationType.getCode().trim()
		        .toUpperCase(Locale.ENGLISH) : existing.getCode();
		String normalizedName = storageLocationType != null && storageLocationType.getName() != null
		        && !storageLocationType.getName().trim().equals("") ? storageLocationType.getName().trim() : existing
		        .getName();
		for (StorageLocationType candidate : getAllStorageLocationTypesUnsafe()) {
			if (!isActive(candidate) || candidate.getUuid().equals(existing.getUuid())) {
				continue;
			}
			if ((candidate.getCode() != null && candidate.getCode().trim().equalsIgnoreCase(normalizedCode))
			        || (candidate.getName() != null && candidate.getName().trim().equalsIgnoreCase(normalizedName))) {
				throw new Exception("Storage location type '" + normalizedName + "' already exists.");
			}
		}
		existing.setCode(normalizedCode);
		existing.setName(normalizedName);
		if (storageLocationType != null) {
			if (storageLocationType.getDescription() != null) {
				existing.setDescription(storageLocationType.getDescription());
			}
			if (storageLocationType.getLevelOrder() != null) {
				existing.setLevelOrder(storageLocationType.getLevelOrder());
			}
			if (storageLocationType.getStructural() != null) {
				existing.setStructural(storageLocationType.getStructural());
			}
			if (storageLocationType.getSlotBearing() != null) {
				existing.setSlotBearing(storageLocationType.getSlotBearing());
			}
			if (storageLocationType.getMetadataJson() != null) {
				existing.setMetadataJson(storageLocationType.getMetadataJson());
			}
		}
		applyChangeAudit(existing);
		return this.storageLocationTypeDAO.update(existing);
	}
	
	@Override
	public StorageLocationType deleteStorageLocationType(String storageLocationTypeUuid, String reason) throws Exception {
		StorageLocationType existing = getStorageLocationTypeByUuid(storageLocationTypeUuid);
		for (StorageLocation location : getAllStorageLocationsUnsafe()) {
			if (isActive(location) && location.getLocationType() != null
			        && existing.getUuid().equals(location.getLocationType().getUuid())) {
				throw new Exception("Storage location type '" + existing.getName()
				        + "' is still associated with one or more storage locations.");
			}
		}
		applyDeleteAudit(existing, reason);
		return this.storageLocationTypeDAO.update(existing);
	}
	
	@Override
	public StorageLocation addStorageLocation(StorageLocation storageLocation) throws Exception {
		if (storageLocation == null) {
			throw new Exception("Storage location details are required.");
		}
		if (storageLocation.getCode() == null || storageLocation.getCode().trim().equals("")) {
			throw new Exception("Storage location code is required.");
		}
		if (storageLocation.getName() == null || storageLocation.getName().trim().equals("")) {
			throw new Exception("Storage location name is required.");
		}
		StorageLocationType resolvedType = resolveStorageLocationTypeReference(storageLocation.getLocationType());
		StorageLocation resolvedParent = resolveStorageLocationParentReference(storageLocation.getParentLocation());
		String normalizedCode = storageLocation.getCode().trim().toUpperCase(Locale.ENGLISH);
		String normalizedName = storageLocation.getName().trim();
		ensureUniqueStorageLocation(normalizedCode, normalizedName, resolvedParent, null);
		storageLocation.setCode(normalizedCode);
		storageLocation.setName(normalizedName);
		storageLocation.setLocationType(resolvedType);
		storageLocation.setParentLocation(resolvedParent);
		storageLocation.setPathDepth(calculatePathDepth(resolvedParent));
		storageLocation.setPathLabel(buildStorageLocationPath(resolvedParent, normalizedName));
		if (storageLocation.getSlot() == null) {
			storageLocation.setSlot(Boolean.TRUE.equals(resolvedType.getSlotBearing()));
		}
		applyCreationAudit(storageLocation);
		return this.storageLocationDAO.save(storageLocation);
	}
	
	@Override
	public ListResult<StorageLocation> getStorageLocations(Pager pager, String q, String parentLocationUuid,
	        String locationTypeUuid, Boolean slotOnly) {
		return this.storageLocationDAO.getStorageLocations(pager, q, parentLocationUuid, locationTypeUuid, slotOnly);
	}
	
	@Override
	public StorageLocation getStorageLocationByUuid(String storageLocationUuid) throws Exception {
		StorageLocation location = this.storageLocationDAO.findByUuid(storageLocationUuid);
		if (!isActive(location)) {
			throw new Exception("Storage location with uuid '" + storageLocationUuid + "' does not exist.");
		}
		return location;
	}
	
	@Override
	public StorageLocation updateStorageLocation(String storageLocationUuid, StorageLocation storageLocation)
	        throws Exception {
		StorageLocation existing = getStorageLocationByUuid(storageLocationUuid);
		StorageLocationType resolvedType = existing.getLocationType();
		if (storageLocation != null
		        && storageLocation.getLocationType() != null
		        && (storageLocation.getLocationType().getUuid() != null || storageLocation.getLocationType().getId() != null)) {
			resolvedType = resolveStorageLocationTypeReference(storageLocation.getLocationType());
		}
		StorageLocation resolvedParent = existing.getParentLocation();
		if (storageLocation != null
		        && storageLocation.getParentLocation() != null
		        && (storageLocation.getParentLocation().getUuid() != null || storageLocation.getParentLocation().getId() != null)) {
			resolvedParent = resolveStorageLocationParentReference(storageLocation.getParentLocation());
		}
		String normalizedCode = storageLocation != null && storageLocation.getCode() != null
		        && !storageLocation.getCode().trim().equals("") ? storageLocation.getCode().trim()
		        .toUpperCase(Locale.ENGLISH) : existing.getCode();
		String normalizedName = storageLocation != null && storageLocation.getName() != null
		        && !storageLocation.getName().trim().equals("") ? storageLocation.getName().trim() : existing.getName();
		ensureUniqueStorageLocation(normalizedCode, normalizedName, resolvedParent, existing.getUuid());
		existing.setCode(normalizedCode);
		existing.setName(normalizedName);
		existing.setLocationType(resolvedType);
		existing.setParentLocation(resolvedParent);
		existing.setPathDepth(calculatePathDepth(resolvedParent));
		existing.setPathLabel(buildStorageLocationPath(resolvedParent, normalizedName));
		if (storageLocation != null) {
			if (storageLocation.getBarcode() != null) {
				existing.setBarcode(storageLocation.getBarcode());
			}
			if (storageLocation.getRowsCount() != null) {
				existing.setRowsCount(storageLocation.getRowsCount());
			}
			if (storageLocation.getColumnsCount() != null) {
				existing.setColumnsCount(storageLocation.getColumnsCount());
			}
			if (storageLocation.getLayersCount() != null) {
				existing.setLayersCount(storageLocation.getLayersCount());
			}
			if (storageLocation.getSlotPattern() != null) {
				existing.setSlotPattern(storageLocation.getSlotPattern());
			}
			if (storageLocation.getSlotSeparator() != null) {
				existing.setSlotSeparator(storageLocation.getSlotSeparator());
			}
			if (storageLocation.getSlot() != null) {
				existing.setSlot(storageLocation.getSlot());
			}
			if (storageLocation.getStorageConditionType() != null) {
				existing.setStorageConditionType(storageLocation.getStorageConditionType());
			}
			if (storageLocation.getMinTemperature() != null) {
				existing.setMinTemperature(storageLocation.getMinTemperature());
			}
			if (storageLocation.getMaxTemperature() != null) {
				existing.setMaxTemperature(storageLocation.getMaxTemperature());
			}
			if (storageLocation.getCapacity() != null) {
				existing.setCapacity(storageLocation.getCapacity());
			}
			if (storageLocation.getMetadataJson() != null) {
				existing.setMetadataJson(storageLocation.getMetadataJson());
			}
		}
		applyChangeAudit(existing);
		return this.storageLocationDAO.update(existing);
	}
	
	@Override
	public StorageLocation deleteStorageLocation(String storageLocationUuid, String reason) throws Exception {
		StorageLocation existing = getStorageLocationByUuid(storageLocationUuid);
		for (StorageLocation child : getAllStorageLocationsUnsafe()) {
			if (isActive(child) && child.getParentLocation() != null
			        && existing.getUuid().equals(child.getParentLocation().getUuid())) {
				throw new Exception("Storage location '" + existing.getName() + "' still has child locations.");
			}
		}
		for (SampleStorageOccupancy occupancy : getAllSampleStorageOccupanciesUnsafe()) {
			if (isActive(occupancy) && occupancy.getActiveOccupancy() != null && occupancy.getActiveOccupancy()
			        && occupancy.getSlotLocation() != null
			        && existing.getUuid().equals(occupancy.getSlotLocation().getUuid())) {
				throw new Exception("Storage location '" + existing.getName()
				        + "' is currently occupied and cannot be deleted.");
			}
		}
		applyDeleteAudit(existing, reason);
		return this.storageLocationDAO.update(existing);
	}
	
	@Override
	public List<StorageLocation> generateStorageLocationSlots(String storageLocationUuid, Integer rowsCount,
	        Integer columnsCount, Integer layersCount, String slotPattern) throws Exception {
		StorageLocation parent = getStorageLocationByUuid(storageLocationUuid);
		Integer rows = rowsCount != null ? rowsCount : parent.getRowsCount();
		Integer columns = columnsCount != null ? columnsCount : parent.getColumnsCount();
		Integer layers = layersCount != null ? layersCount : parent.getLayersCount();
		if (rows == null || rows.intValue() <= 0) {
			rows = 1;
		}
		if (columns == null || columns.intValue() <= 0) {
			columns = 1;
		}
		if (layers == null || layers.intValue() <= 0) {
			layers = 1;
		}
		StorageLocationType slotType = resolveSlotLocationType();
		List<StorageLocation> createdSlots = new ArrayList<StorageLocation>();
		for (int layer = 1; layer <= layers.intValue(); layer++) {
			for (int row = 1; row <= rows.intValue(); row++) {
				for (int column = 1; column <= columns.intValue(); column++) {
					String label = generateSlotLabel(layer, row, column,
					    slotPattern != null && !slotPattern.trim().equals("") ? slotPattern : parent.getSlotPattern());
					String code = parent.getCode() + "-" + label;
					StorageLocation existingSlot = findStorageLocationByCodeUnderParent(code, parent);
					if (isActive(existingSlot)) {
						createdSlots.add(existingSlot);
						continue;
					}
					StorageLocation slot = new StorageLocation();
					slot.setCode(code);
					slot.setName(label);
					slot.setLocationType(slotType);
					slot.setParentLocation(parent);
					slot.setSlot(true);
					slot.setPathDepth(calculatePathDepth(parent));
					slot.setPathLabel(buildStorageLocationPath(parent, label));
					applyCreationAudit(slot);
					createdSlots.add(this.storageLocationDAO.save(slot));
				}
			}
		}
		return createdSlots;
	}
	
	@Override
	public SampleStorageOccupancy storeSample(String sampleUuid, String slotLocationUuid, String occupancyType,
	        Double quantityStored, String quantityUnit, String remarks) throws Exception {
		Sample sample = resolveSampleReferenceByUuid(sampleUuid);
		StorageLocation slotLocation = resolveSlotLocation(slotLocationUuid);
		ensureSlotAvailableForStorage(slotLocation, sample.getUuid());
		SampleStorageOccupancy current = this.sampleStorageOccupancyDAO.getActiveBySampleUuid(sample.getUuid());
		if (isActive(current) && Boolean.TRUE.equals(current.getActiveOccupancy())) {
			throw new Exception("Sample '" + sample.getLabel() + "' is already assigned to an active storage slot.");
		}
		SampleStorageOccupancy occupancy = new SampleStorageOccupancy();
		occupancy.setSample(sample);
		occupancy.setSlotLocation(slotLocation);
		occupancy.setOccupancyType(occupancyType != null && !occupancyType.trim().equals("") ? occupancyType.trim()
		        .toUpperCase(Locale.ENGLISH) : "PRIMARY");
		occupancy.setStoredAt(new Date());
		occupancy.setActiveOccupancy(true);
		occupancy.setDisposed(false);
		occupancy.setQuantityStored(quantityStored);
		occupancy.setQuantityUnit(quantityUnit);
		occupancy.setRemarks(remarks);
		occupancy.setFullAddress(slotLocation.getPathLabel());
		applyCreationAudit(occupancy);
		SampleStorageOccupancy saved = this.sampleStorageOccupancyDAO.save(occupancy);
		saveCompatibilitySampleStatus(sample, "STORAGE", "STORED", "Stored at " + slotLocation.getPathLabel()
		        + (remarks != null && !remarks.trim().equals("") ? " | " + remarks.trim() : ""));
		return saved;
	}
	
	@Override
	public SampleStorageOccupancy moveStoredSample(String sampleUuid, String slotLocationUuid, String remarks)
	        throws Exception {
		Sample sample = resolveSampleReferenceByUuid(sampleUuid);
		SampleStorageOccupancy current = this.sampleStorageOccupancyDAO.getActiveBySampleUuid(sample.getUuid());
		if (!isActive(current) || !Boolean.TRUE.equals(current.getActiveOccupancy())) {
			throw new Exception("Sample '" + sample.getLabel() + "' is not currently stored in an active slot.");
		}
		StorageLocation targetSlot = resolveSlotLocation(slotLocationUuid);
		ensureSlotAvailableForStorage(targetSlot, sample.getUuid());
		current.setActiveOccupancy(false);
		current.setReleasedAt(new Date());
		current.setRemarks(appendRemark(current.getRemarks(), remarks));
		applyChangeAudit(current);
		this.sampleStorageOccupancyDAO.update(current);
		SampleStorageOccupancy moved = storeSample(sample.getUuid(), targetSlot.getUuid(),
		    current.getOccupancyType() != null ? current.getOccupancyType() : "PRIMARY", current.getQuantityStored(),
		    current.getQuantityUnit(), remarks);
		saveCompatibilitySampleStatus(sample, "STORAGE_MOVED", "MOVED", "Moved from " + current.getFullAddress() + " to "
		        + targetSlot.getPathLabel() + (remarks != null && !remarks.trim().equals("") ? " | " + remarks.trim() : ""));
		return moved;
	}
	
	@Override
	public SampleStorageOccupancy releaseStoredSample(String sampleUuid, String releaseReason) throws Exception {
		Sample sample = resolveSampleReferenceByUuid(sampleUuid);
		SampleStorageOccupancy current = this.sampleStorageOccupancyDAO.getActiveBySampleUuid(sample.getUuid());
		if (!isActive(current) || !Boolean.TRUE.equals(current.getActiveOccupancy())) {
			throw new Exception("Sample '" + sample.getLabel() + "' is not currently stored in an active slot.");
		}
		current.setActiveOccupancy(false);
		current.setReleasedAt(new Date());
		current.setRemarks(appendRemark(current.getRemarks(), releaseReason));
		applyChangeAudit(current);
		SampleStorageOccupancy updated = this.sampleStorageOccupancyDAO.update(current);
		saveCompatibilitySampleStatus(sample, "STORAGE_RELEASED", "REMOVED FROM STORAGE",
		    "Released from " + current.getFullAddress()
		            + (releaseReason != null && !releaseReason.trim().equals("") ? " | " + releaseReason.trim() : ""));
		return updated;
	}
	
	@Override
	public SampleDisposalRecord disposeSample(String sampleUuid, String disposalMethod, String disposalReason, String remarks)
	        throws Exception {
		Sample sample = resolveSampleReferenceByUuid(sampleUuid);
		SampleStorageOccupancy current = this.sampleStorageOccupancyDAO.getActiveBySampleUuid(sample.getUuid());
		if (isActive(current) && Boolean.TRUE.equals(current.getActiveOccupancy())) {
			current.setActiveOccupancy(false);
			current.setDisposed(true);
			current.setReleasedAt(new Date());
			current.setRemarks(appendRemark(current.getRemarks(), remarks));
			applyChangeAudit(current);
			this.sampleStorageOccupancyDAO.update(current);
		}
		SampleDisposalRecord record = new SampleDisposalRecord();
		record.setSample(sample);
		record.setOccupancy(current);
		record.setDisposalMethod(disposalMethod != null && !disposalMethod.trim().equals("") ? disposalMethod.trim()
		        : "UNSPECIFIED");
		record.setDisposalReason(disposalReason != null && !disposalReason.trim().equals("") ? disposalReason.trim()
		        : "Disposed");
		record.setDisposedAt(new Date());
		record.setApprovalRequired(false);
		record.setApproved(true);
		record.setRemarks(remarks);
		applyCreationAudit(record);
		SampleDisposalRecord saved = this.sampleDisposalRecordDAO.save(record);
		saveCompatibilitySampleStatus(sample, "DISPOSED", "DISPOSED", "Disposed"
		        + (disposalMethod != null && !disposalMethod.trim().equals("") ? " via " + disposalMethod.trim() : "")
		        + (disposalReason != null && !disposalReason.trim().equals("") ? " | " + disposalReason.trim() : "")
		        + (remarks != null && !remarks.trim().equals("") ? " | " + remarks.trim() : ""));
		return saved;
	}
	
	@Override
	public Map<String, Object> getSampleStorageSummary(String sampleUuid) throws Exception {
		Sample sample = resolveSampleReferenceByUuid(sampleUuid);
		Map<String, Object> response = new HashMap<String, Object>();
		response.put("sampleUuid", sample.getUuid());
		response.put("sampleLabel", sample.getLabel());
		SampleStorageOccupancy current = this.sampleStorageOccupancyDAO.getActiveBySampleUuid(sample.getUuid());
		response.put("currentOccupancy", current != null ? current.toMap() : null);
		List<Map<String, Object>> history = new ArrayList<Map<String, Object>>();
		for (SampleStorageOccupancy occupancy : this.sampleStorageOccupancyDAO.getBySampleUuid(sample.getUuid())) {
			history.add(occupancy.toMap());
		}
		response.put("storageHistory", history);
		SampleDisposalRecord disposalRecord = this.sampleDisposalRecordDAO.getLatestBySampleUuid(sample.getUuid());
		response.put("disposal", disposalRecord != null ? disposalRecord.toMap() : null);
		response.put("disposed", disposalRecord != null);
		return response;
	}
	
	@Override
	public Map<String, Object> getSlotOccupancySummary(String slotLocationUuid) throws Exception {
		StorageLocation slot = resolveSlotLocation(slotLocationUuid);
		SampleStorageOccupancy occupancy = this.sampleStorageOccupancyDAO.getActiveBySlotUuid(slot.getUuid());
		Map<String, Object> response = new HashMap<String, Object>();
		response.put("slotLocation", slot.toMap());
		response.put("occupied", occupancy != null);
		response.put("occupancy", occupancy != null ? occupancy.toMap() : null);
		return response;
	}
	
	@SuppressWarnings("unchecked")
	private List<StorageLocationType> getAllStorageLocationTypesUnsafe() {
		return (List<StorageLocationType>) IteratorUtils.toList(this.storageLocationTypeDAO.findAll().iterator());
	}
	
	@SuppressWarnings("unchecked")
	private List<StorageLocation> getAllStorageLocationsUnsafe() {
		return (List<StorageLocation>) IteratorUtils.toList(this.storageLocationDAO.findAll().iterator());
	}
	
	@SuppressWarnings("unchecked")
	private List<SampleStorageOccupancy> getAllSampleStorageOccupanciesUnsafe() {
		return (List<SampleStorageOccupancy>) IteratorUtils.toList(this.sampleStorageOccupancyDAO.findAll().iterator());
	}
	
	private StorageLocationType resolveStorageLocationTypeReference(StorageLocationType typeReference) throws Exception {
		if (typeReference == null) {
			throw new Exception("Storage location type is required.");
		}
		StorageLocationType resolved = null;
		if (typeReference.getUuid() != null && !typeReference.getUuid().trim().equals("")) {
			resolved = this.storageLocationTypeDAO.findByUuid(typeReference.getUuid());
		}
		if (!isActive(resolved) && typeReference.getId() != null) {
			for (StorageLocationType candidate : getAllStorageLocationTypesUnsafe()) {
				if (isActive(candidate) && candidate.getId().intValue() == typeReference.getId().intValue()) {
					resolved = candidate;
					break;
				}
			}
		}
		if (!isActive(resolved)) {
			throw new Exception("Storage location type does not exist.");
		}
		return resolved;
	}
	
	private StorageLocation resolveStorageLocationParentReference(StorageLocation parentReference) throws Exception {
		if (parentReference == null) {
			return null;
		}
		StorageLocation parent = null;
		if (parentReference.getUuid() != null && !parentReference.getUuid().trim().equals("")) {
			parent = this.storageLocationDAO.findByUuid(parentReference.getUuid());
		}
		if (!isActive(parent) && parentReference.getId() != null) {
			for (StorageLocation candidate : getAllStorageLocationsUnsafe()) {
				if (isActive(candidate) && candidate.getId().intValue() == parentReference.getId().intValue()) {
					parent = candidate;
					break;
				}
			}
		}
		if (parentReference != null && !isActive(parent)) {
			throw new Exception("Parent storage location does not exist.");
		}
		return parent;
	}
	
	private void ensureUniqueStorageLocation(String normalizedCode, String normalizedName, StorageLocation parent,
	        String excludedUuid) throws Exception {
		String parentUuid = parent != null ? parent.getUuid() : null;
		for (StorageLocation candidate : getAllStorageLocationsUnsafe()) {
			if (!isActive(candidate)) {
				continue;
			}
			if (excludedUuid != null && excludedUuid.equals(candidate.getUuid())) {
				continue;
			}
			String candidateParentUuid = candidate.getParentLocation() != null ? candidate.getParentLocation().getUuid()
			        : null;
			boolean sameParent = (parentUuid == null && candidateParentUuid == null)
			        || (parentUuid != null && parentUuid.equals(candidateParentUuid));
			if (!sameParent) {
				continue;
			}
			if ((candidate.getCode() != null && candidate.getCode().trim().equalsIgnoreCase(normalizedCode))
			        || (candidate.getName() != null && candidate.getName().trim().equalsIgnoreCase(normalizedName))) {
				throw new Exception("Storage location '" + normalizedName + "' already exists under the selected parent.");
			}
		}
	}
	
	private Integer calculatePathDepth(StorageLocation parent) {
		return parent == null || parent.getPathDepth() == null ? 1 : parent.getPathDepth().intValue() + 1;
	}
	
	private String buildStorageLocationPath(StorageLocation parent, String selfName) {
		if (parent == null || parent.getPathLabel() == null || parent.getPathLabel().trim().equals("")) {
			return selfName;
		}
		return parent.getPathLabel() + " / " + selfName;
	}
	
	private StorageLocationType resolveSlotLocationType() throws Exception {
		StorageLocationType exactSlot = null;
		StorageLocationType preferredSlotBearing = null;
		StorageLocationType namedFinalPosition = null;
		for (StorageLocationType candidate : getAllStorageLocationTypesUnsafe()) {
			if (!isActive(candidate)) {
				continue;
			}
			String code = candidate.getCode() != null ? candidate.getCode().trim() : "";
			String name = candidate.getName() != null ? candidate.getName().trim() : "";
			if ("SLOT".equalsIgnoreCase(code)) {
				exactSlot = candidate;
				break;
			}
			if (Boolean.TRUE.equals(candidate.getSlotBearing())) {
				if (preferredSlotBearing == null || compareLocationTypeOrder(candidate, preferredSlotBearing) < 0) {
					preferredSlotBearing = candidate;
				}
				if (name.equalsIgnoreCase("position") || name.equalsIgnoreCase("slot") || name.equalsIgnoreCase("well")
				        || name.equalsIgnoreCase("cell") || code.equalsIgnoreCase("POSITION")
				        || code.equalsIgnoreCase("WELL") || code.equalsIgnoreCase("CELL")) {
					if (namedFinalPosition == null || compareLocationTypeOrder(candidate, namedFinalPosition) < 0) {
						namedFinalPosition = candidate;
					}
				}
			}
		}
		if (exactSlot != null) {
			return exactSlot;
		}
		if (namedFinalPosition != null) {
			return namedFinalPosition;
		}
		if (preferredSlotBearing != null) {
			return preferredSlotBearing;
		}
		throw new Exception(
		        "No final sample position level is configured. Create or update a location level and mark it as usable for final sample positions, then try again.");
	}
	
	private int compareLocationTypeOrder(StorageLocationType first, StorageLocationType second) {
		Integer firstOrder = first != null && first.getLevelOrder() != null ? first.getLevelOrder() : Integer.MAX_VALUE;
		Integer secondOrder = second != null && second.getLevelOrder() != null ? second.getLevelOrder() : Integer.MAX_VALUE;
		return firstOrder.compareTo(secondOrder);
	}
	
	private String generateSlotLabel(int layer, int row, int column, String pattern) {
		String rowLabel = rowToAlphabet(row);
		String defaultPattern = pattern != null && !pattern.trim().equals("") ? pattern.trim() : "${row}${column}";
		String label = defaultPattern.replace("${layer}", String.valueOf(layer)).replace("{layer}", String.valueOf(layer))
		        .replace("${row}", rowLabel).replace("{row}", rowLabel).replace("${rowNumber}", String.valueOf(row))
		        .replace("{rowNumber}", String.valueOf(row)).replace("${column}", String.valueOf(column))
		        .replace("{column}", String.valueOf(column));
		if (label.equals(defaultPattern)) {
			if (layer > 1) {
				label = "L" + layer + "-" + rowLabel + column;
			} else {
				label = rowLabel + column;
			}
		}
		return label;
	}
	
	private String rowToAlphabet(int row) {
		StringBuilder sb = new StringBuilder();
		int value = row;
		while (value > 0) {
			int rem = (value - 1) % 26;
			sb.insert(0, (char) ('A' + rem));
			value = (value - 1) / 26;
		}
		return sb.toString();
	}
	
	private StorageLocation findStorageLocationByCodeUnderParent(String code, StorageLocation parent) {
		String parentUuid = parent != null ? parent.getUuid() : null;
		for (StorageLocation candidate : getAllStorageLocationsUnsafe()) {
			if (!isActive(candidate)) {
				continue;
			}
			String candidateParentUuid = candidate.getParentLocation() != null ? candidate.getParentLocation().getUuid()
			        : null;
			boolean sameParent = (parentUuid == null && candidateParentUuid == null)
			        || (parentUuid != null && parentUuid.equals(candidateParentUuid));
			if (sameParent && candidate.getCode() != null && candidate.getCode().trim().equalsIgnoreCase(code)) {
				return candidate;
			}
		}
		return null;
	}
	
	private StorageLocation resolveSlotLocation(String slotLocationUuid) throws Exception {
		StorageLocation slot = getStorageLocationByUuid(slotLocationUuid);
		if (!Boolean.TRUE.equals(slot.getSlot())) {
			throw new Exception("Selected storage location is not a slot.");
		}
		return slot;
	}
	
	private void ensureSlotAvailableForStorage(StorageLocation slotLocation, String sameSampleUuid) throws Exception {
		SampleStorageOccupancy slotOccupancy = this.sampleStorageOccupancyDAO.getActiveBySlotUuid(slotLocation.getUuid());
		if (isActive(slotOccupancy) && Boolean.TRUE.equals(slotOccupancy.getActiveOccupancy())
		        && slotOccupancy.getSample() != null
		        && (sameSampleUuid == null || !sameSampleUuid.equals(slotOccupancy.getSample().getUuid()))) {
			throw new Exception("Storage slot '" + slotLocation.getPathLabel() + "' is already occupied.");
		}
	}
	
	private Sample resolveSampleReferenceByUuid(String sampleUuid) throws Exception {
		Sample sample = this.getSampleByUuid(sampleUuid);
		if (sample == null) {
			throw new Exception("Sample with uuid '" + sampleUuid + "' does not exist.");
		}
		return sample;
	}
	
	private void saveCompatibilitySampleStatus(Sample sample, String category, String status, String remarks)
	        throws Exception {
		SampleStatus sampleStatus = new SampleStatus();
		sampleStatus.setSample(sample);
		sampleStatus.setUser(Context.getAuthenticatedUser());
		sampleStatus.setCategory(category);
		sampleStatus.setStatus(status);
		sampleStatus.setRemarks(remarks);
		sampleStatus.setTimestamp(new Date());
		if (category != null && category.toUpperCase(Locale.ENGLISH).startsWith("DISPOSE")) {
			addSampleDisposalStatus(sampleStatus);
		} else {
			addSampleStorageStatus(sampleStatus);
		}
	}
	
	private String appendRemark(String existingRemark, String extraRemark) {
		if (extraRemark == null || extraRemark.trim().equals("")) {
			return existingRemark;
		}
		if (existingRemark == null || existingRemark.trim().equals("")) {
			return extraRemark.trim();
		}
		return existingRemark + " | " + extraRemark.trim();
	}
	
	// public SampleStatus updateSampleStatus(SampleStatus sampleStatus) throws
	// Exception {
	
	// Sample sample = this.getSampleByUuid(sampleStatus.getSample().getUuid());
	// if (sample == null) {
	// throw new Exception("Sample with ID '" + sampleStatus.getSample().getUuid() +
	// "' does not exist.");
	// }
	// User user = new User();
	// if (sampleStatus.getUser() != null) {
	// Context.getUserService().getUserByUuid(sampleStatus.getUser().getUuid());
	// } else {
	// user = Context.getAuthenticatedUser();
	// }
	
	// if (user == null) {
	// throw new Exception("The user is not authenticated.");
	// }
	// sampleStatus.setSample(sample);
	// sampleStatus.setUser(user);
	// return this.sampleStatusDAO.save(sampleStatus);
	// }
	
	@Override
	public TestAllocation allocateTestWithSample(TestAllocation testAllocation) throws Exception {
		// Check preconditions
		if (testAllocation.getContainer().getUuid() == null) {
			throw new Exception("Container UUID does not exist. Container uuid must be specified");
		}
		if (testAllocation.getSampleOrder().getSample().getUuid() == null) {
			throw new Exception("Sample UUID does not exist. Sample uuid must be specified");
		}
		if (testAllocation.getSampleOrder().getOrder().getUuid() == null) {
			throw new Exception("Order UUID does not exist. Order uuid must be specified");
		}
		
		// Setting Values
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
		String sampleUuid = testAllocation.getSample().getUuid();
		Sample sampleData = testAllocationDAO.getAllocationsBySample(sampleUuid).get(0);
		TestAllocation matchedAllocation = new TestAllocation();
		Boolean allocationAlreadySet = false;
		if (sampleData != null) {
			if (sample.getSampleOrders().size() > 0) {
				for (SampleOrder sampleOrder : sample.getSampleOrders()) {
					if (sampleOrder.getTestAllocations().size() > 0) {
						for (TestAllocation allocation : sampleOrder.getTestAllocations()) {
							if (allocation.getTestConcept().getUuid().toString() == testConcept.getUuid().toString()) {
								allocationAlreadySet = true;
								matchedAllocation = allocation;
							}
						}
					}
				}
			}
		}
		if (!allocationAlreadySet) {
			testAllocation.setTestConcept(testConcept);
			testAllocation.setContainer(containerConcept);
			testAllocation.getSampleOrder().setSample(sample);
			testAllocation.getSampleOrder().setOrder(order);
			return this.testAllocationDAO.save(testAllocation);
		} else {
			return testAllocationDAO.findByUuid(matchedAllocation.getUuid().toString());
		}
		
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
			
			// Setting Values
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
		SampleOrderID idToFind = new SampleOrderID(sample.getId(), order.getId());
		SampleOrder savedSampleOrder = this.sampleOrderDAO.get(idToFind);
		
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
		// Sample sample = this.sampleDAO.findByUuid(sampleUuid);
		// List<Map<String, Object>> allocations = new ArrayList<>();
		// if (sample.getSampleOrders().size() > 0) {
		// for (SampleOrder order: sample.getSampleOrders()) {
		// if (order.getTestAllocations().size() > 0) {
		// for (TestAllocation allocation: order.getTestAllocations()) {
		// allocations.add(allocation.toMap());
		// }
		// }
		// }
		// }
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
		if (result.getTestAllocation() == null || result.getTestAllocation().getUuid() == null) {
			throw new Exception("Test Allocation is null. Test allocation uuid must be provided");
		}
		
		Concept concept = Context.getConceptService().getConceptByUuid(result.getConcept().getUuid());
		if (concept == null) {
			throw new Exception("Concept with id '" + result.getConcept().getUuid() + "' does not exist");
		}
		
		if (result.getTestedBy() != null) {
			User testedBy = Context.getUserService().getUserByUuid(result.getTestedBy().getUuid());
			result.setTestedBy(testedBy);
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
			result.setValueGroup(valueGroup);
		}
		
		if (result.getInstrument() != null) {
			
			Concept instrument = Context.getConceptService().getConceptByUuid(result.getInstrument().getUuid());
			result.setInstrument(instrument);
		}
		
		if (result.getInstruments() != null && !result.getInstruments().isEmpty()) {
			List<Concept> managedInstruments = new ArrayList<Concept>();
			for (Concept stub : result.getInstruments()) {
				if (stub == null || stub.getUuid() == null) {
					continue;
				}
				Concept managed = Context.getConceptService().getConceptByUuid(stub.getUuid());
				if (managed != null) {
					managedInstruments.add(managed);
				}
			}
			result.setInstruments(managedInstruments);
		}
		
		if (result.getInstrumentCode() != null) {
			String code = result.getInstrumentCode().toString();
			String conceptClassUuid = "";
			AdministrationService administrationService = Context.getAdministrationService();
			conceptClassUuid = administrationService.getGlobalProperty(ICareConfig.LAB_INSTRUMENT_CLASS_UUID);
			List<Concept> instruments = resultDAO.getInstrumentsByCode(code, conceptClassUuid);
			if (instruments.size() > 0) {
				result.setInstrument(instruments.get(0));
			}
		}
		
		Date date = new Date();
		result.setDateCreated(date);
		
		Result response = this.resultDAO.save(result);
		
		/*
		 * Save status via results
		 */
		TestAllocationStatus resultStatus = new TestAllocationStatus();
		resultStatus.setStatus(result.getStatus());
		resultStatus.setCategory(result.getStatusCategory());
		resultStatus.setRemarks(result.getStatusRemarks());
		resultStatus.setTestResult(response);
		resultStatus.setUser(response.getCreator());
		resultStatus.setTestAllocation(response.getTestAllocation());
		this.testAllocationStatusDAO.save(resultStatus);
		
		// Save associated field via result
		if (result.getAssociatedFieldResults().size() > 0) {
			AssociatedFieldResult associatedFieldResult = new AssociatedFieldResult();
			AssociatedField associatedField = this.associatedFieldDAO.findByUuid(result.getAssociatedFieldResults().get(0)
			        .getAssociatedField().getUuid());
			
			if (associatedField == null) {
				throw new Exception("The associated field with uuid "
				        + result.getAssociatedFieldResults().get(0).getAssociatedField().getUuid() + " does not exist");
			}
			
			associatedFieldResult.setValue(result.getAssociatedFieldResults().get(0).getValue());
			associatedFieldResult.setAssociatedField(associatedField);
			associatedFieldResult.setResult(response);
			this.associatedFieldResultDAO.save(associatedFieldResult);
		}
		return result;
	}
	
	public List<Map<String, Object>> saveMultipleResults(List<Result> results) throws Exception {
		List<Map<String, Object>> resultResponses = new ArrayList<>();
		for (Result result : results) {

			Result response = this.recordTestAllocationResults(result);
			/*
			 * End of save status via results
			 */
			// TODO: Add support to accommodate new status on the allocation response
			resultResponses.add(response.toMap());
		}
		return resultResponses;
	}
	
	@Override
	public Result deleteTestAllocationResults(Result result) throws Exception {
		return null;
	}
	
	@Override
	public Result updateTestAllocationResults(Result result) throws Exception {
		Result response = this.resultDAO.update(result);
		return response;
	}
	
	@Override
	public Result voidTestAllocationResults(Result result) throws Exception {
		Result response = this.resultDAO.update(result);
		return response;
	}
	
	public List<Map<String, Object>> voidMultipleResults(Map<String, Object> resultsToVoid) throws Exception {
		List<Map<String, Object>> resultResponses = new ArrayList<>();
		for (Map<String, Object> result : (List<Map<String, Object>>) resultsToVoid.get("results")) {
			Result resultData = resultDAO.findByUuid(result.get("uuid").toString());
			resultData.setVoidReason(resultsToVoid.get("voidReason").toString());
			resultData.setVoided((Boolean) resultsToVoid.get("voided"));
			Result response = this.voidTestAllocationResults(resultData);
			// retire corresponding sample status for results
			String sampleUuid = resultsToVoid.get("sample").toString();
			Sample sample = sampleDAO.findByUuid(sampleUuid);
			for (SampleStatus sampleStatus : sample.getSampleStatuses()) {
				if (sampleStatus.getCategory().equals("HAS_RESULTS")) {
					sampleStatus.setRetired(true);
					SampleStatus statusUpdateResponse = sampleStatusDAO.update(sampleStatus);

					SampleStatus newSampleStatus = new SampleStatus();
					newSampleStatus.setSample(sample);
					newSampleStatus.setCategory("RESULTS_DELETED");
					newSampleStatus.setStatus("DELETED RESULTS");
					newSampleStatus.setRemarks("Auto saved status");
					User user = Context.getAuthenticatedUser();
					newSampleStatus.setUser(user);
					Date date = new Date();
					newSampleStatus.setTimestamp(date);
					SampleStatus newStatusResponse = sampleStatusDAO.save(newSampleStatus);
				}
			}
			/*
			 * End of save status via results
			 */
			// TODO: Add support to accommodate new status on the allocation response
			resultResponses.add(response.toMap());
		}
		return resultResponses;
	}
	
	public Map<String, Object> saveResultsInstrument(Map<String, Object> resultsInstrumentObject) throws Exception {
		Concept instrument = new Concept();
		List responses = new ArrayList();
		if (resultsInstrumentObject.get("instrument") == null
				|| ((Map) resultsInstrumentObject.get("instrument")).get("uuid") == null) {
			throw new Exception("Instrument is not set");
		} else {
			// instrument.setUuid(((Map)
			// resultsInstrumentObject.get("instrument")).get("uuid").toString());
		}

		for (Map<String, Object> resultObject : (ArrayList<Map<String, Object>>) resultsInstrumentObject
				.get("results")) {
			Result result = new Result();
			result = resultDAO.findByUuid(resultObject.get("uuid").toString());
			String instrumentUuid = ((Map<?, ?>) resultsInstrumentObject.get("instrument")).get("uuid").toString();
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
	public Sample getSampleById(String id) {
		return this.sampleDAO.getSamplesById(id);
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

		TestAllocationStatus createdStatus = new TestAllocationStatus();
		User user = Context.getUserService().getUserByUuid(testAllocationStatus.getUser().getUuid());
		if (user == null) {
			throw new Exception("The user is not authenticated.");
		}
		Result testResult = new Result();
		if (testAllocationStatus.getTestResult() != null && testAllocationStatus.getTestResult().getUuid() != null) {
			testResult = this.resultDAO.findByUuid(testAllocationStatus.getTestResult().getUuid());
			testAllocationStatus.setTestAllocation(testAllocation);
			testAllocationStatus.setUser(user);
			if (testResult != null) {
				testAllocationStatus.setTestResult(testResult);
			}
			createdStatus = this.testAllocationStatusDAO.save(testAllocationStatus);

			// if (countTestAllocationApprovedStatuses(testAllocation.getUuid()) == 2) {

			AdministrationService administrationService = Context.getAdministrationService();
			String labResultApprovalConfig = administrationService
					.getGlobalProperty(ICareConfig.LAB_RESULT_APPROVAL_CONFIGURATION);
			if (labResultApprovalConfig == null) {
				throw new ConfigurationException("Lab result approval configuration is not set. Please set '"
						+ ICareConfig.LAB_RESULT_APPROVAL_CONFIGURATION + "'");
			}
			if ((testAllocationStatus.getStatus().equals("AUTHORIZED")) && testResult != null) {
				Sample sample = testResult.getTestAllocation().getSample();
				List<Result> resList = testAllocation.getTestAllocationResults();

				resList.sort(new Comparator<Result>() {

					@Override
					public int compare(Result r1, Result r2) {
						return r2.getDateCreated().compareTo(r1.getDateCreated());
					}
				});

				Result allocationResults = testResult;
				// resList.get(resList.size() - 1);
				// for (Result allocationResults : testAllocation.getTestAllocationResults()) {

				ObsService observationService = Context.getObsService();

				Encounter encounter = testAllocation.getSampleOrder().getOrder().getEncounter();

				// testAllocation.getSampleOrder().getOrder().getEncounter();

				Order order = testAllocation.getSampleOrder().getOrder();

				Concept concept = Context.getConceptService()
						.getConceptByUuid(allocationResults.getConcept().getUuid());

				Person person = testAllocation.getSampleOrder().getOrder().getPatient().getPerson();

				List<TestAllocationStatus> testAllocationStatuses = testAllocation.getTestAllocationStatuses();

				List<TestAllocationStatus> resultsRemarks = new ArrayList<TestAllocationStatus>();
				for (TestAllocationStatus status : testAllocationStatuses) {
					if (status.getStatus() != null && status.getCategory() != null
							&& status.getTestResult().getUuid().equals(testResult.getUuid())
							&& (status.getCategory().equals("RESULT_REMARKS"))) {
						resultsRemarks.add(status);
					}
				}

				List<TestAllocationStatus> resultStatuses = new ArrayList<TestAllocationStatus>();
				for (TestAllocationStatus status : testAllocationStatuses) {
					if (status.getStatus() != null && status.getCategory() != null
							&& status.getTestResult().getUuid().equals(testResult.getUuid())
							&& (status.getCategory().equals("RESULT_AMENDMENT"))) {
						resultStatuses.add(status);
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
				if (!resultsRemarks.isEmpty()) {
					observation.setComment(resultsRemarks.get(0).getRemarks());
				}
				if (!resultStatuses.isEmpty()) {
					if (resultStatuses.get(0) != null && resultStatuses.get(0).getStatus() != null) {
						if (resultStatuses.get(0).getStatus().equals("AMENDED")) {
							observation.setStatus(Obs.Status.AMENDED);
						}
					}
				} else {
					observation.setStatus(Obs.Status.FINAL);
				}

				// quick fix for lab - to capture coded results
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
				// System.out.println(observation);
				observationService.saveObs(observation, "");
				// Add logic to send email
				// 1. The subject of the email should be stored on a global property.
				// 2. The body of the email should also be stored on a global property
				// 3. Results structure html should be stored on a global property

				String shouldSendEmail = administrationService
						.getGlobalProperty(ICareConfig.LAB_RESULTS_SHOULD_SEND_EMAIL_FOR_AUTHORIZED_RESULTS);

				// if (shouldSendEmail == null) {
				// throw new Exception("The configuration of "
				// + ICareConfig.LAB_RESULTS_SHOULD_SEND_EMAIL_FOR_AUTHORIZED_RESULTS
				// + " is missing please configure");
				// }

				if (shouldSendEmail.equals("true")
						&& administrationService
						.getGlobalProperty(ICareConfig.LAB_RESULTS_SUBJECT_CONFIGURATION_HTML) != null
						&& administrationService
						.getGlobalProperty(ICareConfig.LAB_RESULTS_BODY_ATTACHMENT_CONFIGURATION_HTML) != null
						&& administrationService
						.getGlobalProperty(ICareConfig.LAB_RESULTS_BODY_SUMMARY_CONFIGURATION_HTML) != null
						&& (administrationService
						.getGlobalProperty(ICareConfig.ICARE_PERSON_EMAIL_ATTRIBUTE_TYPE) != null
						|| administrationService
						.getGlobalProperty(ICareConfig.ICARE_VISIT_EMAIL_ATTRIBUTE_TYPE) != null)) {
					String attchmentHtml = "";

					List<String> emailsToSendResults = new ArrayList<>();
					Properties emailProperties = new Properties();
					String subject = administrationService.getGlobalProperty(
							ICareConfig.LAB_RESULTS_SUBJECT_CONFIGURATION_HTML);
					String attachmentHtml = administrationService.getGlobalProperty(
							ICareConfig.LAB_RESULTS_BODY_ATTACHMENT_CONFIGURATION_HTML);
					String bodySummaryHtml = administrationService.getGlobalProperty(
							ICareConfig.LAB_RESULTS_BODY_SUMMARY_CONFIGURATION_HTML);
					String bodyFooterHtml = "";
					if (administrationService
							.getGlobalProperty(ICareConfig.LAB_RESULTS_BODY_FOOTER_CONFIGURATION_HTML) != null) {
						bodyFooterHtml = administrationService.getGlobalProperty(
								ICareConfig.LAB_RESULTS_BODY_FOOTER_CONFIGURATION_HTML);
					}
					String clientEmailAttributeTypeUuid = administrationService.getGlobalProperty(
							ICareConfig.ICARE_PERSON_EMAIL_ATTRIBUTE_TYPE);
					String visitEmailAttributeTypeUuid = administrationService.getGlobalProperty(
							ICareConfig.ICARE_VISIT_EMAIL_ATTRIBUTE_TYPE);
					attchmentHtml = attachmentHtml;
					Date date = new Date();
					bodySummaryHtml = bodySummaryHtml.replace("{sampleCollectionDate}",
							sample.getDateTime().toString());
					bodySummaryHtml = bodySummaryHtml + "<br />" + bodyFooterHtml;

					attchmentHtml = attchmentHtml.replace("{date}", date.getDate() + "-" + (date.getMonth() + 1) + "-"
							+ date.getYear());

					String regex = "<tbody>(.*?)</tbody>";
					Pattern pattern = Pattern.compile(regex, Pattern.DOTALL);
					Matcher matcher = pattern.matcher(attchmentHtml);
					String tbodyContent = "";
					String fromMail = administrationService.getGlobalProperty("mail.from");
					emailProperties.setProperty("from", fromMail);
					emailProperties.setProperty("subject", subject);
					Visit visit = sample.getVisit();
					Set<VisitAttribute> visitAttributes = visit.getAttributes();
					Set<PersonAttribute> personAttributes = visit.getPatient().getPerson().getAttributes();
					if (clientEmailAttributeTypeUuid != null) {
						for (PersonAttribute personAttribute : personAttributes) {
							if (personAttribute.getAttributeType().getUuid().equals(clientEmailAttributeTypeUuid)) {
								// TODO: Validate the email address
								emailsToSendResults.add(personAttribute.getValue());
							}
						}
					}

					if (visitEmailAttributeTypeUuid != null) {
						for (VisitAttribute visitAttribute : visitAttributes) {
							if (visitAttribute.getAttributeType().getUuid().equals(visitEmailAttributeTypeUuid)) {
								// TODO: Validate the email address
								emailsToSendResults.add(visitAttribute.getValue().toString());
							}
						}
					}
					// Process results for each of the order with
					if (matcher.find()) {
						tbodyContent = matcher.group(1);
						String newTableBodies = "";
						for (SampleOrder sampleOrder : sample.getSampleOrders()) {
							newTableBodies = newTableBodies
									+ tbodyContent.replace("{test}",
									sampleOrder.getOrder().getConcept().getDisplayString());
							String regExpForParameterRow = "<tr parameterrepeatable>.*?</tr>";
							Pattern parameterPattern = Pattern.compile(regExpForParameterRow, Pattern.DOTALL);
							Matcher parameterRowMatcher = parameterPattern.matcher(tbodyContent.toString());
							String parameterRow = "";
							String newRows = "";

							if (parameterRowMatcher.find()
									&& !sampleOrder.getOrder().getConcept().getSetMembers().isEmpty()) {
								parameterRow = parameterRowMatcher.group(0);
								int count = 1;
								for (Concept conceptSetMember : sampleOrder.getOrder().getConcept().getSetMembers()) {
									String resultValue = "Processing ....";
									String comment = " - ";
									for (TestAllocation testAllocationRef : sampleOrder.getTestAllocations()) {
										if (testAllocationRef.getTestConcept().getUuid()
												.equals(conceptSetMember.getUuid())) {
											resultValue = getTestResultsValueFromTestAllocation(testAllocationRef);
											Result result = new Result();
											if (!testAllocationRef.getTestAllocationResults().isEmpty()) {
												result = testAllocationRef.getTestAllocationResults().get(
														testAllocationRef.getTestAllocationResults().size() - 1);
											}
											for (TestAllocationStatus allocationStatus : testAllocationRef
													.getTestAllocationStatuses()) {
												if (result != null && allocationStatus != null
														&& allocationStatus.getTestResult() != null
														&& allocationStatus.getTestResult().getUuid()
														.equals(result.getUuid())
														&& allocationStatus.getCategory() != null
														&& allocationStatus.getCategory()
														.equalsIgnoreCase("result_remarks")
														&& allocationStatus.getRemarks() != null) {
													comment = allocationStatus.getRemarks();
												}
											}
											;
										}
									}
									newRows = newRows
											+ parameterRow.replace("{sn}", Integer.toString(count))
											.replace("{parameter}", conceptSetMember.getDisplayString())
											.replace("{result}", resultValue)
											.replace("{comment}", comment);
									newTableBodies = newTableBodies.replace(parameterRow, newRows);
									count = count + 1;
								}
							} else if (sampleOrder.getOrder().getConcept().getSetMembers().isEmpty()) {
								String resultValue = "Processing";
								String comment = " - ";
								Concept orderConcept = sampleOrder.getOrder().getConcept();
								for (TestAllocation testAllocationRef : sampleOrder.getTestAllocations()) {
									if (testAllocationRef.getTestConcept().getUuid().equals(orderConcept.getUuid())) {
										resultValue = getTestResultsValueFromTestAllocation(testAllocationRef);
										Result result = new Result();
										if (testAllocationRef.getTestAllocationResults() != null
												&& !testAllocationRef.getTestAllocationResults().isEmpty()) {
											result = testAllocationRef.getTestAllocationResults().get(
													testAllocationRef.getTestAllocationResults().size() - 1);
										}
										for (TestAllocationStatus allocationStatus : testAllocationRef
												.getTestAllocationStatuses()) {
											if (result != null && allocationStatus != null
													&& allocationStatus.getTestResult() != null
													&& allocationStatus.getTestResult().getUuid()
													.equals(result.getUuid())
													&& allocationStatus.getCategory() != null && allocationStatus
													.getCategory().equalsIgnoreCase("result_remarks")) {
												comment = allocationStatus.getRemarks();
											}
										}
										;
									}
								}
								newRows = newRows
										+ parameterRow.replace("{sn}", "1")
										.replace("{parameter}", orderConcept.getDisplayString())
										.replace("{result}", resultValue).replace("{comment}", comment);
								newTableBodies = newTableBodies.replace(parameterRow, newRows);
							}
							attchmentHtml = attchmentHtml.replace(matcher.group(0), newTableBodies);
							// System.out.println(content);
						}
					}
					emailProperties.setProperty("content", bodySummaryHtml);
					emailProperties.setProperty("attachmentFile", attchmentHtml);
					emailProperties.setProperty("attachmentFileName", "NPHL_results.pdf");
					ICareService iCareService = Context.getService(ICareService.class);
					for (String email : emailsToSendResults) {
						emailProperties.setProperty("to", email);
						iCareService.processEmail(emailProperties);
					}
				}
			}
		}
		return createdStatus;
	}
	
	private String getTestResultsValueFromTestAllocation(TestAllocation testAllocation) throws Exception {
		String resultValue = "Processing ....";
		// TODO: Add support for all concept data types supported
		if (testAllocation != null && testAllocation.getTestAllocationResults() != null
		        && !testAllocation.getTestAllocationResults().isEmpty()) {
			if (testAllocation.getTestConcept().getDatatype().isText()) {
				resultValue = testAllocation.getTestAllocationResults()
				        .get(testAllocation.getTestAllocationResults().size() - 1).getValueText();
			} else if (testAllocation.getTestConcept().getDatatype().isCoded()) {
				if (testAllocation.getTestAllocationResults().get(testAllocation.getTestAllocationResults().size() - 1) != null
				        && testAllocation.getTestAllocationResults()
				                .get(testAllocation.getTestAllocationResults().size() - 1).getValueCodedName() != null) {
					resultValue = testAllocation.getTestAllocationResults()
					        .get(testAllocation.getTestAllocationResults().size() - 1).getValueCodedName().getName();
				}
			} else if (testAllocation.getTestConcept().getDatatype().isNumeric()) {
				if (testAllocation.getTestAllocationResults().get(testAllocation.getTestAllocationResults().size() - 1) != null
				        && testAllocation.getTestAllocationResults()
				                .get(testAllocation.getTestAllocationResults().size() - 1).getValueNumeric() != null) {
					resultValue = testAllocation.getTestAllocationResults()
					        .get(testAllocation.getTestAllocationResults().size() - 1).getValueNumeric().toString();
				}
			} else if (testAllocation.getTestConcept().getDatatype().isBoolean()) {
				if (testAllocation.getTestAllocationResults().get(testAllocation.getTestAllocationResults().size() - 1) != null
				        && testAllocation.getTestAllocationResults()
				                .get(testAllocation.getTestAllocationResults().size() - 1).getValueBoolean() != null) {
					resultValue = testAllocation.getTestAllocationResults()
					        .get(testAllocation.getTestAllocationResults().size() - 1).getValueBoolean().toString();
				}
			} else {
				resultValue = "NA";
			}
		}
		return resultValue;
	}
	
	public List<Map<String, Object>> updateTestAllocationStatuses(List<TestAllocationStatus> testAllocationStatuses)
			throws Exception {
		List<Map<String, Object>> responses = new ArrayList<>();
		for (TestAllocationStatus testAllocationStatus : testAllocationStatuses) {
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
	public List<TestTimeConfig> getTestTimeConfigs(String q) {
		// return IteratorUtils.toList(this.testTimeConfigDAO.findAll().iterator());
		return this.testTimeConfigDAO.getConfig(q);
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
	public List<String> generateLaboratoryIdLabels(String globalPropertyUuid, String metadataType, Integer count) {
		return this.sampleLableDAO.generateLaboratoryIdLabels(globalPropertyUuid, metadataType, count);
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
		// User user =
		// Context.getUserService().getUserByUuid(testOrderLocation.getUser().getUuid());
		User user = Context.getAuthenticatedUser();
		
		Date date = new Date();
		
		testOrderLocation.setConcept(concept);
		testOrderLocation.setLocation(location);
		testOrderLocation.setUser(user);
		testOrderLocation.setDateTime(date);
		
		testOrderLocationDAO.save(testOrderLocation);
		
		return testOrderLocation;
	}
	
	public WorkloadSummary getWorkLoadSummary(Date startDate, Date endDate) {
		return sampleDAO.getWorkloadSummary(startDate, endDate);
	}
	
	@Override
	public List<Batch> getBatches(Date startDate, Date endDate, String uuid, String q, Integer startIndex, Integer limit) {
		return batchDAO.getBatches(startDate, endDate, uuid, q, startIndex, limit);
	}
	
	@Override
	public Batch getBatchByUuid(String batchUuid) {
		return batchDAO.findByUuid(batchUuid);
	}
	
	@Override
	public List<Sample> getSamplesByBatchSampleUuid(String batchUuid) {
		
		return sampleDAO.getSamplesByBatchSampleUuid(batchUuid);
	}
	
	@Override
	public Batch addBatch(Batch batch) {
		return batchDAO.save(batch);
	}
	
	@Override
	public BatchSample addBatchSamples(BatchSample batchSample) throws Exception {
		Batch batch = batchDAO.findByUuid(batchSample.getBatch().getUuid());
		if (batch == null) {
			throw new Exception("The batch with uuid " + batchSample.getBatch().getUuid() + " does not exist");
		}
		
		batchSample.setBatch(batch);
		return batchSampleDAO.save(batchSample);
	}
	
	@Override
	public BatchSample getBatchSampleByUuid(String batchSampleUuid) {
		return batchSampleDAO.findByUuid(batchSampleUuid);
	}
	
	@Override
	public List<BatchSample> getBatchSamples(Date startDate, Date endDate, String q, Integer startIndex, Integer limit,
	        String batchUuid) {
		
		List<BatchSample> batchSamples = batchSampleDAO.getBatchSamples(startDate, endDate, q, startIndex, limit, batchUuid);
		
		for (BatchSample batchSample : batchSamples) {
			for (Sample sample : batchSample.getSamples()) {
				List<WorksheetSample> worksheetSamples = this.worksheetSampleDAO
				        .getWorksheetSampleBySample(sample.getUuid());
				if (worksheetSamples.size() > 0) {
					sample.setWorksheetSample(worksheetSamples.get(0));
				}
			}
		}
		return batchSamples;
	}
	
	@Override
	public ListResult<SampleExt> getSamplesWithoutAllocations(Date startDate, Date endDate, Pager pager, String location,
	        String sampleCategory, String testCategory, String q, String hasStatus, String acceptedByUuid,
	        String testConceptUuid, String departmentUuid, String specimenSourceUuid, String instrumentUuid,
	        String visitUuid, String excludeStatus) {
		return sampleDAO.getSamplesWithoutAllocations(startDate, endDate, pager, location, sampleCategory, testCategory, q,
		    hasStatus, acceptedByUuid, testConceptUuid, departmentUuid, specimenSourceUuid, instrumentUuid, visitUuid,
		    excludeStatus);
	}
	
	@Override
	public AssociatedField addAssociatedField(AssociatedField associatedField) {
		return associatedFieldDAO.save(associatedField);
	}
	
	@Override
	public List<AssociatedField> getAssociatedFields(String q, Integer startIndex, Integer limit) {
		return associatedFieldDAO.getAssociatedFields(q, startIndex, limit);
	}
	
	@Override
	public TestAllocationAssociatedField addTestAllocationAssociatedField(
	        TestAllocationAssociatedField testAllocationAssociatedField) throws Exception {
		
		if (testAllocationAssociatedField.getTestAllocation() != null) {
			TestAllocation testAllocation = this.testAllocationDAO.findByUuid(testAllocationAssociatedField
			        .getTestAllocation().getUuid());
			
			if (testAllocation == null) {
				throw new Exception("The test allocation with uuid "
				        + testAllocationAssociatedField.getTestAllocation().getUuid() + " does not exist");
			}
			testAllocationAssociatedField.setTestAllocation(testAllocation);
		}
		
		if (testAllocationAssociatedField.getAssociatedField() != null) {
			AssociatedField associatedField = this.associatedFieldDAO.findByUuid(testAllocationAssociatedField
			        .getAssociatedField().getUuid());
			
			if (associatedField == null) {
				throw new Exception(" The associated field with uuid "
				        + testAllocationAssociatedField.getAssociatedField().getUuid() + " does not exist");
			}
			testAllocationAssociatedField.setAssociatedField(associatedField);
		}
		return testAllocationAssociatedFieldDAO.save(testAllocationAssociatedField);
	}
	
	@Override
	public List<TestAllocationAssociatedField> getTestAllocationAssociatedFields(String q, Integer startIndex,
	        Integer limit, String allocationUuid, String associatedFieldUuid) {
		return testAllocationAssociatedFieldDAO.getTestAllocationAssociatedField(q, startIndex, limit, allocationUuid,
		    associatedFieldUuid);
	}
	
	@Override
	public AssociatedFieldResult addAssociatedFieldResult(AssociatedFieldResult associatedFieldResult) throws Exception {
		
		if (associatedFieldResult.getAssociatedField() != null) {
			
			AssociatedField associatedField = this.associatedFieldDAO.findByUuid(associatedFieldResult.getAssociatedField()
			        .getUuid());
			if (associatedField == null) {
				throw new Exception(" The associated field with uuid "
				        + associatedFieldResult.getAssociatedField().getUuid() + " does not exist");
			}
			associatedFieldResult.setAssociatedField(associatedField);
		}
		
		if (associatedFieldResult.getResult() != null) {
			Result result = this.resultDAO.findByUuid(associatedFieldResult.getResult().getUuid());
			if (result == null) {
				throw new Exception(" The result with uuid" + associatedFieldResult.getResult().getUuid()
				        + " does not exist");
			}
			associatedFieldResult.setResult(result);
		}
		
		return associatedFieldResultDAO.save(associatedFieldResult);
	}
	
	@Override
	public List<AssociatedFieldResult> getAssociatedFieldResults(Integer startIndex, Integer limit, String resultUuid,
	        String associatedFieldUuid) {
		return associatedFieldResultDAO.getAssociatedFieldResult(startIndex, limit, resultUuid, associatedFieldUuid);
	}
	
	@Override
	public AssociatedField getAssociatedFieldByUuid(String associatedFieldUuid) {
		return associatedFieldDAO.findByUuid(associatedFieldUuid);
	}
	
	@Override
	public AssociatedField updateAssociatedField(String associatedFieldUuid, AssociatedField associatedField) {
		return associatedFieldDAO.updateAssociatedField(associatedFieldUuid, associatedField);
	}
	
	@Override
	public TestTimeConfig deleteTestTimeConfiguration(String testConfigUuid) {
		return testTimeConfigDAO.deleteTestConfig(testConfigUuid);
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
	
	@Override
	public List<Worksheet> getWorksheets(Date startDate, Date endDate, String q, Integer startIndex, Integer limit) {
		return worksheetDAO.getWorksheets(startDate, endDate, q, startIndex, limit);
	}
	
	@Override
	public Worksheet getWorksheetByUuid(String worksheetUuid) {
		return worksheetDAO.findByUuid(worksheetUuid);
	}
	
	@Override
	public Worksheet addWorksheet(Worksheet worksheet) {
		return worksheetDAO.save(worksheet);
	}
	
	@Override
	public List<WorksheetControl> getWorksheetControls(Date startDate, Date endDate, String q, Integer startIndex,
	        Integer limit) {
		return worksheetControlDAO.getWorksheetControls(startDate, endDate, q, startIndex, limit);
	}
	
	@Override
	public WorksheetControl getWorksheetControlByUuid(String worksheetControlUuid) {
		return worksheetControlDAO.findByUuid(worksheetControlUuid);
	}
	
	@Override
	public WorksheetControl addWorksheetControl(WorksheetControl worksheetControl) {
		return worksheetControlDAO.save(worksheetControl);
	}
	
	@Override
	public List<WorksheetDefinition> getWorksheetDefinitions(Date startDate, Date endDate, String q, Integer startIndex,
	        Integer limit, Date expirationDate, String instrumentUuid) {
		return worksheetDefinitionDAO.getWorksheetDefinitions(startDate, endDate, q, startIndex, limit, expirationDate,
		    instrumentUuid);
	}
	
	@Override
	public Map<String, Object> getWorksheetDefinitionByUuid(String worksheetDefinitionUuid) {
		WorksheetDefinition worksheetDefinition = worksheetDefinitionDAO.findByUuid(worksheetDefinitionUuid);
		List<WorksheetSample> worksheetSamples = worksheetSampleDAO
				.getWorksheetSamplesByWorksheetDefinition(worksheetDefinition.getUuid().toString());

		Map<String, Object> worksheetDefinitionModified = new HashMap<>();
		worksheetDefinitionModified.put("uuid", worksheetDefinition.getUuid());
		worksheetDefinitionModified.put("code", worksheetDefinition.getCode());
		worksheetDefinitionModified.put("display", worksheetDefinition.getCode());
		worksheetDefinitionModified.put("additionFields", worksheetDefinition.getAdditionalFields());

		List<Map<String, Object>> worksheetSamplesList = new ArrayList<>();
		for (WorksheetSample wSample : worksheetSamples) {
			worksheetSamplesList.add(wSample.toMap());
		}
		worksheetDefinitionModified.put("worksheetSamples", worksheetSamplesList);
		worksheetDefinitionModified.put("worksheet", worksheetDefinition.getWorksheet().toMap());
		return worksheetDefinitionModified;
	}
	
	@Override
	public WorksheetDefinition getDefaultWorksheetDefinitionByUuid(String worksheetDefinitionUuid) {
		WorksheetDefinition worksheetDefinition = worksheetDefinitionDAO.findByUuid(worksheetDefinitionUuid);
		return worksheetDefinition;
	}
	
	@Override
	public WorksheetDefinition addWorksheetDefinition(WorksheetDefinition worksheetDefinition) throws Exception {
		
		Worksheet worksheet = this.getWorksheetByUuid(worksheetDefinition.getWorksheet().getUuid());
		if (worksheet == null) {
			throw new Exception("The worksheet definition with id " + worksheetDefinition.getWorksheet().getUuid()
			        + " does not exist");
		}
		worksheetDefinition.setWorksheet(worksheet);
		return worksheetDefinitionDAO.save(worksheetDefinition);
	}
	
	@Override
	public List<WorksheetSample> getWorksheetSamples(Date startDate, Date endDate, String q, Integer startIndex,
	        Integer limit) {
		return worksheetSampleDAO.getWorksheetSamples(startDate, endDate, q, startIndex, limit);
	}
	
	@Override
	public WorksheetSample getWorksheetSampleByUuid(String worksheetSampleUuid) {
		return worksheetSampleDAO.findByUuid(worksheetSampleUuid);
	}
	
	@Override
	public WorksheetSample addWorksheetSample(WorksheetSample worksheetSample) throws Exception {
		
		if (worksheetSample.getSample() != null) {
			Sample sample = this.getSampleByUuid(worksheetSample.getSample().getUuid());
			if (sample == null) {
				throw new Exception("The sample with id " + worksheetSample.getSample().getUuid() + " does not exist");
			}
			worksheetSample.setSample(sample);
		}
		
		WorksheetDefinition worksheetDefinition = this.getDefaultWorksheetDefinitionByUuid(worksheetSample
		        .getWorksheetDefinition().getUuid());
		if (worksheetDefinition == null) {
			throw new Exception("The worksheet definition with id " + worksheetSample.getWorksheetDefinition().getUuid()
			        + " does not exist");
		}
		
		if (worksheetSample.getWorksheetControl() != null) {
			WorksheetControl worksheetControl = this.getWorksheetControlByUuid(worksheetSample.getWorksheetControl()
			        .getUuid());
			if (worksheetControl == null) {
				throw new Exception("The worksheet control with id " + worksheetSample.getWorksheetControl().getUuid()
				        + " does not exist");
			}
			worksheetSample.setWorksheetControl(worksheetControl);
		}
		worksheetSample.setWorksheetDefinition(worksheetDefinition);
		return worksheetSampleDAO.save(worksheetSample);
	}
	
	public WorksheetStatus addWorksheetStatus(WorksheetStatus worksheetStatus) throws Exception {
		
		Worksheet worksheet = this.getWorksheetByUuid(worksheetStatus.getWorksheet().getUuid());
		if (worksheet == null) {
			throw new Exception("The worksheet with id " + worksheetStatus.getWorksheet().getUuid() + " does not exist");
		}
		worksheetStatus.setWorksheet(worksheet);
		return worksheetStatusDAO.save(worksheetStatus);
		
	}
	
	@Override
	public WorksheetSampleStatus addWorksheetSampleStatus(WorksheetSampleStatus worksheetSampleStatus) throws Exception {
		
		WorksheetSample worksheetSample = this
		        .getWorksheetSampleByUuid(worksheetSampleStatus.getWorksheetSample().getUuid());
		if (worksheetSample == null) {
			throw new Exception("The worksheet sample with uuid " + worksheetSampleStatus.getWorksheetSample().getUuid()
			        + " does not exist");
		}
		worksheetSampleStatus.setWorksheetSample(worksheetSample);
		return worksheetSampleStatusDAO.save(worksheetSampleStatus);
	}
	
}
