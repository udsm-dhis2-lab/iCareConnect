package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.Worksheet;
import org.openmrs.module.icare.laboratory.models.WorksheetDefinition;

import java.util.Date;
import java.util.List;

public class WorksheetDefinitionDAO extends BaseDAO<WorksheetDefinition> {
	
	public List<WorksheetDefinition> getWorksheetDefinitions(Date startDate, Date endDate, String q, Integer startIndex,
	        Integer limit, Date expirationDate) {
		
		DbSession session = this.getSession();
		String queryStr = "SELECT wd FROM WorksheetDefinition wd";
		
		if (startDate != null && endDate != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			}
			queryStr += " (cast(wd.dateCreated as date) BETWEEN :startDate AND :endDate)";
		}
		
		if (q != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			
			queryStr += "lower(wd.code) like lower(:q)";
		}

		if (expirationDate != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " cast(wd.expirationDateTime as date) >= :expirationDate";
		}
		
		//Construct a query object
		Query query = session.createQuery(queryStr);
		
		//Attach arguments accordingly
		if (startDate != null) {
			query.setParameter("startDate", startDate);
		}
		if (endDate != null && startDate != null) {
			query.setParameter("endDate", endDate);
		}
		
		if (q != null) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}

		if (expirationDate != null) {
			query.setParameter("expirationDate", expirationDate);
		}

		query.setFirstResult(startIndex);
		query.setMaxResults(limit);
		
		return query.list();
		
	}
}
