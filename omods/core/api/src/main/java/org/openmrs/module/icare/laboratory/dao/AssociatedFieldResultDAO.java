package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.AssociatedFieldResult;

import java.util.List;

public class AssociatedFieldResultDAO extends BaseDAO<AssociatedFieldResult> {
    public List<AssociatedFieldResult> getAssociatedFieldResult(Integer startIndex, Integer limit) {

        DbSession session = this.getSession();

        String queryStr = " SELECT afr FROM AssociatedFieldResult afr";

        Query query = session.createQuery(queryStr);

        query.setFirstResult(startIndex);
        query.setMaxResults(limit);

        return query.list();

    }
}
