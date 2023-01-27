package org.openmrs.module.icare.store.dao;

// Generated Oct 7, 2020 12:49:21 PM by Hibernate Tools 5.2.10.Final

import org.hibernate.Query;
import org.openmrs.Location;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.store.models.Issue;
import org.openmrs.module.icare.store.models.Requisition;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Home object for domain model class StRequisition.
 * 
 * @see org.openmrs.module.icare.core.dao.StRequisition
 * @author Hibernate Tools
 */

public class RequisitionDAO extends BaseDAO<Requisition> {
	
	public List<Requisition> getRequisitionsByRequestingLocation(String requestingLocationUuid) {
		DbSession session = this.getSession();
		String queryStr = "SELECT rq \n" + "FROM Requisition rq \n"
		        + "WHERE rq.requestingLocation = (SELECT l FROM Location l WHERE l.uuid = :requestingLocationUuid)";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("requestingLocationUuid", requestingLocationUuid);
		
		return query.list();
	}
	
	public List<Requisition> getRequisitionsByRequestedLocation(String requestedLocationUuid) {
		DbSession session = this.getSession();
		String queryStr = "SELECT rq \n" + "FROM Requisition rq \n"
		        + "WHERE rq.requestedLocation = (SELECT l FROM Location l WHERE l.uuid = :requestedLocationUuid)";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("requestedLocationUuid", requestedLocationUuid);
		
		return query.list();
	}
	
}
