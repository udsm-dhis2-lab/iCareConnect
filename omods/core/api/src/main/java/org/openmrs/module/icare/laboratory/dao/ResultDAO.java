package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.Result;
import org.openmrs.module.icare.laboratory.models.Sample;
import org.springframework.stereotype.Repository;

import java.util.Calendar;
import java.util.List;

public class ResultDAO extends BaseDAO<Result> {
	
	public Result getResultById(Integer id) {
		DbSession session = this.getSession();
		String queryStr = "SELECT re FROM Result re \n" + "WHERE id= :id";
		Query query = session.createQuery(queryStr);
		query.setParameter("id", id);
		return (Result) query.list().get(0);
	}
}
