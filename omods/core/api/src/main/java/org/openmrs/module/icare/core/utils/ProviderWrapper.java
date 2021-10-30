package org.openmrs.module.icare.core.utils;

import org.openmrs.Provider;
import org.openmrs.ProviderAttribute;
import org.openmrs.VisitAttribute;
import org.openmrs.VisitAttributeType;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.VisitService;
import org.openmrs.api.context.Context;
import org.openmrs.attribute.AttributeType;
import org.openmrs.module.icare.ICareConfig;

import javax.naming.ConfigurationException;
import java.util.List;

public class ProviderWrapper {
	
	private Provider provider;
	
	public ProviderWrapper(Provider provider) {
		this.provider = provider;
	}
	
	public Provider getProvider() {
		return provider;
	}
	
	private String getAttribute(String attributeConfig) throws ConfigurationException {
		String attributeValue = null;
		AdministrationService adminService = Context.getService(AdministrationService.class);
		String insuranceAttributeUuid = adminService.getGlobalProperty(attributeConfig);
		if (insuranceAttributeUuid == null) {
			throw new ConfigurationException("Attribute ID is configured. Please set '" + attributeConfig + "'");
		}
		VisitService visitService = Context.getService(VisitService.class);
		List<VisitAttributeType> visitAttributeTypes = visitService.getAllVisitAttributeTypes();
		for (ProviderAttribute attribute : this.provider.getAttributes()) {
			AttributeType attributeType = attribute.getAttributeType();
			for (VisitAttributeType visitAttributeType : visitAttributeTypes) {
				if (visitAttributeType.getUuid().equals(attributeType.getUuid())) {
					if (visitAttributeType.getUuid().equals(insuranceAttributeUuid)) { //CASH OR Insurance
						attributeValue = (String) attribute.getValue();
					}
				}
			}
		}
		return attributeValue;
	}
	
	public String getQualification() throws ConfigurationException {
		return this.getAttribute(ICareConfig.PROVIDER_QUALIFICATION_ATTRIBUTE);
	}
	
	public String getRegistrationNumber() throws ConfigurationException {
		return this.getAttribute(ICareConfig.PROVIDER_REGISTRATION_NUMBER_ATTRIBUTE);
	}
	
	public String getSignature() throws ConfigurationException {
		return this.getAttribute(ICareConfig.PROVIDER_SIGNATURE_ATTRIBUTE);
	}
	
	public String getPhoneNumber() throws ConfigurationException {
		return this.getAttribute(ICareConfig.PROVIDER_PHONENUMBER_ATTRIBUTE);
	}
}
