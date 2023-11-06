package org.openmrs.module.icare.core.dao;

import org.hibernate.Query;
import org.openmrs.Encounter;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.models.EncounterPatientProgram;

import java.util.List;

public class EncounterPatientProgramDAO extends BaseDAO<EncounterPatientProgram> {
    public List<Encounter> getEncounterByPatientProgram(String patientProgramUuid) {
        DbSession session = this.getSession();
        String queryStr = " SELECT ep.encounter FROM EncounterProgram ep WHERE ep.patientProgram.uuid =:patientStateUuid";
        Query query = session.createQuery(queryStr);
        query.setParameter("patientProgramUuid", patientProgramUuid);
        return query.list();

    }
}
