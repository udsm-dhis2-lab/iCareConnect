/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.icare.core;

import org.openmrs.*;
import org.openmrs.annotation.Authorized;
import org.openmrs.api.APIException;
import org.openmrs.api.OpenmrsService;
import org.openmrs.module.icare.billing.ItemNotPayableException;
import org.openmrs.module.icare.billing.VisitInvalidException;
import org.openmrs.module.icare.billing.models.ItemPrice;
import org.openmrs.module.icare.billing.models.Prescription;
import org.openmrs.module.icare.billing.services.insurance.Claim;
import org.openmrs.module.icare.billing.services.insurance.ClaimResult;
import org.openmrs.module.icare.core.utils.PatientWrapper;
import org.openmrs.module.icare.core.utils.VisitWrapper;
import org.openmrs.module.icare.store.models.OrderStatus;
import org.springframework.transaction.annotation.Transactional;

import javax.naming.ConfigurationException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;

/**
 * The main service of this module, which is exposed for other modules. See
 * moduleApplicationContext.xml on how it is wired up.
 */
public interface ICareService extends OpenmrsService {
	
	/**
	 * Returns an item by uuid. It can be called by any authenticated user. It is fetched in read
	 * only transaction.
	 * 
	 * @param uuid
	 * @return
	 * @throws APIException
	 */
	@Authorized()
	@Transactional(readOnly = true)
	Item getItemByUuid(String uuid) throws APIException;
	
	/**
	 * Saves an item. Sets the owner to superuser, if it is not set. It can be called by users with
	 * this module's privilege. It is executed in a transaction.
	 * 
	 * @param item
	 * @return
	 * @throws APIException
	 */
	@Transactional
	Item saveItem(Item item) throws APIException;
	
	Item getItemByConceptId(Integer id);
	
	ItemPrice getItemPriceByConceptId(Integer serviceConceptId, Integer paymentSchemeConceptId, Integer paymentTypeConceptId);
	
	ItemPrice getItemPrice(Visit visit, Concept concept) throws Exception;
	
	ItemPrice getItemPrice(Visit visit, Drug drug) throws ItemNotPayableException, ConfigurationException;
	
	List<ItemPrice> getItemPrices();
	
	List<ItemPrice> getItemPrices(String paymentType, Integer limit, Integer startIndex);
	
	@Transactional
	ItemPrice saveItemPrice(ItemPrice itemPrice) throws APIException;
	
	List<Item> getItems();
	
	Item getItemByConceptUuid(String uuid);
	
	Item getItemByDrugConceptUuid(String uuid);
	
	@Transactional
	void stopVisits() throws APIException;
	
	long getVisitSerialNumber(Visit visit);
	
	Claim getClaimByVisitUuid(String visitUuid) throws Exception;
	
	ClaimResult claimByVisitUuid(String visitUuid) throws Exception;
	
	Item getItemByDrugUuid(String uuid);
	
	ItemPrice getItemPriceByDrugId(Integer serviceConceptId, Integer paymentSchemeConceptId, Integer paymentTypeConceptId);
	
	List<Item> getItems(String search, Integer limit, Integer startIndex, String department, Item.Type type);
	
	Prescription savePrescription(Prescription order);
	
	List<Visit> getVisitsByOrderType(String search, String orderTypeUuid, String locationUuid,
	        OrderStatus.OrderStatusCode prescriptionStatus, Order.FulfillerStatus fulfillerStatus, Integer limit,
	        Integer startIndex, VisitWrapper.OrderBy orderBy, VisitWrapper.OrderByDirection orderByDirection,
	        String attributeValueReference, VisitWrapper.PaymentStatus paymentStatus);
	
	List<Order> getOrdersByVisitAndOrderType(String visitUuid, String orderTypeUuid, Order.FulfillerStatus fulfillerStatus,
	        Integer limit, Integer startIndex);
	
	Message sendMessage(Message message) throws MalformedURLException, IOException, Exception;
	
	List<Message> sendMessages(List<Message> messages) throws MalformedURLException, IOException, Exception;
	
	List<String> generatePatientIds();
	
	List<Concept> getConcepts(String q, String conceptClass, String searchTerm, Integer limit, Integer startIndex);
	
	List<ConceptReferenceTerm> getConceptReferenceTerms(String q, String source, Integer limit, Integer startIndex);
	
	List<ConceptSet> getConceptsSetsByConcept(String concept);
	
	List<PatientWrapper> getPatients(String search, String patientUUID, PatientWrapper.VisitStatus visitStatus,
	        Integer startIndex, Integer limit, PatientWrapper.OrderByDirection orderByDirection);
	
	Patient savePatient(Patient patient);
	
	Message sendMessageRequest(Message message) throws Exception;
	
	Summary getSummary();
	
	List<Drug> getDrugs(String concept, Integer limit, Integer startIndex);
	
	String getClientsFromExternalSystems(String identifier, String identifierReference) throws IOException,
	        URISyntaxException;
}
