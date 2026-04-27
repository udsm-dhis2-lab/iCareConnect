package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.StorageType;

public class StorageTypeDAO extends BaseDAO<StorageType> {
	
	public ListResult<StorageType> getStorageTypes(Pager pager, String q) {
		DbSession session = this.getSession();
		String queryStr = "SELECT st FROM StorageType st WHERE (st.voided = false OR st.voided IS NULL)";
		if (q != null && !q.trim().equals("")) {
			queryStr += " AND lower(st.name) like lower(:q)";
		}
		queryStr += " ORDER BY st.name ASC";
		Query query = session.createQuery(queryStr);
		if (q != null && !q.trim().equals("")) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}
		if (pager != null && pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		ListResult<StorageType> listResults = new ListResult<StorageType>();
		listResults.setPager(pager);
		listResults.setResults(query.list());
		return listResults;
	}
}
