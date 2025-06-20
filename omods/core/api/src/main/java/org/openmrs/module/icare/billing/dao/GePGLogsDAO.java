package org.openmrs.module.icare.billing.dao;

import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.icare.billing.models.GePGLogs;
import org.openmrs.module.icare.billing.models.Payment;
import org.openmrs.module.icare.core.dao.BaseDAO;

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
	
}
