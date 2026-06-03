package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.StorageLocation;

public class StorageLocationDAO extends BaseDAO<StorageLocation> {
	
	public ListResult<StorageLocation> getStorageLocations(Pager pager, String q, String parentUuid, String typeUuid,
	        Boolean slotOnly) {
		DbSession session = this.getSession();
		String queryStr = "SELECT l FROM StorageLocation l LEFT JOIN l.locationType lt LEFT JOIN l.parentLocation p "
		        + "WHERE (l.voided = false OR l.voided is null)";
		if (parentUuid != null && !parentUuid.trim().equals("")) {
			queryStr += " AND p.uuid = :parentUuid";
		}
		if (typeUuid != null && !typeUuid.trim().equals("")) {
			queryStr += " AND lt.uuid = :typeUuid";
		}
		if (slotOnly != null && slotOnly.booleanValue()) {
			queryStr += " AND l.slot = true";
		}
		if (q != null && !q.trim().equals("")) {
			queryStr += " AND (lower(l.name) like lower(:q) OR lower(l.code) like lower(:q) OR lower(l.pathLabel) like lower(:q))";
		}
		queryStr += " ORDER BY coalesce(l.pathDepth, 9999) ASC, l.name ASC";
		
		Query query = session.createQuery(queryStr);
		if (parentUuid != null && !parentUuid.trim().equals("")) {
			query.setParameter("parentUuid", parentUuid);
		}
		if (typeUuid != null && !typeUuid.trim().equals("")) {
			query.setParameter("typeUuid", typeUuid);
		}
		if (q != null && !q.trim().equals("")) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}
		if (pager != null && pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		
		ListResult<StorageLocation> results = new ListResult<StorageLocation>();
		results.setPager(pager);
		results.setResults(query.list());
		return results;
	}
}
