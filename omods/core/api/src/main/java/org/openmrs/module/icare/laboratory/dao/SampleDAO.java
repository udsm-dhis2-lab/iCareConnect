package org.openmrs.module.icare.laboratory.dao;

// Generated Oct 7, 2020 12:49:21 PM by Hibernate Tools 5.2.10.Final

import org.hibernate.Query;
import org.openmrs.Patient;
import org.openmrs.Person;
import org.openmrs.Visit;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.billing.models.Discount;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.*;
import org.springframework.stereotype.Repository;

import java.text.SimpleDateFormat;
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
	
	public ListResult<Sample> getSamples(Date startDate, Date endDate, Pager pager, String locationUuid,
	        String sampleCategory, String testCategory) {
		
		DbSession session = this.getSession();
		String queryStr = "SELECT sp \n" + "FROM Sample sp \n";
		
		if (startDate != null && endDate != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			}
			queryStr += " (cast(sp.dateTime as date) BETWEEN :startDate AND :endDate) \n"
			        + "OR (cast(sp.dateCreated as date) BETWEEN :startDate AND :endDate)";
		}
		
		if (locationUuid != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			}
			queryStr += " sp.visit.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)";
		}
		if (sampleCategory != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += "sp IN( SELECT sst.sample FROM SampleStatus sst WHERE sst.category=:sampleCategory)";
			
		}
		if (testCategory != null && testCategory != "Completed") {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += "sp IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testallocstatus.testAllocation FROM TestAllocationStatus testallocstatus WHERE testallocstatus.category=:testCategory))";
		}
		if (testCategory == "Completed") {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += "sp IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testresults.testAllocation FROM Result testresults))) ";
			
			//			queryStr+="LEFT JOIN TestAllocation testalloc ON testalloc.sampleOrder.id.sample = sp JOIN Result testresults ON testresults.testAllocation = testalloc GROUP BY sp HAVING COUNT(testalloc)=COUNT(testresults) ";
			
			//			queryStr +=" LEFT JOIN sp.testAllocations al LEFT JOIN al.testAllocationResults ar GROUP BY sp HAVING COUNT(al.id) = COUNT(ar.testAllocation)";
			
		}
		
		queryStr += " ORDER BY sp.dateCreated ";
		Query query = session.createQuery(queryStr);
		if (startDate != null && endDate != null) {
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
		}
		if (locationUuid != null) {
			query.setParameter("locationUuid", locationUuid);
		}
		
		if (sampleCategory != null) {
			query.setParameter("sampleCategory", sampleCategory);
		}
		if (testCategory != null && testCategory != "Completed") {
			query.setParameter("testCategory", testCategory);
		}
		
		if (pager.isAllowed()) {
			pager.setTotal(query.list().size());
			//pager.setPageCount(pager.getT);
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		
		ListResult<Sample> listResults = new ListResult();
		
		listResults.setPager(pager);
		listResults.setResults(query.list());
		
		//
		return listResults;
	}
	
	public List<Sample> getSamplesByVisitOrPatientAndOrDates(String visitId, String patient, Date startDate, Date endDate) {
		
		DbSession session = this.getSession();
		
		// General search query
		String queryStr = "SELECT sp FROM Sample sp";
		
		//If visit is provided, use visit instead
		if (visitId != null && visitId.length() > 0) {
			queryStr = "SELECT sp \n" + "FROM Sample sp \n"
			        + "WHERE sp.visit = (SELECT v FROM Visit v WHERE v.uuid = :visitUuid)";
		}
		
		//if no visit is provided but patient is provided
		if ((visitId == null || visitId.equals("")) && patient != null) {
			queryStr += " LEFT JOIN sp.visit v LEFT JOIN v.patient pnt WHERE pnt.uuid=:patientUuid";
		}
		
		// if visit / patient is provided
		if (visitId != null || patient != null) {
			//if start date only is provided
			if (startDate != null && endDate == null) {
				queryStr += " AND sp.dateCreated >= :startDate";
			}
			
			//if both dates are provided
			if (startDate != null && endDate != null) {
				queryStr += " AND sp.dateCreated >= :startDate AND sp.dateCreated <= :endDate";
			}
		}
		
		// Append with dates if provided but no patient/visit number
		
		if ((visitId == null || visitId.equals(""))) {
			if (patient == null || patient.equals("")) {
				//if start date only is provided
				if (startDate != null && endDate == null) {
					queryStr += " WHERE sp.dateCreated >= :startDate";
				}
				//if both dates are provided
				if (startDate != null && endDate != null) {
					queryStr += " WHERE sp.dateCreated >= :startDate AND sp.dateCreated <= :endDate";
				}
			}
		}
		
		//Construct a query object
		Query query = session.createQuery(queryStr);
		
		//Attach arguments accordingly
		if (startDate != null) {
			query.setParameter("startDate", startDate);
		}
		if (endDate != null && startDate != null) {
			query.setParameter("endDate", endDate);
		}
		
		if (visitId != null && visitId.length() > 0) {
			query.setParameter("visitUuid", visitId);
		}
		
		if ((visitId == null || visitId.length() < 1) && patient != null) {
			query.setParameter("patientUuid", patient);
		}
		
		return query.list();
	}
	
	public WorkloadSummary getWorkloadSummary(Date startDate, Date endDate) {
		
		WorkloadSummary workloadSummary = new WorkloadSummary();
		
		DbSession session = getSession();
		
		if (startDate != null && endDate != null) {
			
			String queryStr = "SELECT COUNT(sample) FROM Sample sample WHERE sample IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testallocstatus.testAllocation FROM TestAllocationStatus testallocstatus WHERE testallocstatus.status='REJECTED')) AND (sample.dateCreated BETWEEN :startDate AND :endDate)";
			Query query = session.createQuery(queryStr);
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
			workloadSummary.setSamplesWithRejectedResults((long) query.list().get(0));
			
			queryStr = "SELECT COUNT(sample) FROM Sample sample WHERE sample IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testallocstatus.testAllocation FROM TestAllocationStatus testallocstatus WHERE testallocstatus.status='APPROVED' ) ) AND (sample.dateCreated BETWEEN :startDate AND :endDate) ";
			query = session.createQuery(queryStr);
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
			workloadSummary.setSamplesAuthorized((long) query.list().get(0));
			
			queryStr = "SELECT COUNT(sample) FROM Sample sample WHERE sample IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testresult.testAllocation FROM Result testresult) ) AND (sample.dateCreated BETWEEN :startDate AND :endDate) ";
			query = session.createQuery(queryStr);
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
			workloadSummary.setSamplesWithResults((long) query.list().get(0));
			
			queryStr = "SELECT COUNT(sample) FROM Sample sample WHERE sample IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc NOT IN (SELECT testresult.testAllocation FROM Result testresult) ) AND (sample.dateCreated BETWEEN :startDate AND :endDate) ";
			query = session.createQuery(queryStr);
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
			workloadSummary.setSamplesWithNoResults((long) query.list().get(0));
			
		} else {
			
			String queryStr = "SELECT COUNT(sample) FROM Sample sample WHERE sample IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testallocstatus.testAllocation FROM TestAllocationStatus testallocstatus WHERE testallocstatus.status='REJECTED')) ";
			Query query = session.createQuery(queryStr);
			workloadSummary.setSamplesWithRejectedResults((long) query.list().get(0));
			
			queryStr = "SELECT COUNT(sample) FROM Sample sample WHERE sample IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testallocstatus.testAllocation FROM TestAllocationStatus testallocstatus WHERE testallocstatus.status='APPROVED' )) ";
			query = session.createQuery(queryStr);
			workloadSummary.setSamplesAuthorized((long) query.list().get(0));
			
			queryStr = "SELECT COUNT(sample) FROM Sample sample WHERE sample IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testresult.testAllocation FROM Result testresult) ) ";
			query = session.createQuery(queryStr);
			workloadSummary.setSamplesWithResults((long) query.list().get(0));
			
			queryStr = "SELECT COUNT(sample) FROM Sample sample WHERE sample IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc NOT IN (SELECT testresult.testAllocation FROM Result testresult) )  ";
			query = session.createQuery(queryStr);
			workloadSummary.setSamplesWithNoResults((long) query.list().get(0));
			
		}
		
		return workloadSummary;
		
	}
	
}
