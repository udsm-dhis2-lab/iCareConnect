/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.icare.core.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openmrs.*;
import org.openmrs.api.*;
import org.openmrs.api.context.Context;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.billing.ItemNotPayableException;
import org.openmrs.module.icare.billing.models.ItemPrice;
import org.openmrs.module.icare.billing.models.Prescription;
import org.openmrs.module.icare.billing.services.insurance.Claim;
import org.openmrs.module.icare.billing.services.insurance.ClaimResult;
import org.openmrs.module.icare.billing.services.insurance.InsuranceService;
import org.openmrs.module.icare.core.ICareService;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.core.Message;
import org.openmrs.module.icare.core.dao.ICareDao;
import org.openmrs.module.icare.core.utils.VisitWrapper;
import org.openmrs.module.icare.store.models.OrderStatus;
import org.openmrs.validator.ValidateUtil;

import javax.naming.ConfigurationException;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class ICareServiceImpl extends BaseOpenmrsService implements ICareService {
	
	ICareDao dao;
	
	UserService userService;
	
	/**
	 * Injected in moduleApplicationContext.xml
	 */
	public void setDao(ICareDao dao) {
		this.dao = dao;
	}
	
	/**
	 * Injected in moduleApplicationContext.xml
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
	@Override
	public Item getItemByUuid(String uuid) throws APIException {
		return dao.findByUuid(uuid);
	}
	
	@Override
	public Item saveItem(Item item) throws APIException {
		if ((item.getConcept() == null && item.getDrug() == null) || (item.getConcept() != null && item.getDrug() != null)) {
			throw new APIException("One type between Concept or Drug must be specified.");
		}
		if (item.getConcept() != null) {
			ConceptService conceptService = Context.getService(ConceptService.class);
			Concept concept = conceptService.getConceptByUuid(item.getConcept().getUuid());
			if (concept == null) {
				throw new APIException("Concept Does not Exists");
			}
			item.setConcept(concept);
			if (item.getStockable() == null) {
				item.setStockable(false);
			}
		} else if (item.getDrug() != null) {
			ConceptService conceptService = Context.getService(ConceptService.class);
			Drug drug = conceptService.getDrugByUuid(item.getDrug().getUuid());
			if (drug == null) {
				throw new APIException("Drug Does not Exists");
			}
			item.setDrug(drug);
			if (item.getStockable() == null) {
				item.setStockable(true);
			}
		} else {
			throw new APIException("One type between Concept or Drug must be specified.");
		}
		return dao.saveItem(item);
	}
	
	@Override
	public Item getItemByConceptId(Integer id) {
		return dao.getItemByConceptId(id);
	}
	
	@Override
	public ItemPrice getItemPriceByConceptId(Integer serviceConceptId, Integer paymentSchemeConceptId,
	        Integer paymentTypeConceptId) {
		return dao.getItemPriceByConceptId(serviceConceptId, paymentSchemeConceptId, paymentTypeConceptId);
	}
	
	@Override
	public ItemPrice getItemPrice(Visit visit, Concept billableConcept) throws Exception {
		//VisitMetaData visitMetaData = VisitExtrapolator.extrapolateMetaData(visit);
		VisitWrapper visitWrapper = new VisitWrapper(visit);
		Concept paymentSchemeConcept = visitWrapper.getPaymentScheme();
		Concept paymentTypeConcept = visitWrapper.getPaymentType();
		if (paymentSchemeConcept == null) {
			throw new ItemNotPayableException("Payment Schema has not been specified in the visit");
		}
		if (paymentTypeConcept == null) {
			throw new ItemNotPayableException("Payment Type has not been specified in the visit");
		}
		return this.getItemPriceByConceptId(billableConcept.getId(), paymentSchemeConcept.getId(),
		    paymentTypeConcept.getId());
	}
	
	@Override
	public ItemPrice getItemPrice(Visit visit, Drug drug) throws ItemNotPayableException, ConfigurationException {
		VisitWrapper visitWrapper = new VisitWrapper(visit);
		String serviceConceptUuidForVisit = visitWrapper.getServiceConceptUuid();
		
		Concept paymentSchemeConcept = visitWrapper.getPaymentScheme();
		Concept paymentTypeConcept = visitWrapper.getPaymentType();
		if (serviceConceptUuidForVisit == null) {
			throw new ItemNotPayableException("Service has not been specified in the visit");
		}
		if (paymentSchemeConcept == null) {
			throw new ItemNotPayableException("Payment Schema has not been specified in the visit");
		}
		if (paymentTypeConcept == null) {
			throw new ItemNotPayableException("Payment Type has not been specified in the visit");
		}
		return dao.getItemPriceByDrugId(drug.getId(), paymentSchemeConcept.getId(), paymentTypeConcept.getId());
	}
	
	@Override
	public List<ItemPrice> getItemPrices() {
		return dao.getItemPrices();
	}
	
	@Override
	public List<ItemPrice> getItemPrices(String paymentType, Integer limit, Integer startIndex) {
		if (paymentType == null) {
			return dao.getItemPrices(limit, startIndex);
		} else {
			return dao.getItemPricesByPaymentType(paymentType, limit, startIndex);
		}
	}
	
	@Override
	public ItemPrice saveItemPrice(ItemPrice itemPrice) throws APIException {
		ConceptService conceptService = Context.getService(ConceptService.class);
		if (itemPrice.getItem().getUuid() != null) {
			Item item = this.getItemByUuid(itemPrice.getItem().getUuid());
			if (item == null) {
				throw new APIException("Item does not Exists");
			}
			itemPrice.setItem(item);
		}
		if (itemPrice.getPaymentScheme() == null) {
			throw new APIException("Payment Scheme not provided");
		}
		Concept paymentScheme = conceptService.getConceptByUuid(itemPrice.getPaymentScheme().getUuid());
		if (paymentScheme == null) {
			throw new APIException("Payment Scheme does not exist");
		}
		itemPrice.setPaymentScheme(paymentScheme);
		if (itemPrice.getPaymentType() == null) {
			throw new APIException("Payment Type not provided");
		}
		Concept paymentType = conceptService.getConceptByUuid(itemPrice.getPaymentType().getUuid());
		if (paymentType == null) {
			throw new APIException("Payment Type does not exist");
		}
		itemPrice.setPaymentType(paymentType);
		return dao.saveItemPrice(itemPrice);
	}
	
	@Override
	public List<Item> getItems() {
		return dao.getItems();
	}
	
	@Override
	public List<Item> getItems(String search, Integer limit, Integer startIndex) {
		return dao.getItems(search, limit, startIndex);
	}
	
	@Override
	public Prescription savePrescription(Prescription prescription) {
		if (prescription.getUuid() != null) {
			Prescription existingPrescription = (Prescription) Context.getOrderService().getOrderByUuid(
			    prescription.getUuid());
			if (existingPrescription != null) {
				if (existingPrescription.getQuantity() != prescription.getQuantity()) {
					List<OrderStatus> orderStatuses = this.dao.getOrderStatusByOrderUuid(prescription.getUuid());
					for (OrderStatus orderStatus : orderStatuses) {
						if (orderStatus.getStatus() == OrderStatus.OrderStatusCode.DISPENSED) {
							throw new OrderEntryException("Order is already dispensed");
						}
					}
				}
				existingPrescription.updatePrescription(prescription);
				
				dao.updatePrescription(prescription);
				prescription = existingPrescription;
			}
		}
		AdministrationService administrationService = Context.getAdministrationService();
		administrationService.setGlobalProperty("validation.disable", "true");
		System.out.println("Validation:" + ValidateUtil.getDisableValidation());
		ValidateUtil.setDisableValidation(true);
		System.out.println("Validation:" + ValidateUtil.getDisableValidation());
		prescription = (Prescription) Context.getOrderService().saveOrder(prescription, null);
		administrationService.setGlobalProperty("validation.disable", "false");
		return prescription;
	}
	
	@Override
	public List<Visit> getVisitsByOrderType(String search, String orderTypeUuid, String locationUuid,
	        OrderStatus.OrderStatusCode prescriptionStatus, Order.FulfillerStatus fulfillerStatus, Integer limit,
	        Integer startIndex, VisitWrapper.OrderBy orderBy, VisitWrapper.OrderByDirection orderByDirection) {
		return this.dao.getVisitsByOrderType(search, orderTypeUuid, locationUuid, prescriptionStatus, fulfillerStatus,
		    limit, startIndex, orderBy, orderByDirection);
	}
	
	@Override
	public List<Order> getOrdersByVisitAndOrderType(String visitUuid, String orderTypeUuid,
	        Order.FulfillerStatus fulfillerStatus, Integer limit, Integer startIndex) {
		return this.dao.getOrdersByVisitAndOrderType(visitUuid, orderTypeUuid, fulfillerStatus, limit, startIndex);
	}

	@Override
	public Message sendMessage(Message message) throws Exception {
		String messagePhoneNumber = Context.getAdministrationService().getGlobalProperty(ICareConfig.MESSAGE_PHONE_NUMBER);
		if (messagePhoneNumber == null) {
			throw new Exception("Message Phone Number is not configured. Please check "
					+ ICareConfig.MESSAGE_PHONE_NUMBER + ".");
		}
		message.setPhoneNumber(messagePhoneNumber);
		String urlString = "https://us-central1-maximal-journey-328212.cloudfunctions.net/messaging";
		URL url = new URL(urlString);
		HttpURLConnection con = (HttpURLConnection) url.openConnection();
		//con.setReadTimeout(15000);
		//con.setConnectTimeout(15000);
		con.setRequestMethod("POST");
		//String bearer = String.format("Bearer %1s", authToken.getAccessToken());
		//con.addRequestProperty("Authorization", bearer);
		con.addRequestProperty("Content-Type", "application/json");
		con.setDoInput(true);
		con.setDoOutput(true);

		OutputStream os = con.getOutputStream();
		BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, "UTF-8"));
		String json = new ObjectMapper().writeValueAsString(message.toMap());
		writer.write(json);

		writer.flush();
		writer.close();
		os.close();
		try {
			BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
			String inputLine;
			StringBuffer content = new StringBuffer();
			while ((inputLine = in.readLine()) != null) {
				content.append(inputLine);
			}
			in.close();
			return message;
		}
		catch (SocketTimeoutException e) {
			throw e;
		}
		catch (Exception e) {
			BufferedReader in = new BufferedReader(new InputStreamReader(con.getErrorStream()));
			String inputLine;
			StringBuffer content = new StringBuffer();
			while ((inputLine = in.readLine()) != null) {
				content.append(inputLine);
			}
			in.close();
			throw e;
		}
	}

	@Override
	public List<Message> sendMessages(List<Message> messages) throws MalformedURLException, IOException, Exception {
		for(Message message:messages){
			this.sendMessage(message);
		}
		return messages;
	}

	@Override
	public Item getItemByConceptUuid(String uuid) {
		return dao.getItemByConceptUuid(uuid);
	}

	@Override
	public Item getItemByDrugConceptUuid(String uuid) {
		return dao.getItemByDrugConceptUuid(uuid);
	}
	
	@Override
	public void stopVisits() throws APIException {
		AdministrationService adminService = Context.getService(AdministrationService.class);
		String hoursVisitEnd = adminService.getGlobalProperty(ICareConfig.VISIT_LENGTH_IN_HOURS);
		
		if (hoursVisitEnd == null || hoursVisitEnd.trim().equals("")) {
			//newDate = new Date(System.currentTimeMillis() - TimeUnit.HOURS.toMillis(24));
		} else {
			Date newDate = new Date(System.currentTimeMillis() - TimeUnit.HOURS.toMillis(Integer.valueOf(hoursVisitEnd)));
			List<Visit> visits = dao.getOpenVisit();
			for (Visit visit : visits) {
				if (!patientIsAdmitted(visit) && newDate.after(visit.getStartDatetime())) {
					VisitWrapper visitWrapper = new VisitWrapper(visit);
					try {
						if (!(visitWrapper.isInsurance() && visitWrapper.getInsuranceName().toLowerCase().equals("nhif"))) {
							Context.getVisitService().endVisit(visit, new Date());
						}
					}
					catch (ConfigurationException e) {
						e.printStackTrace();
					}
				}
			}
		}
	}
	
	@Override
	public long getVisitSerialNumber(Visit visit) {
		return dao.getVisitSerialNumber(visit);
	}
	
	@Override
	public Claim getClaimByVisitUuid(String visitUuid) throws Exception {
		VisitService visitService = Context.getVisitService();
		//Visit visit = visitService.getVisitByUuid(visitUuid);
		//VisitWrapper visitWrapper = new VisitWrapper(visit);
		VisitWrapper visit = new VisitWrapper(visitService.getVisitByUuid(visitUuid));
		InsuranceService insuranceService = visit.getInsuranceService();
		if (insuranceService != null) {
			return insuranceService.getClaim(visit.getVisit());
		}
		return null;
	}
	
	@Override
	public ClaimResult claimByVisitUuid(String visitUuid) throws Exception {
		VisitService visitService = Context.getVisitService();
		//Visit visit = visitService.getVisitByUuid(visitUuid);
		//VisitWrapper visitWrapper = new VisitWrapper(visit);
		VisitWrapper visit = new VisitWrapper(visitService.getVisitByUuid(visitUuid));
		InsuranceService insuranceService = visit.getInsuranceService();
		if (insuranceService != null) {
			return insuranceService.claim(visit.getVisit());
		}
		return null;
	}
	
	@Override
	public Item getItemByDrugUuid(String uuid) {
		return dao.getItemByDrugUuid(uuid);
	}
	
	@Override
	public ItemPrice getItemPriceByDrugId(Integer drugId, Integer paymentSchemeConceptId, Integer paymentTypeConceptId) {
		return dao.getItemPriceByDrugId(drugId, paymentSchemeConceptId, paymentTypeConceptId);
	}
	
	Boolean patientIsAdmitted(Visit visit) {
		if (visit.getStopDatetime() == null) {
			for (Encounter encounter : visit.getEncounters()) {
				for (Order order : encounter.getOrders()) {
					if (order.getOrderType().getName().equals("Bed Order") && (new Date()).before(order.getAutoExpireDate())) {
						return true;
					}
				}
			}
		}
		return false;
	}
}
