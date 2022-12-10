package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.Result;
import org.springframework.stereotype.Repository;

public class ResultDAO extends BaseDAO<Result> {
	
	public Result getTestResultsByUuid(String uuid) {
		DbSession session = this.getSession();
		String queryStr = "SELECT r FROM Result r \n" + " WHERE r.uuid = :uuid";
		Query query = session.createQuery(queryStr);
		query.setParameter("uuid", uuid);
		return (Result) query.list().get(0);
	}
}
