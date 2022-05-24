package org.openmrs.module.icare.laboratory.dao;

// Generated Oct 7, 2020 12:49:21 PM by Hibernate Tools 5.2.10.Final

import org.hibernate.Query;
import org.openmrs.Visit;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.Sample;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * Home object for domain model class LbSample.
 * 
 * @see org.openmrs.module.icare.laboratory.models.Sample
 * @author Hibernate Tools
 */

public class SampleDAO extends BaseDAO<Sample> {
	
	public List<Sample> getSamplesByVisit(String id) {
		DbSession session = this.getSession();
		String queryStr = "SELECT sp \n" + "FROM Sample sp \n"
		        + "WHERE sp.visit = (SELECT v FROM Visit v WHERE v.uuid = :visitUuid)";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("visitUuid", id);
		
		return query.list();
	}
	
	public List<Sample> getSamplesByDates(Date startDate, Date endDate) {
		
		DbSession session = this.getSession();
		String queryStr = "SELECT sp \n" + "FROM Sample sp \n"
		        + "WHERE cast(sp.dateTime as date) BETWEEN :startDate AND :endDate \n"
		        + "OR cast(sp.dateCreated as date) BETWEEN :startDate AND :endDate";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("startDate", startDate);
		query.setParameter("endDate", endDate);
		
		return query.list();
		
	}
	
	public List<Visit> getPendingSampleCollectionVisits(Integer limit, Integer startIndex) {
		DbSession session = this.getSession();
		String queryStr = "SELECT distinct v FROM Visit v" + " INNER JOIN v.encounters e" + " INNER JOIN e.orders o"
		        + " INNER JOIN o.orderType ot" + " WHERE ot.javaClassName='org.openmrs.TestOrder' AND v NOT IN("
		        + "		SELECT v FROM Sample s" + "		INNER JOIN s.visit v" + ") AND v.stopDatetime IS NULL" + " ";
		
		Query query = session.createQuery(queryStr);
		query.setFirstResult(startIndex);
		query.setMaxResults(limit);
		
		return query.list();
	}

	public ListResult<Sample> getSamples(Date startDate, Date endDate, Pager pager, String locationUuid) {

		DbSession session = this.getSession();
		String queryStr = "SELECT sp \n" + "FROM Sample sp \n";

		if(startDate != null && endDate != null){
			if(!queryStr.contains("WHERE")){
				queryStr += " WHERE ";
			}
			queryStr += " cast(sp.dateTime as date) BETWEEN :startDate AND :endDate \n"
					+ "OR cast(sp.dateCreated as date) BETWEEN :startDate AND :endDate";
		}

		if(locationUuid != null){
			if(!queryStr.contains("WHERE")){
				queryStr += " WHERE ";
			}
			queryStr += " sp.visit.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)";
		}
		queryStr += " ORDER BY sp.dateCreated ";
		Query query = session.createQuery(queryStr);
		if(startDate != null && endDate != null){
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
		}
		if(locationUuid != null){
			query.setParameter("locationUuid", locationUuid);
		}
		if(pager.isAllowed()){
			pager.setTotal(query.list().size());
			//pager.setPageCount(pager.getT);
			query.setFirstResult((pager.getPage()-1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		ListResult<Sample> listResults = new ListResult();

		listResults.setPager(pager);
		listResults.setResults(query.list());

		//
		return listResults;
	}
}
