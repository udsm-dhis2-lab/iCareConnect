package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.StorageLocationType;

public class StorageLocationTypeDAO extends BaseDAO<StorageLocationType> {
	
	public ListResult<StorageLocationType> getStorageLocationTypes(Pager pager, String q) {
		DbSession session = this.getSession();
		String queryStr = "SELECT t FROM StorageLocationType t WHERE (t.voided = false OR t.voided is null)";
		if (q != null && !q.trim().equals("")) {
			queryStr += " AND (lower(t.name) like lower(:q) OR lower(t.code) like lower(:q))";
		}
		queryStr += " ORDER BY coalesce(t.levelOrder, 9999) ASC, t.name ASC";
		Query query = session.createQuery(queryStr);
		if (q != null && !q.trim().equals("")) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}
		if (pager != null && pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		ListResult<StorageLocationType> results = new ListResult<StorageLocationType>();
		results.setPager(pager);
		results.setResults(query.list());
		return results;
	}
}
