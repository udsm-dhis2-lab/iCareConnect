package org.openmrs.module.icare.store.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.store.models.StockInvoice;

public class StockInvoiceDAO extends BaseDAO<StockInvoice> {
	
	public ListResult<StockInvoice> getStockInvoices(Pager pager) {
		DbSession session = this.getSession();
		String queryStr = " SELECT stinv FROM StockInvoice stinv";
		
		Query query = session.createQuery(queryStr);
		
		if (pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		
		ListResult<StockInvoice> listResults = new ListResult();
		listResults.setPager(pager);
		listResults.setResults(query.list());
		return listResults;
		
	}
}
