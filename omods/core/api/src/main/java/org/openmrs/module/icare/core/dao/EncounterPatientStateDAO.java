package org.openmrs.module.icare.core.dao;

import org.hibernate.Query;
import org.openmrs.Encounter;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.models.EncounterPatientState;

import java.util.List;

public class EncounterPatientStateDAO extends BaseDAO<EncounterPatientState> {
	
	public List<Encounter> getEncountersByPatientState(String patientStateUuid) {
		DbSession session = this.getSession();
		String queryStr = " SELECT wfs.encounter FROM EncounterPatientState wfs WHERE wfs.patientState.uuid =:patientStateUuid";
		Query query = session.createQuery(queryStr);
		query.setParameter("patientStateUuid", patientStateUuid);
		return query.list();
		
	}
}
