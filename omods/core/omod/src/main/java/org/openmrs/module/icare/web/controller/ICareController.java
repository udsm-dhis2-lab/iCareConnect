/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 * <p>
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.icare.web.controller;

import com.mysql.fabric.xmlrpc.Client;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.util.JSONPObject;
import org.json.JSONObject;
import org.openmrs.*;
import org.openmrs.api.*;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.models.ItemPrice;
import org.openmrs.module.icare.billing.models.Prescription;
import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.billing.services.insurance.Claim;
import org.openmrs.module.icare.billing.services.insurance.ClaimResult;
import org.openmrs.module.icare.core.ICareService;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.core.Message;
import org.openmrs.module.icare.core.Summary;
import org.openmrs.module.icare.core.utils.PatientWrapper;
import org.openmrs.module.icare.core.utils.VisitWrapper;
import org.openmrs.module.icare.store.models.OrderStatus;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.naming.ConfigurationException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.*;

/**
 * This class configured as controller using annotation and mapped with the URL of
 * 'module/${rootArtifactid}/${rootArtifactid}Link.form'.
 */
@Controller
@RequestMapping(value = "/rest/" + RestConstants.VERSION_1 + "/icare")
public class ICareController {
	
	@Autowired
	ICareService iCareService;
	
	@Autowired
	BillingService billingService;
	
	/** Logger for this class and subclasses */
	protected final Log log = LogFactory.getLog(getClass());
	
	@RequestMapping(value = "idgen", method = RequestMethod.POST)
    @ResponseBody
    public Map<String, Object> onGenerateId() {
        Map<String, Object> results = new HashMap<>();
        List<String> ids = iCareService.generatePatientIds();
        results.put("identifiers", ids);
        return results;
    }
	
