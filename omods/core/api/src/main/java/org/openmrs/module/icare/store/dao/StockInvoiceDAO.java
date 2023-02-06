package org.openmrs.module.icare.store.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.store.models.StockInvoice;
import org.openmrs.module.icare.store.models.StockInvoiceStatus;

public class StockInvoiceDAO extends BaseDAO<StockInvoice> {
	
	public ListResult<StockInvoice> getStockInvoices(Pager pager, StockInvoiceStatus.Type status) {
		DbSession session = this.getSession();
		String queryStr = " SELECT stinv FROM StockInvoice stinv WHERE stinv.voided = false";

		if(status == StockInvoiceStatus.Type.DRAFT){
			if(!queryStr.contains("WHERE")){
				queryStr +=" WHERE";
			}else{
				queryStr +=" AND";
			}
			System.out.println("DRAFT");
			queryStr +=" stinv IN (SELECT stinvstatus.stockInvoice FROM StockInvoiceStatus stinvstatus WHERE stinvstatus.status LIKE 'DRAFT') AND stinv NOT IN( SELECT stinvstatus.stockInvoice FROM StockInvoiceStatus stinvstatus WHERE stinvstatus.status LIKE 'RECEIVED') ";
		}

		if(status == StockInvoiceStatus.Type.RECEIVED){
			if(!queryStr.contains("WHERE")){
				queryStr +=" WHERE";
			}else{
				queryStr +=" AND";
			}
			System.out.println("RECEIVED");
			queryStr +=" stinv IN (SELECT stinvstatus.stockInvoice FROM StockInvoiceStatus stinvstatus WHERE stinvstatus.status LIKE 'RECEIVED') ";
		}


		Query query = session.createQuery(queryStr);
		System.out.println(query.getQueryString());
		
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
	
	public StockInvoice updateStockInvoice(StockInvoice stockInvoice) {
		DbSession session = this.getSession();
		
		String queryStr = " UPDATE StockInvoice st";
		
		if (stockInvoice.getInvoiceNumber() != null) {
			queryStr += " SET st.invoiceNumber = :invoiceNumber,";
		}
		
		if (stockInvoice.getSupplier() != null) {
			queryStr += " st.supplier = :supplier";
		}
		
		if (stockInvoice.getPurchaseOrder() != null) {
			queryStr += " SET st.purchaseOrder = :purchaseOrder";
		}
		
		queryStr += " WHERE uuid = :uuid";

		Query query = session.createQuery(queryStr);
		
		if (stockInvoice.getInvoiceNumber() != null) {
			query.setParameter("invoiceNumber", stockInvoice.getInvoiceNumber());
		}
		
		if (stockInvoice.getSupplier() != null) {
			query.setParameter("supplier", stockInvoice.getSupplier());
		}
		
		if (stockInvoice.getPurchaseOrder() != null) {
			query.setParameter("purchaseOrder", stockInvoice.getPurchaseOrder());
		}
		
		query.setParameter("uuid", stockInvoice.getUuid());
		
		Integer success = query.executeUpdate();
		
		if (success == 1) {
			return stockInvoice;
		} else {
			return null;
		}
	}
}
