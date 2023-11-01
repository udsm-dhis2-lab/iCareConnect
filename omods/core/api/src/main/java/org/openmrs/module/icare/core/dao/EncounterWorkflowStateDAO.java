package org.openmrs.module.icare.core.dao;

import org.codehaus.jackson.map.Serializers;
import org.hibernate.Query;
import org.openmrs.Encounter;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.models.EncounterWorkflowState;

import java.util.List;

public class EncounterWorkflowStateDAO extends BaseDAO<EncounterWorkflowState> {
    public List<Encounter> getEncountersBYWorkflowState(String workflowStateUuid) {
        DbSession session = this.getSession();
        String queryStr = " SELECT DISTINCT wfs.encounter FROM EncounterWorkflowState wfs WHERE wfs.programWorkflowState.uuid =:workflowStateUuid";
        Query query = session.createQuery(queryStr);
        query.setParameter("workflowStateUuid", workflowStateUuid);
        return query.list();


    }
}
