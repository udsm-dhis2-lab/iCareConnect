package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.TestAllocationAssociatedField;

import java.util.List;

public class TestAllocationAssociatedFieldDAO extends BaseDAO<TestAllocationAssociatedField> {

    public List<TestAllocationAssociatedField> getTestAllocationAssociatedField(String q, Integer startIndex, Integer limit) {

        DbSession session = this.getSession();

        String queryStr = "SELECT taf FROM TestAllocationAssociatedField taf";

//        if(q != null){
//            if (q != null) {
//                if (!queryStr.contains("WHERE")) {
//                    queryStr += " WHERE ";
//                } else {
//                    queryStr += " AND ";
//                }
//
//                queryStr += "lower(taf.name) like lower(:q)";
//            }
//        }

        Query query = session.createQuery(queryStr);

//        if (q != null) {
//            query.setParameter("q", "%" + q.replace(" ", "%") + "%");
//        }

        query.setFirstResult(startIndex);
        query.setMaxResults(limit);

        return query.list();
    }
}
