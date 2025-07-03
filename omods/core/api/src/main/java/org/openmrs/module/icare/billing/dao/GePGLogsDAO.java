package org.openmrs.module.icare.billing.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.icare.billing.models.GePGLogs;
import org.openmrs.module.icare.billing.models.Payment;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.Collections;
import java.util.List;

@Repository
@Transactional
public class GePGLogsDAO extends BaseDAO<GePGLogs> {
	
	DbSessionFactory sessionFactory;
	
	protected DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	public void setSessionFactory(DbSessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}
	
	public GePGLogs save(GePGLogs entity) {
		DbSession session = getSession();
		session.persist(this.getType(), entity);
		session.flush();
		return entity;
	}
	
	public List<GePGLogs> getGepgLogsByRequestId(String requestId, String patientName, String status,
	        Boolean startWithLastLogs) {
		DbSession session = getSession();
		String queryStr = "SELECT logs FROM GePGLogs logs";
		
		boolean requestIdChecked = requestId != null && !requestId.replace(" ", "").isEmpty();
		boolean patientNameChecked = patientName != null && !patientName.isEmpty();
		
		if (requestIdChecked) {
			queryStr += " WHERE logs.requestId = :requestId";
		}
		
		if (patientNameChecked) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE LOWER(logs.request) LIKE :patientName";
			} else {
				queryStr += " OR LOWER(logs.request) LIKE :patientName";
			}
		}
		
		if (status != null && !status.isEmpty()) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE LOWER(logs.status) LIKE :status";
			} else {
				queryStr += " OR LOWER(logs.status) LIKE :status";
			}
		}
		
		if (startWithLastLogs != null && startWithLastLogs) {
			queryStr += " ORDER BY logs.dateCreated DESC";
		}
		
		Query query = session.createQuery(queryStr);
		if (requestIdChecked) {
			query.setParameter("requestId", requestId);
		}
		
		if (patientNameChecked) {
			query.setParameter("patientName", "%" + patientName.toLowerCase().replace(" ", "%") + "%");
		}
		
		return query.list();
	}
}
