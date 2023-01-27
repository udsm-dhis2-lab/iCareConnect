package org.openmrs.module.icare.billing.dao;

// Generated Oct 7, 2020 12:49:21 PM by Hibernate Tools 5.2.10.Final

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.icare.billing.models.Payment;
import org.openmrs.module.icare.core.dao.BaseDAO;

import javax.transaction.Transactional;
import java.util.List;

/**
 * Home object for domain model class BlPayment.
 * 
 * @see org.openmrs.module.icare.billing.models.Payment
 * @author Hibernate Tools
 */
@Transactional
public class PaymentDAO extends BaseDAO<Payment> {
	
	DbSessionFactory sessionFactory;
	
	protected DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	public void setSessionFactory(DbSessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}
	
	public Payment save(Payment entity) {
		DbSession session = getSession();
		session.persist(this.getType(), entity);
		session.flush();
		
		//this.sessionFactory.getCurrentSession().saveOrUpdate(entity);
		return entity;
	}
	
	public List<Payment> findByPatientUuid(String patientUuid) {
		DbSession session = this.getSession();
		String queryStr = "SELECT p FROM Payment p WHERE p.invoice.visit.patient.uuid = :patientUuid";
		Query query = session.createQuery(queryStr);
		query.setParameter("patientUuid", patientUuid);
		return query.list();
	}
}
