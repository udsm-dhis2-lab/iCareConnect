/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.icare.web.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
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
import org.openmrs.module.icare.core.utils.VisitWrapper;
import org.openmrs.module.icare.store.models.OrderStatus;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.naming.ConfigurationException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
	
	/**
	 * Initially called after the getUsers method to get the landing form name
	 * 
	 * @return String form view name
	 */
	@RequestMapping(value = "item", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> onGetItem(@RequestParam(required = false) String q, @RequestParam(defaultValue = "100") Integer limit, @RequestParam(defaultValue = "0") Integer startIndex) {
		List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
		for (Item item : iCareService.getItems(q, limit, startIndex)) {
			items.add(item.toMap());
		}
		Map<String, Object> results = new HashMap<>();
		results.put("results",items);
		return results;
	}
	
	@RequestMapping(value = "item", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> onPostItemJSON(@RequestBody Item item) {
		
		Item newItem = iCareService.saveItem(item);
		return newItem.toMap();
	}
	
	public Item onPostItem(Item item) {
		return iCareService.saveItem(item);
	}
	
	@RequestMapping(value = "itemprice", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> onGet(@RequestParam(defaultValue = "100") Integer limit, @RequestParam(defaultValue = "0") Integer startIndex, @RequestParam(required = false) String paymentType) {
		List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
		for (ItemPrice item : iCareService.getItemPrices(paymentType,limit, startIndex)) {
			items.add(item.toMap());
		}
		Map<String, Object> results = new HashMap<>();
		results.put("results",items);
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
											   @RequestParam String orderTypeUuid,
											   @RequestParam(required = false) String q,
											   @RequestParam(required = false) String locationUuid,
											   @RequestParam(required = false) OrderStatus.OrderStatusCode orderStatusCode,
											   @RequestParam(defaultValue = "VISIT") VisitWrapper.OrderBy orderBy,
											   @RequestParam(defaultValue = "DESC") VisitWrapper.OrderByDirection orderByDirection,
											   @RequestParam(required = false) Order.FulfillerStatus fulfillerStatus) {

		List<Visit> visits = iCareService.getVisitsByOrderType(q, orderTypeUuid, locationUuid, orderStatusCode, fulfillerStatus,limit, startIndex, orderBy, orderByDirection);

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
	
	@RequestMapping(value = "order", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getOrdersByVisit(@RequestParam(defaultValue = "100") Integer limit,
											   @RequestParam(defaultValue = "0") Integer startIndex,
											   @RequestParam String orderTypeUuid,
												@RequestParam String visitUuid,
											   @RequestParam(required = false) Order.FulfillerStatus fulfillerStatus) {

		List<Order> orders = iCareService.getOrdersByVisitAndOrderType(visitUuid, orderTypeUuid, fulfillerStatus,limit, startIndex);

		List<Map<String, Object>> responseSamplesObject = new ArrayList<Map<String, Object>>();
		for (Order order : orders) {

			if(order instanceof Prescription){
				Map<String, Object> sampleObject = ((Prescription)order).toMap();
				responseSamplesObject.add(sampleObject);
			}

		}
		Map<String,Object> retults = new HashMap<>();
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
}
