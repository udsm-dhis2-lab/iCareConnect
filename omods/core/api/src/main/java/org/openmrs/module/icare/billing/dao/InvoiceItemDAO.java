package org.openmrs.module.icare.billing.dao;

// Generated Oct 7, 2020 12:49:21 PM by Hibernate Tools 5.2.10.Final

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.billing.models.InvoiceItem;

import java.util.List;

/**
 * Home object for domain model class BlInvoiceItem.
 * 
 * @see org.openmrs.module.icare.core.dao.BlInvoiceItem
 * @author Hibernate Tools
 */
public class InvoiceItemDAO extends BaseDAO<InvoiceItem> {
	
	DbSessionFactory sessionFactory;
	
	protected DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	public void setSessionFactory(DbSessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}
	
	public List<InvoiceItem> findInvoiceItemByOrderIdItemIdAndInvoiceId(InvoiceItem invoiceItem) {
		
		DbSession session = this.getSession();
		
		String queryStr = "SELECT * FROM InvoiceItem invoiceItem WHERE order_id = :order_id AND item_id = :item_id AND invoice_id = invoice_id";
		Query query = session.createQuery(queryStr);
		query.setParameter("order_id", invoiceItem.getOrder().getOrderId());
		query.setParameter("invoice_id", invoiceItem.getInvoice().getId());
		query.setParameter("item_id", invoiceItem.getItem().getId());
		return query.list();
	}
}
