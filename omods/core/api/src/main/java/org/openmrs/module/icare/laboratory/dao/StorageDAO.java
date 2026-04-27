package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.Storage;

public class StorageDAO extends BaseDAO<Storage> {
	
	public ListResult<Storage> getStorages(Pager pager, String q, String storageTypeUuid) {
		DbSession session = this.getSession();
		String queryStr = "SELECT s FROM Storage s LEFT JOIN s.storageType st WHERE (s.voided = false OR s.voided IS NULL)"
		        + " AND (st.voided = false OR st.voided IS NULL)";
		if (storageTypeUuid != null && !storageTypeUuid.trim().equals("")) {
			queryStr += " AND st.uuid = :storageTypeUuid";
		}
		if (q != null && !q.trim().equals("")) {
			queryStr += " AND (lower(s.name) like lower(:q) OR lower(st.name) like lower(:q))";
		}
		queryStr += " ORDER BY s.name ASC";
		Query query = session.createQuery(queryStr);
		if (storageTypeUuid != null && !storageTypeUuid.trim().equals("")) {
			query.setParameter("storageTypeUuid", storageTypeUuid);
		}
		if (q != null && !q.trim().equals("")) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}
		if (pager != null && pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		ListResult<Storage> listResults = new ListResult<Storage>();
		listResults.setPager(pager);
		listResults.setResults(query.list());
		return listResults;
	}
}
