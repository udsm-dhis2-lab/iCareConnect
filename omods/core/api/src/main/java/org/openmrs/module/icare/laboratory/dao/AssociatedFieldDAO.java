package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.AssociatedField;

import java.util.List;

public class AssociatedFieldDAO extends BaseDAO<AssociatedField> {
    public List<AssociatedField> getAssociatedFields(String q, Integer startIndex, Integer limit) {

        DbSession session = this.getSession();

        String queryStr = "SELECT af FROM AssociatedField af";

        if(q != null){
            if (q != null) {
                if (!queryStr.contains("WHERE")) {
                    queryStr += " WHERE ";
                } else {
                    queryStr += " AND ";
                }

                queryStr += "lower(af.name) like lower(:q)";
            }
        }

        Query query = session.createQuery(queryStr);

        if (q != null) {
            query.setParameter("q", "%" + q.replace(" ", "%") + "%");
        }

        query.setFirstResult(startIndex);
        query.setMaxResults(limit);

        return query.list();

    }
}
