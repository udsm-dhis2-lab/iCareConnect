/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.icare;

import org.springframework.stereotype.Component;

/**
 * Contains module's config.
 */
@Component("icare.ICareConfig")
public class ICareConfig {
	
	public final static String MODULE_PRIVILEGE = "ICare Privilege";
	
	public final static String HFR_CODE = "icare.HFRCode";
	
	public final static String SERVICE_ATTRIBUTE = "icare.billing.serviceAttribute";
	
	public final static String PAYMENT_SCHEME_ATTRIBUTE = "icare.billing.paymentSchemeAttribute";
	
	public final static String PAYMENT_TYPE_ATTRIBUTE = "icare.billing.paymentTypeAttribute";
	
	public final static String REGISTRATION_ENCOUNTER_TYPE = "icare.registration.encounterType";
	
	public final static String BILLING_ORDER_TYPE = "icare.billing.orderType";
	
	public static final String CONSULTATION_ORDER_TYPE = "icare.consultation.orderType";
	
	public static final String BED_ORDER_TYPE = "icare.orderType.bed";
	
	public static final String CABINET_ORDER_TYPE = "icare.orderType.cabinet";
	
	public final static String REGISTRATION_FEE_CONCEPT = "icare.registration.feeConcept";
	
	public final static String INSURANCE_ATTRIBUTE = "icare.billing.insuranceAttribute";
	
	public final static String INSURANCE_ID_ATTRIBUTE = "icare.billing.insuranceIDAttribute";
	
	public final static String INSURANCE_AUTHORIZATION_ATTRIBUTE = "icare.billing.insuranceAuthorizationAttribute";
	
	public static final String INSURANCE_REFERRAL_NUMBER = "icare.billing.insuranceReferralNumberAttribute";
	
	public static final String INSURANCE_CLAIM_STATUS = "icare.billing.insurance.claim.status";
	
	public final static String ALLOW_NEGATIVE_STOCK = "icare.store.allowNegativeStock";
	
	public final static String VISIT_LENGTH_IN_HOURS = "icare.visit.length";
	
	public static final String FACILITY_NAME = "icare.facility.name";
	
	public static final String FACILITY_ADDRESS = "icare.facility.address";
	
	public static final String PHONE_NUMBER_ATTRIBUTE = "icare.person.attribute.phonenumber";
	
	public static final String PATIENT_SIGNATURE_ATTRIBUTE = "icare.person.attribute.signature";
	
	public static final String CONSULTATION_ENCOUNTER_TYPE = "icare.encounterType.consultation";
	
	public static final String PROVIDER_QUALIFICATION_ATTRIBUTE = "icare.attribute.provider.qualification";
	
	public static final String PROVIDER_REGISTRATION_NUMBER_ATTRIBUTE = "icare.attribute.provider.registrationNumber";
	
	public static final String PROVIDER_SIGNATURE_ATTRIBUTE = "icare.attribute.provider.signature";
	
	public static final String PROVIDER_PHONENUMBER_ATTRIBUTE = "icare.attribute.provider.phoneNumber";
	
	public static final String PATIENT_OCCUPATION_ATTRIBUTE = "icare.attribute.patient.occupation";
	
	public static final String PATIENT_ID_FORMAT = "icare.patient.id.format";
	
	public static final String SAMPLE_ID_FORMAT = "icare.laboratory.settings.sample.id.format";
	
	public static final String METADATA_CODE_ID_FORMAT = "icare.settings.code.generated.format";
	
	public static final String REGISTRATION_ENCOUNTER_ROLE = "icare.encounterRole.registration";
	
	public static final String STOCK_ENABLE = "icare.stock.enable";
	
	public static final String STOCK_LOCATIONS = "icare.stock.locations";
	
	public static final String MESSAGE_PHONE_NUMBER = "icare.notification.message.phoneNumber";
	
	public static final String EXEMPTION_REQUEST_ENCOUNTER_TYPE = "icare.encounters.exemption";
	
	public static final String EXEMPTION_REQUEST_ORDER_TYPE = "icare.orders.standard.exemption";
	
	public static final String END_CONSULTATION_CONCEPT = "iCare.visits.settings.controlVisitsEndingStatuses.ConceptUuid";
	
	public static final String BED_ORDER_CONCEPT = "icare.billing.accomodationChargesConcept";
	
	public static final String CABINET_ORDER_CONCEPT = "icare.billing.cabinetChargesConcept";
	
	public static final String LAB_RESULT_APPROVAL_CONFIGURATION = "iCare.laboratory.resultApprovalConfiguration";
	
	public static final String ITEM_EXPIRATION_NOTIFICATION_IN_DAYS = "iCare.store.item.expiration.nofication";
	
	public static final String LAB_RESULTS_SUBJECT_CONFIGURATION_HTML = "mail.icare.laboratory.results.subject.html";
	
	public static final String LAB_RESULTS_BODY_ATTACHMENT_CONFIGURATION_HTML = "mail.icare.laboratory.results.body.attachment.html";
	
	public static final String LAB_RESULTS_BODY_SUMMARY_CONFIGURATION_HTML = "mail.icare.laboratory.results.body.summary.html";
	
	public static final String LAB_RESULTS_BODY_FOOTER_CONFIGURATION_HTML = "mail.icare.laboratory.results.body.footer.html";
	
	public static final String LAB_RESULTS_SHOULD_SEND_EMAIL_FOR_AUTHORIZED_RESULTS = "mail.icare.laboratory.results.authorized.autorelease";
	
	public static final String ICARE_PERSON_EMAIL_ATTRIBUTE_TYPE = "icare.email.person.attributeTypeUuid";
	
	public static final String ICARE_VISIT_EMAIL_ATTRIBUTE_TYPE = "icare.email.visit.referringDoctor.attributeTypeUuid";
	
	public static final String LAB_RELATED_METADATA_ATTRIBUTE_TYPE = "icare.laboratory.concept.relatedMetadata.attributeUuid";
	
	public static final String LAB_UNIFIED_CODING_REFERENCE_CONCEPT_SOURCE = "icare.laboratory.concept.unifiedCodingReference.conceptSourceUuid";
	
	public static final String LAB_INSTRUMENT_CLASS_UUID = "lis.icare.laboratory.instrument.conceptClassUuid";
	
	public static final String DRUG_FREQUENCY_EQUIVALENCE_CONCEPT_SOURCE = "icare.drugs.configuration.drugFrequencyEquivalence.conceptSourceUuid";
	
	public static final String DRUG_DURATION_UNITS_EQUIVALENCE_CONCEPT_SOURCE = "icare.drugs.configuration.drugDurationEquivalence.conceptSourceUuid";
	
	public static final String PASSWORD_EXPIRATION_TIME_IN_DAYS = "icare.user.password.expiration.time";
}
