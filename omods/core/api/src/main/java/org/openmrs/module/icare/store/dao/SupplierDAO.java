package org.openmrs.module.icare.store.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.store.models.Supplier;

import java.util.List;

public class SupplierDAO extends BaseDAO<Supplier> {
	
	public List<Supplier> getSuppliers(Integer startIndex, Integer limit) {
		
		DbSession dbSession = this.getSession();
		String queryStr = "SELECT sp FROM Supplier sp WHERE sp.voided = false";
		
		//Construct a query Object
		Query query = dbSession.createQuery(queryStr);
		
		query.setMaxResults(limit);
		query.setFirstResult(startIndex);
		return query.list();
		
	}
}