	/**
	 * Initially called after the getUsers method to get the landing form name
	 * 
	 * @return String form view name
	 */
	@RequestMapping(value = "summary", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> onGetSummary() {
		Summary summary = iCareService.getSummary();
		return summary.toMap();
	}
	
	/**
	 * Initially called after the getUsers method to get the landing form name
	 * 
	 * @return String form view name
	 */
	@RequestMapping(value = "item", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> onGetItem(@RequestParam(required = false) String q, @RequestParam(defaultValue = "100") Integer limit, @RequestParam(defaultValue = "0") Integer startIndex, @RequestParam(required = false) String department, @RequestParam(required = false) Item.Type type) {
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (Item item : iCareService.getItems(q, limit, startIndex, department, type)) {
            items.add(item.toMap());
        }
        Map<String, Object> results = new HashMap<>();
        results.put("results", items);
        return results;
    }
	
	@RequestMapping(value = "item", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> onPostItemJSON(@RequestBody Item item) {
		
		Item newItem = iCareService.saveItem(item);
		return newItem.toMap();
	}
	
	@RequestMapping(value = "itemByConcept/{conceptUuid}", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> onGetItemByConcept(@PathVariable("conceptUuid") String conceptUuid) {
		
		Item newItem = iCareService.getItemByConceptUuid(conceptUuid);
		return newItem.toMap();
	}
	
	@RequestMapping(value = "itemByDrugConcept/{conceptUuid}", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> onGetItemByDrugConcept(@PathVariable("conceptUuid") String conceptUuid) {
		
		Item newItem = iCareService.getItemByDrugConceptUuid(conceptUuid);
		return newItem.toMap();
	}
	
	public Item onPostItem(Item item) {
		return iCareService.saveItem(item);
	}
	
	@RequestMapping(value = "itemprice", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> onGet(@RequestParam(defaultValue = "100") Integer limit, @RequestParam(defaultValue = "0") Integer startIndex, @RequestParam(required = false) String paymentType) {
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (ItemPrice item : iCareService.getItemPrices(paymentType, limit, startIndex)) {
            items.add(item.toMap());
        }
        Map<String, Object> results = new HashMap<>();
        results.put("results", items);
        return results;
    }
	
	@RequestMapping(value = "itemprice", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> onPostItemPrice(@RequestBody ItemPrice itemPrice) {
		ItemPrice newItemPrice = iCareService.saveItemPrice(itemPrice);
		return newItemPrice.toMap();
	}
	
	/**
	 * This class returns the form backing object. This can be a string, a boolean, or a normal java
	 * pojo. The bean name defined in the ModelAttribute annotation and the type can be just defined
	 * by the return type of this method
	 */
	@RequestMapping(method = RequestMethod.POST)
	@ResponseBody
	protected List<User> getUsers() throws Exception {
		
		// this object will be made available to the jsp page under the variable name
		// that is defined in the @ModuleAttribute tag
		return new ArrayList<User>();
	}
	
	@RequestMapping(value = "laborder", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Order onPostLabOrderCreation(@RequestBody Map<String, Object> orderObject) throws Exception {
		PatientService patientService = Context.getService(PatientService.class);
		Patient patient = patientService.getPatientByUuid((String) orderObject.get("patient"));
		
		TestOrder order = new TestOrder();
		order.setAction(Order.Action.valueOf((String) orderObject.get("action")));
		order.setUrgency(Order.Urgency.valueOf((String) orderObject.get("urgency")));
		order.setPatient(patient);
		
		ProviderService providerService = Context.getProviderService();
		Provider provider = providerService.getProviderByUuid((String) orderObject.get("orderer"));
		order.setOrderer(provider);
		
		Concept concept = new Concept();
		concept.setUuid((String) orderObject.get("concept"));
		order.setConcept(Context.getConceptService().getConceptByUuid((String) orderObject.get("concept")));
		
		OrderService orderService = Context.getOrderService();
		order.setCareSetting(orderService.getCareSetting(1));
		
		Encounter encounter = new Encounter();
		encounter.setUuid((String) orderObject.get("encounter"));
		encounter.setPatient(patient);
		order.setEncounter(Context.getEncounterService().getEncounterByUuid((String) orderObject.get("encounter")));
		
		//Order newOrder = billingService.createLabOrder(order);
		//return newOrder;
		return null;
	}
	
	@RequestMapping(value = "message", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, Object> sendMessage(@RequestBody Map<String, Object> messageObject) throws Exception {
		
		Message message = Message.fromMap(messageObject);
		message = iCareService.sendMessage(message);
		return message.toMap();
	}
	
	@RequestMapping(value = "messages", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public List<Map<String, Object>> sendMessages(@RequestBody List<Map<String, Object>> messageList) throws Exception {

        List<Message> messages = new ArrayList<>();

        for (Map<String, Object> messageObject : messageList) {
            Message message = Message.fromMap(messageObject);
            messages.add(message);
        }
        messages = iCareService.sendMessages(messages);
        messageList = new ArrayList<>();

        for (Message message : iCareService.sendMessages(messages)) {
            messageList.add(message.toMap());
        }
        return messageList;
    }
	
	@RequestMapping(value = "prescription", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, Object> onPostDrugOrderCreation(@RequestBody Map<String, Object> orderObject) throws Exception {
		Prescription prescription = Prescription.fromMap(orderObject);
		
		ConceptService conceptService = Context.getConceptService();
		OrderService orderService = Context.getOrderService();
		PatientService patientService = Context.getPatientService();
		
		prescription.setDoseUnits(conceptService.getConceptByUuid(prescription.getDoseUnits().getUuid()));
		prescription.setDurationUnits(conceptService.getConceptByUuid(prescription.getDurationUnits().getUuid()));
		prescription.setRoute(conceptService.getConceptByUuid(prescription.getRoute().getUuid()));
		prescription.setFrequency(orderService.getOrderFrequencyByUuid(prescription.getFrequency().getUuid()));
		prescription.setQuantityUnits(conceptService.getConceptByUuid(prescription.getQuantityUnits().getUuid()));
		//order.setNumRefills((Integer) orderObject.get("numRefills"));
		
		prescription.setDrug(conceptService.getDrugByUuid(prescription.getDrug().getUuid()));
		prescription.setPatient(patientService.getPatientByUuid(prescription.getPatient().getUuid()));
		//order.setId(33009);
		
		ProviderService providerService = Context.getProviderService();
		Provider provider = providerService.getProviderByUuid(prescription.getOrderer().getUuid());
		prescription.setOrderer(provider);
		
		//Concept concept = new Concept();
		//concept.setUuid((String) orderObject.get("concept"));
		prescription.setConcept(conceptService.getConceptByUuid(prescription.getConcept().getUuid()));
		prescription.setCareSetting(orderService.getCareSetting(1));
		
		prescription.setEncounter(Context.getEncounterService().getEncounterByUuid(prescription.getEncounter().getUuid()));
		
		OrderType orderType = Context.getOrderService().getOrderTypeByName("Prescription");
		if (orderType == null) {
			throw new ConfigurationException("Prescription Order Type is not configured.");
		}
		prescription.setOrderType(orderType);
		prescription = iCareService.savePrescription(prescription);
		return prescription.toMap();
	}
	
	@RequestMapping(value = "visit", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> getPendingVisit(@RequestParam(defaultValue = "100") Integer limit,
                                               @RequestParam(defaultValue = "0") Integer startIndex,
                                               @RequestParam(required = false) String orderTypeUuid,
                                               @RequestParam(required = false) String q,
                                               @RequestParam(required = false) String locationUuid,
                                               @RequestParam(required = false) OrderStatus.OrderStatusCode orderStatusCode,
                                               @RequestParam(defaultValue = "VISIT") VisitWrapper.OrderBy orderBy,
                                               @RequestParam(defaultValue = "DESC") VisitWrapper.OrderByDirection orderByDirection,
                                               @RequestParam(required = false) Order.FulfillerStatus fulfillerStatus,
											   @RequestParam(required = false) String attributeValueReference,
											   @RequestParam(required = false) VisitWrapper.PaymentStatus paymentStatus
											   ) {

        List<Visit> visits = iCareService.getVisitsByOrderType(q, orderTypeUuid, locationUuid, orderStatusCode, fulfillerStatus, limit, startIndex, orderBy, orderByDirection, attributeValueReference, paymentStatus);

        List<Map<String, Object>> responseSamplesObject = new ArrayList<Map<String, Object>>();
        for (Visit visit : visits) {

            Map<String, Object> sampleObject = (new VisitWrapper(visit)).toMap();

            //add the sample after creating its object
            responseSamplesObject.add(sampleObject);

        }
        Map<String, Object> retults = new HashMap<>();
        retults.put("results", responseSamplesObject);
        return retults;
    }
	
	@RequestMapping(value = "order", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> getOrdersByVisit(@RequestParam(defaultValue = "100") Integer limit,
                                                @RequestParam(defaultValue = "0") Integer startIndex,
                                                @RequestParam String orderTypeUuid,
                                                @RequestParam String visitUuid,
                                                @RequestParam(required = false) Order.FulfillerStatus fulfillerStatus) {

        List<Order> orders = iCareService.getOrdersByVisitAndOrderType(visitUuid, orderTypeUuid, fulfillerStatus, limit, startIndex);

        List<Map<String, Object>> responseSamplesObject = new ArrayList<Map<String, Object>>();
        for (Order order : orders) {

            if (order instanceof Prescription) {
                Map<String, Object> sampleObject = ((Prescription) order).toMap();
                responseSamplesObject.add(sampleObject);
            }

        }
        Map<String, Object> retults = new HashMap<>();
        retults.put("results", responseSamplesObject);
        return retults;
    }
	
	@RequestMapping(value = "visit/{visitUuid}/claimForm", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getClaim(@PathVariable("visitUuid") String visitUuid) throws Exception {
		Claim claim = iCareService.getClaimByVisitUuid(visitUuid);
		return claim.toMap();
	}
	
	@RequestMapping(value = "visit/{visitUuid}/claim", method = RequestMethod.GET)
	@ResponseBody
	public ClaimResult claim(@PathVariable("visitUuid") String visitUuid) throws Exception {
		ClaimResult claim = iCareService.claimByVisitUuid(visitUuid);
		return claim;
	}
	
	@RequestMapping(value = "concept", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getIcareConcepts(@RequestParam(value = "q", required = false) String q, @RequestParam(value = "conceptClass", required = false) String conceptClass, @RequestParam(value = "searchTerm", required = false) String searchTerm, @RequestParam(defaultValue = "50") Integer limit, @RequestParam(defaultValue = "0") Integer startIndex) {
		List<Map<String, Object>> conceptsList = new ArrayList<>();
		for (Concept conceptItem: iCareService.getConcepts(q, conceptClass, searchTerm, limit, startIndex)) {
			Map<String, Object> conceptMap = new HashMap<String, Object>();
			conceptMap.put("uuid", conceptItem.getUuid().toString());
			conceptMap.put("display", conceptItem.getDisplayString());

//			Class details
			Map<String, Object> classDetails = new HashMap<String, Object>();
			classDetails.put("uuid", conceptItem.getConceptClass().getUuid() );
			classDetails.put("name", conceptItem.getConceptClass().getName() );
			conceptMap.put("class",  classDetails );
//			Mappings
			Map<String, Object> mappings = new HashMap<String, Object>();
			mappings.put("name", conceptItem.getConceptMappings().getClass().getName() );

			conceptMap.put("mappings",  mappings );
			conceptsList.add(conceptMap);
		}
		Map<String, Object> results = new HashMap<>();
		results.put("results", conceptsList);
		return results;
	}
	
	@RequestMapping(value = "conceptreferenceterm", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getIcareConceptReferenceTerms(@RequestParam(value = "q", required = false) String q,
															 @RequestParam(value = "source", required = false) String source,
															 @RequestParam(defaultValue = "50") Integer limit,
															 @RequestParam(defaultValue = "0") Integer startIndex) {
		List<Map<String, Object>> conceptReferenceTermsList = new ArrayList<>();
		for (ConceptReferenceTerm conceptReferenceTerm: iCareService.getConceptReferenceTerms(q, source, limit, startIndex)) {
			Map<String, Object> conceptReferenceTermMap = new HashMap<String, Object>();
			conceptReferenceTermMap.put("uuid", conceptReferenceTerm.getUuid().toString());
			conceptReferenceTermMap.put("display", conceptReferenceTerm.getName().toString());
			conceptReferenceTermMap.put("code", conceptReferenceTerm.getCode());

//			Source details
			Map<String, Object> sourceDetails = new HashMap<String, Object>();
			sourceDetails.put("uuid", conceptReferenceTerm.getConceptSource().getUuid().toString() );
			sourceDetails.put("name", conceptReferenceTerm.getConceptSource().getName().toString() );
			conceptReferenceTermMap.put("source", sourceDetails);
			conceptReferenceTermsList.add(conceptReferenceTermMap);
		}
		Map<String, Object> results = new HashMap<>();
		results.put("results", conceptReferenceTermsList);
		return results;
	}
	
	@RequestMapping(value = "conceptsets", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getConceptSetsByConcept(@RequestParam(value = "concept", required = false) String concept) {
		List<Map<String, Object>> conceptSetsList = new ArrayList<>();
		for (ConceptSet conceptSets: iCareService.getConceptsSetsByConcept(concept)) {
			Map<String, Object> conceptSet = new HashMap<String, Object>();
			conceptSet.put("uuid", conceptSets.getConceptSet().getUuid());
			conceptSet.put("display", conceptSets.getConceptSet().getDisplayString());
			conceptSetsList.add(conceptSet);
		}
		Map<String, Object> results = new HashMap<>();
		results.put("results", conceptSetsList);
		return results;
	}
	
	@RequestMapping(value = "drug", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getDrugs(@RequestParam(value = "concept", required = false) String concept, @RequestParam(defaultValue = "50") Integer limit, @RequestParam(defaultValue = "0") Integer startIndex) {
		List<Map<String, Object>> drugsList = new ArrayList<>();
		for (Drug drug: iCareService.getDrugs(concept, limit, startIndex)) {
			Map<String, Object> drugMap = new HashMap<String, Object>();
			drugMap.put("uuid", drug.getUuid());
			drugMap.put("display", drug.getDisplayName());
			drugMap.put("name", drug.getName());
			drugMap.put("description", drug.getDescription());
			drugMap.put("retired", drug.getRetired());

			Map<String, Object> conceptMap = new HashMap<String, Object>();
			conceptMap.put("uuid",drug.getConcept().getUuid());
			conceptMap.put("display",drug.getConcept().getDisplayString());
			drugMap.put("concept", conceptMap);
			drugsList.add(drugMap);
		}
		Map<String, Object> results = new HashMap<>();
		results.put("results", drugsList);
		return results;
	}
	
	@RequestMapping(value ="patient", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getPatient(@RequestParam(required = false) String search,@RequestParam(required = false) String patientUUID,@RequestParam(required = false) PatientWrapper.VisitStatus visitStatus,@RequestParam(defaultValue = "100") Integer limit,
										  @RequestParam(defaultValue = "0") Integer startIndex,@RequestParam(defaultValue = "DESC") PatientWrapper.OrderByDirection orderByDirection){

		List<PatientWrapper> patients = iCareService.getPatients(search,patientUUID,visitStatus,startIndex,limit,orderByDirection);

		List<Map<String, Object>> responseSamplesObject = new ArrayList<Map<String, Object>>();
		for (PatientWrapper patient: patients){

			responseSamplesObject.add((Map<String, Object>) patient.toMap());

		}
		Map<String, Object> results = new HashMap<>();
		results.put("results",responseSamplesObject);

		return results;
	}
	
	@RequestMapping(value = "patient", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, Object> createPatient(@RequestBody Map<String, Object> patientObject) throws Exception {
		
		Patient patient = new Patient();
		patient.setIdentifiers((Set<PatientIdentifier>) patientObject.get("identifiers"));
		patient.setBirthdate((Date) patientObject.get("birthdate"));
		patient.setAddresses((Set<PersonAddress>) patientObject.get("addresses"));
		patient.setNames((Set<PersonName>) patientObject.get("names"));
		patient.setDead((Boolean) patientObject.get("dead"));
		patient.setGender((String) patientObject.get("gender"));
		
		patient = iCareService.savePatient(patient);
		
		Map<String, Object> patientcreated = new HashMap<String, Object>();
		patientcreated.put("identifiers", patient.getIdentifiers());
		patientcreated.put("names", patient.getNames());
		patientcreated.put("addresses", patient.getAddresses());
		patientcreated.put("gender", patient.getGender());
		
		return patientcreated;
		
	}
	
	@RequestMapping(value = "client/externalsystems", method = RequestMethod.GET)
	@ResponseBody
	public List<Object> getClientsFromExternalSystems(@RequestParam(value = "identifier", required = false) String identifier,
	        @RequestParam(value = "identifierReference", required = false) String identifierReference) {
//		Object patientData = new Object();
		List<Object> formattedTrackedEntityInstances = new ArrayList<>();
		try {
			String patientFromExternalSystem = iCareService.getClientsFromExternalSystems(identifier, identifierReference);

			AdministrationService administrationService = Context.getService(AdministrationService.class);

//			Get Attributes for extracting attribute values
			String firstNameAttributeUid = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.attributes.firstName");
//					"bVEIQbyClKX";
			String middleNameAttributeUid = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.attributes.middleName");
			String lastNameAttributeUid = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.attributes.lastName");
			String genderAttributeUid = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.attributes.gender");
			String nationalityAttributeUid = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.attributes.nationality");
			String dobAttributeUid = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.attributes.dob");
			String passportNumberAttributeUid = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.attributes.passportNumber");
			String phoneNumberAttributeUid = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.attributes.phoneNumber");

//			Get results stage uid
			String resultsStageId = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.programStages.resultsStage");

//			Get test request stage uid
			String testRequestStageId = administrationService.getGlobalProperty("iCare.externalSystems.integrated.pimaCovid.programStages.testRequestStage");

//			patientData = (Object) patientFromExternalSystem;
			JSONObject test = new JSONObject(patientFromExternalSystem);
			Map trackedEntityInstancesMap = (new ObjectMapper()).readValue(patientFromExternalSystem, Map.class);
//			patientData = trackedEntityInstancesMap.get("trackedEntityInstances");
			List<Object> trackedEntityInstances = (List<Object>)trackedEntityInstancesMap.get("trackedEntityInstances");
			for (int count =0; count < trackedEntityInstances.size(); count++) {
				Map<String, Object> clientFormattedData = new HashMap<>();
				Map<String, Object> currentTrackedEntityInstance = new HashMap<>();
				currentTrackedEntityInstance = (Map<String, Object> )trackedEntityInstances.get(count);
				List<Object> enrollments = (List<Object>)currentTrackedEntityInstance.get("enrollments");
				Map<String, Object> eventData = new HashMap<>();
				Map<String, Object> currentEnrollment = (Map<String, Object> )enrollments.get(0);  // Expected to have only one enrollment
				List<Object> events = (List<Object>)currentEnrollment.get("events");
				eventData.put("hasResults", events.size() == 2);
				clientFormattedData.put("events", events);
				for (int eventCount =0; eventCount< events.size(); eventCount ++) {
					Map<String, Object> event =(Map<String, Object>) events.get(eventCount);
					if (event.get("programStage").equals(resultsStageId)) {
						clientFormattedData.put("hasResults", true);
					}

					if (event.get("programStage").equals(testRequestStageId)) {
						clientFormattedData.put("testRequestData", event);
					}
				}
				clientFormattedData.put("trackedEntityInstance", currentTrackedEntityInstance.get("trackedEntityInstance"));
				clientFormattedData.put("enrollment", currentEnrollment.get("enrollment"));
				clientFormattedData.put("enrollmentDate", currentEnrollment.get("enrollmentDate"));
				clientFormattedData.put("orgUnitName", currentEnrollment.get("orgUnitName"));
				clientFormattedData.put("orgUnit", currentEnrollment.get("orgUnit"));
				clientFormattedData.put("status", currentEnrollment.get("status"));
				clientFormattedData.put("program", currentEnrollment.get("program"));
				List<Object> attributes = (List<Object>) currentTrackedEntityInstance.get("attributes");
				for (int attributeCount =0; attributeCount < attributes.size(); attributeCount ++) {
					Map<String, Object> attribute = (Map<String, Object> )attributes.get(attributeCount);
					if (attribute.get("attribute").equals(firstNameAttributeUid)) {
						clientFormattedData.put("firstName",attribute.get("value"));
					}
					if (attribute.get("attribute").equals(middleNameAttributeUid)) {
						clientFormattedData.put("middleName",attribute.get("value"));
					}
					if (attribute.get("attribute").equals(lastNameAttributeUid)) {
						clientFormattedData.put("lastName",attribute.get("value"));
					}
					if (attribute.get("attribute").equals(genderAttributeUid)) {
						clientFormattedData.put("gender",attribute.get("value"));
					}
					if (attribute.get("attribute").equals(nationalityAttributeUid)) {
						clientFormattedData.put("nationality",attribute.get("value"));
					}
					if (attribute.get("attribute").equals(dobAttributeUid)) {
						clientFormattedData.put("dob",attribute.get("value"));
					}
					if (attribute.get("attribute").equals(passportNumberAttributeUid)) {
						clientFormattedData.put("passportNumber",attribute.get("value"));
					}
					if (attribute.get("attribute").equals(phoneNumberAttributeUid)) {
						clientFormattedData.put("phoneNumber",attribute.get("value"));
					}
				}
				clientFormattedData.put("attributes", currentTrackedEntityInstance.get("attributes"));
//				formattedTrackedEntityInstance.put("orgUnitName", (new ObjectMapper()).readValue(trackedEntityInstances[count], Map.class));
				formattedTrackedEntityInstances.add(count,clientFormattedData);
			}
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
		catch (URISyntaxException e) {
			throw new RuntimeException(e);
		}
		return formattedTrackedEntityInstances;
	}
}
