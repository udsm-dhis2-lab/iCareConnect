package org.openmrs.module.icare.store.dao;

import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.store.models.StockInvoiceItem;
import org.hibernate.Query;
import org.openmrs.module.icare.store.models.StockInvoiceItemStatus;

public class StockInvoiceItemDAO extends BaseDAO<StockInvoiceItem> {
	
	public StockInvoiceItem updateStockInvoiceItem(StockInvoiceItem stockInvoiceItem) {
		
		DbSession session = this.getSession();
		
		String queryStr = " UPDATE StockInvoiceItem sti";
		
		if (stockInvoiceItem.getItem() != null) {
			queryStr += " SET sti.item = :item";
		}
		
		if (stockInvoiceItem.getAmount() != null) {
			if (!queryStr.contains("SET")) {
				queryStr += " SET ";
			} else {
				queryStr += " ,";
			}
			queryStr += "  sti.amount = :amount";
		}
		
		if (stockInvoiceItem.getLocation() != null) {
			if (!queryStr.contains("SET")) {
				queryStr += " SET ";
			} else {
				queryStr += " ,";
			}
			queryStr += "  sti.location = :location";
		}
		
		if (stockInvoiceItem.getBatchNo() != null) {
			if (!queryStr.contains("SET")) {
				queryStr += " SET ";
			} else {
				queryStr += " ,";
			}
			queryStr += " sti.batchNo = :batchNo";
		}
		
		if (stockInvoiceItem.getBatchQuantity() != null) {
			if (!queryStr.contains("SET")) {
				queryStr += " SET ";
			} else {
				queryStr += " ,";
			}
			queryStr += " sti.batchQuantity = :batchQuantity";
		}
		
		if (stockInvoiceItem.getOrderQuantity() != null) {
			if (!queryStr.contains("SET")) {
				queryStr += " SET ";
			} else {
				queryStr += " ,";
			}
			queryStr += " sti.orderQuantity = :orderQuantity";
		}
		
		if (stockInvoiceItem.getUnitPrice() != null) {
			if (!queryStr.contains("SET")) {
				queryStr += " SET ";
			} else {
				queryStr += " ,";
			}
			queryStr += " sti.unitPrice = :unitPrice";
		}
		
		if (stockInvoiceItem.getExpiryDate() != null) {
			if (!queryStr.contains("SET")) {
				queryStr += " SET ";
			} else {
				queryStr += " ,";
			}
			queryStr += " sti.expiryDate = :expiryDate";
		}
		
		if (stockInvoiceItem.getVoided() != null) {
			if (!queryStr.contains("SET")) {
				queryStr += " SET ";
			} else {
				queryStr += " ,";
			}
			queryStr += " sti.voided = :voided";
		}
		
		queryStr += " WHERE uuid = :uuid";
		
		Query query = session.createQuery(queryStr);
		
		if (stockInvoiceItem.getItem() != null) {
			query.setParameter("item", stockInvoiceItem.getItem());
		}
		
		if (stockInvoiceItem.getAmount() != null) {
			query.setParameter("amount", stockInvoiceItem.getAmount());
		}
		
		if (stockInvoiceItem.getBatchNo() != null) {
			query.setParameter("batchNo", stockInvoiceItem.getBatchNo());
		}
		
		if (stockInvoiceItem.getBatchQuantity() != null) {
			query.setParameter("batchQuantity", stockInvoiceItem.getBatchQuantity());
		}
		
		if (stockInvoiceItem.getOrderQuantity() != null) {
			query.setParameter("orderQuantity", stockInvoiceItem.getOrderQuantity());
		}
		
		if (stockInvoiceItem.getUnitPrice() != null) {
			query.setParameter("unitPrice", stockInvoiceItem.getUnitPrice());
		}
		
		if (stockInvoiceItem.getExpiryDate() != null) {
			query.setParameter("expiryDate", stockInvoiceItem.getExpiryDate());
		}
		
		if (stockInvoiceItem.getLocation() != null) {
			query.setParameter("location", stockInvoiceItem.getLocation());
		}
		if (stockInvoiceItem.getVoided() != null) {
			query.setParameter("voided", stockInvoiceItem.getVoided());
		}
		
		query.setParameter("uuid", stockInvoiceItem.getUuid());
		
		Integer success = query.executeUpdate();
		
		if (success == 1) {
			return stockInvoiceItem;
		} else {
			return null;
		}
	}
}
