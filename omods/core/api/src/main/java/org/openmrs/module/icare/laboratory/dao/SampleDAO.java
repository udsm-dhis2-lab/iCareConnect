package org.openmrs.module.icare.laboratory.dao;

// Generated Oct 7, 2020 12:49:21 PM by Hibernate Tools 5.2.10.Final

import org.apache.commons.lang.StringUtils;
import org.hibernate.Query;
import org.openmrs.Order;
import org.openmrs.Visit;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.*;
import org.springframework.beans.BeanUtils;

import javax.persistence.TemporalType;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Home object for domain model class LbSample.
 * 
 * @see org.openmrs.module.icare.laboratory.models.Sample
 * @author Hibernate Tools
 */

public class SampleDAO extends BaseDAO<Sample> {
	
	// TODO: Add also support to get samples by day and month
	public long getNumberOfRegisteredSamplesThisYear() {
		DbSession session = this.getSession();
		String queryStr = "SELECT COUNT(sp) FROM Sample sp \n" + "WHERE YEAR(sp.dateTime) = :year";
		Calendar calendar = Calendar.getInstance();
		Query query = session.createQuery(queryStr);
		query.setParameter("year", calendar.get(Calendar.YEAR));
		return (long) query.list().get(0);
	}
	
	public List<Sample> getSamplesByVisit(String id) {
		DbSession session = this.getSession();
		String queryStr = "SELECT sp \n" + "FROM Sample sp \n"
		        + "WHERE sp.visit = (SELECT v FROM Visit v WHERE v.uuid = :visitUuid)";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("visitUuid", id);
		
		return query.list();
	}
	
	//	public Sample getSamplesById(String id) {
	//		DbSession session = this.getSession();
	//		String queryStr = "SELECT sample FROM Sample sample WHERE sp.label = :label";
	//		Query query = session.createQuery(queryStr);
	//		query.setParameter("label", id);
	//		if (!query.list().isEmpty()) {
	//			return (Sample) query.list().get(0);
	//		} else {
	//			return new Sample();
	//		}
	//	}
	
	//	public Sample getSamplesById(String id) {
	//		if (id == null || id.trim().equals("")) {
	//			return null;
	//		}
	//
	//		DbSession session = this.getSession();
	//
	//		String queryStr = "SELECT sp FROM Sample sp " + "WHERE sp.label = :label " + "AND sp.voided = false";
	//
	//		Query query = session.createQuery(queryStr);
	//		query.setParameter("label", id.trim());
	//		query.setMaxResults(1);
	//
	//		List<Sample> samples = query.list();
	//		return samples.isEmpty() ? null : samples.get(0);
	//	}
	
	public Sample getSamplesById(String id) {
		if (id == null || id.trim().equals("")) {
			return null;
		}
		
		DbSession session = this.getSession();
		
		String queryStr = "SELECT sp FROM Sample sp " + "WHERE sp.label = :label "
		        + "AND (sp.voided IS NULL OR sp.voided = false) " + "ORDER BY sp.dateCreated DESC";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("label", id.trim());
		
		/*
		 * Load only two rows so that we can detect duplicate active labels.
		 * If two rows are returned, it is unsafe to silently choose one.
		 */
		query.setMaxResults(2);
		
		List<Sample> samples = query.list();
		
		if (samples.isEmpty()) {
			return null;
		}
		
		if (samples.size() > 1) {
			throw new IllegalStateException("Multiple active samples found with label '" + id.trim() + "'");
		}
		
		return samples.get(0);
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
			String sampleCategory, String testCategory, String q, String hasStatus, String acceptedByUuid,
			String testConceptUuid, String departmentUuid, String specimenSourceUuid, String instrumentUuid,
			String visitUuid, String excludeStatus) {

		DbSession session = this.getSession();

		String queryStr = "SELECT sp \n" + "FROM Sample sp ";
		// if (sampleCategory != null) {
		// queryStr += " JOIN sp.sampleStatuses ss ";
		// }

		if (testConceptUuid != null) {
			queryStr += " JOIN sp.sampleOrders sos LEFT JOIN sos.id.order o LEFT JOIN o.concept concept ";
			if (q != null) {
			} else {
				queryStr += "WHERE concept.uuid =:testConceptUuid ";
			}
		}

		if (q != null) {
			queryStr += " JOIN sp.visit v LEFT JOIN v.patient p LEFT JOIN p.names pname LEFT JOIN p.identifiers pi LEFT JOIN v.attributes va";

			if (testConceptUuid != null) {
				queryStr += " WHERE concept.uuid =:testConceptUuid ";
			}

			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}

			queryStr += " (lower(sp.label) like lower(:q) OR (lower(concat(pname.givenName,pname.middleName,pname.familyName)) LIKE lower(:q) OR lower(pname.givenName) LIKE lower(:q) OR lower(pname.middleName) LIKE lower(:q) OR lower(pname.familyName) LIKE lower(:q) OR lower(concat(pname.givenName,'',pname.familyName)) LIKE lower(:q) OR lower(concat(pname.givenName,'',pname.middleName)) LIKE lower(:q) OR lower(concat(pname.middleName,'',pname.familyName)) LIKE lower(:q)  OR pi.identifier LIKE :q OR lower(va.valueReference) LIKE lower(:q))) ";
		}

		if (startDate != null && endDate != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " ((cast(sp.dateTime as date) BETWEEN :startDate AND :endDate) "
					+ "OR (cast(sp.dateCreated as date) BETWEEN :startDate AND :endDate)) ";
		}

		if (departmentUuid != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " sp.concept.uuid =:departmentUuid";
		}

		if (specimenSourceUuid != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " sp.specimenSource.uuid =:specimenSourceUuid ";
		}

		if (locationUuid != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " sp.visit.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid) ";
		}
		if (sampleCategory != null) {
			if (sampleCategory.toLowerCase().equals("not accepted")) {
				if (!queryStr.contains("WHERE")) {
					queryStr += " WHERE ";
				} else {
					queryStr += " AND ";
				}
				queryStr += " sp NOT IN (SELECT DISTINCT sst.sample FROM SampleStatus sst WHERE (sst.category='ACCEPTED'  OR  lower(sst.category) LIKE 'reject%'))  ";

			} else if (sampleCategory.toLowerCase().equals("no results")) {
				if (!queryStr.contains("WHERE")) {
					queryStr += " WHERE ";
				} else {
					queryStr += " AND ";
				}
				queryStr += " sp NOT IN (SELECT DISTINCT sst.sample FROM SampleStatus sst WHERE (sst.category='HAS_RESULTS'  OR  lower(sst.category) LIKE 'reject%'))   AND sp IN (SELECT DISTINCT sst.sample FROM SampleStatus sst WHERE (sst.category='ACCEPTED')) ";

			} else if (sampleCategory.toLowerCase().equals("rejected")) {
				if (!queryStr.contains("WHERE")) {
					queryStr += " WHERE ";
				} else {
					queryStr += " AND ";
				}
				queryStr += "sp IN( SELECT sst.sample FROM SampleStatus sst WHERE lower(sst.category) LIKE 'reject%') ";
			} else {

				if (!queryStr.contains("WHERE")) {
					queryStr += " WHERE ";
				} else {
					queryStr += " AND ";
				}
				queryStr += " sp IN( SELECT sst.sample FROM SampleStatus sst WHERE sst.category=:sampleCategory) ";

			}

		}

		if (instrumentUuid != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " sp IN (SELECT DISTINCT sst.sample FROM SampleStatus sst WHERE (sst.category='HAS_RESULTS' AND sst.sample IN (SELECT testAllocation.sampleOrder.id.sample FROM TestAllocation testAllocation WHERE testAllocation IN (SELECT res.testAllocation FROM Result res WHERE res.instrument=(SELECT instrument FROM Concept instrument WHERE instrument.uuid =:instrumentUuid))))) ";
		}

		if (testCategory != null && testCategory.toLowerCase() != "completed") {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " sp IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testallocstatus.testAllocation FROM TestAllocationStatus testallocstatus WHERE testallocstatus.category=:testCategory)) ";
		}

		if (testCategory != null && testCategory.toLowerCase().equals("completed")) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " sp IN(SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testresults.testAllocation FROM Result testresults))) ";

		}

		if (hasStatus != null) {
			if (hasStatus.toLowerCase().equals("no")) {

				if (!queryStr.contains("WHERE")) {
					queryStr += " WHERE ";
				} else {
					queryStr += " AND ";
				}
				queryStr += " sp NOT IN( SELECT samplestatus.sample FROM SampleStatus samplestatus) ";

			}
			if (hasStatus.toLowerCase().equals("yes")) {

				if (!queryStr.contains("WHERE")) {
					queryStr += " WHERE ";
				} else {
					queryStr += " AND ";
				}
				if (acceptedByUuid == null) {
					queryStr += " sp IN( SELECT samplestatus.sample FROM SampleStatus samplestatus) ";

				}
				if (acceptedByUuid != null) {
					queryStr += " sp IN ( SELECT samplestatus.sample FROM SampleStatus samplestatus WHERE samplestatus.user IN( SELECT usr FROM User usr WHERE uuid = :acceptedByUuid)) ";

				}

			}
		}

		if (visitUuid != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " sp.visit = (SELECT v FROM Visit v WHERE v.uuid = :visitUuid) ";

		}

		if (excludeStatus != null) {

			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}

			queryStr += " sp NOT IN( SELECT sst.sample FROM SampleStatus sst WHERE sst.category IN(:statuses))) ";

		}

		queryStr += " ORDER BY sp.dateCreated DESC ";
		// if (sampleCategory != null) {
		// queryStr += ",ss.timestamp DESC";
		// }
		Query query = session.createQuery(queryStr);
		if (startDate != null && endDate != null) {
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
		}

		if (locationUuid != null) {
			query.setParameter("locationUuid", locationUuid);
		}

		if (sampleCategory != null && !sampleCategory.toLowerCase().equals("not accepted")
				&& !sampleCategory.toLowerCase().equals("no results")
				&& !sampleCategory.toLowerCase().equals("rejected")) {
			query.setParameter("sampleCategory", sampleCategory);
		}

		// if (sampleCategory.toLowerCase().equals("rejected")) {
		// query.setParameter("sampleCategory", sampleCategory);
		// }

		if (q != null) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}

		if (departmentUuid != null) {
			query.setParameter("departmentUuid", departmentUuid);
		}

		if (specimenSourceUuid != null) {
			query.setParameter("specimenSourceUuid", specimenSourceUuid);
		}

		if (testCategory != null && testCategory.toLowerCase() != "completed") {
			query.setParameter("testCategory", testCategory);
		}
		if (acceptedByUuid != null && hasStatus.toLowerCase().equals("yes")) {
			query.setParameter("acceptedByUuid", acceptedByUuid);
		}

		if (testConceptUuid != null) {
			query.setParameter("testConceptUuid", testConceptUuid);
		}

		if (instrumentUuid != null) {
			query.setParameter("instrumentUuid", instrumentUuid);
		}
		if (visitUuid != null) {
			query.setParameter("visitUuid", visitUuid);
		}

		if (excludeStatus != null) {
			Pattern pattern = Pattern.compile("List:\\[(.*?)\\]");
			Matcher matcher = pattern.matcher(excludeStatus);
			String excludedValue;
			if (matcher.find()) {
				excludedValue = matcher.group(1);
			} else {
				excludedValue = excludeStatus;
			}

			String[] valuesArray = excludedValue.split(",");
			List<String> valueList = new ArrayList<>(Arrays.asList(valuesArray));
			query.setParameterList("statuses", valueList);
		}

		if (pager.isAllowed()) {
			pager.setTotal(query.list().size());
			// pager.setPageCount(pager.getT);
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		ListResult<Sample> listResults = new ListResult();
		listResults.setPager(pager);
		listResults.setResults(query.list());
		return listResults;
	}
	
	//	public ListResult<Sample> getSamplesByOrderType(Date startDate, Date endDate, Pager pager, String orderTypeUuid,
	//	        Boolean haveThisOrderType, String q) {
	//
	//		DbSession session = this.getSession();
	//
	//		String hqlBase = " FROM Sample s ";
	//
	//		if (haveThisOrderType != null && haveThisOrderType && orderTypeUuid != null) {
	//			hqlBase += " JOIN s.sampleOrders so JOIN so.order o JOIN o.orderType ot ";
	//		}
	//
	//		String whereClause = "";
	//		boolean hasWhere = false;
	//
	//		if (orderTypeUuid != null) {
	//			if (haveThisOrderType != null && haveThisOrderType) {
	//				whereClause += " WHERE ot.uuid = :orderTypeUuid ";
	//				hasWhere = true;
	//			} else {
	//				whereClause += " WHERE s.id NOT IN (SELECT s2.id FROM Sample s2 JOIN s2.sampleOrders so2 JOIN so2.order o2 JOIN o2.orderType ot2 WHERE ot2.uuid = :orderTypeUuid) ";
	//				hasWhere = true;
	//			}
	//		}
	//
	//		if (q != null && !q.isEmpty()) {
	//			whereClause += (hasWhere ? " AND " : " WHERE ");
	//			whereClause += " s.label LIKE :q ";
	//			hasWhere = true;
	//		}
	//
	//		if (startDate != null && endDate != null) {
	//			whereClause += (hasWhere ? " AND " : " WHERE ");
	//			whereClause += " s.dateCreated >= :startDate AND s.dateCreated <= :endDate ";
	//			hasWhere = true;
	//		}
	//
	//		String countHql = "SELECT count(DISTINCT s.id) " + hqlBase + whereClause;
	//		Query countQuery = session.createQuery(countHql);
	//		setParameters(countQuery, orderTypeUuid, q, startDate, endDate);
	//
	//		Long totalCount = (Long) countQuery.uniqueResult();
	//
	//		String dataHql = "SELECT s " + hqlBase + whereClause + " GROUP BY s.id ORDER BY s.dateCreated DESC";
	//		Query query = session.createQuery(dataHql);
	//		setParameters(query, orderTypeUuid, q, startDate, endDate);
	//
	//		ListResult<Sample> listResults = new ListResult<Sample>();
	//		if (pager != null && pager.isAllowed()) {
	//			pager.setTotal(totalCount.intValue());
	//			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
	//			query.setMaxResults(pager.getPageSize());
	//			listResults.setPager(pager);
	//		}
	//
	//		listResults.setResults(query.list());
	//		return listResults;
	//	}
	
	//	private void setParameters(Query query, String orderTypeUuid, String q, Date startDate, Date endDate) {
	//		if (orderTypeUuid != null) {
	//			query.setParameter("orderTypeUuid", orderTypeUuid);
	//		}
	//		if (q != null && !q.isEmpty()) {
	//			query.setParameter("q", "%" + q + "%");
	//		}
	//		if (startDate != null && endDate != null) {
	//			query.setParameter("startDate", startDate);
	//			query.setParameter("endDate", endDate);
	//		}
	//	}
	
	public ListResult<Sample> getSamplesByOrderType(Date startDate, Date endDate, Pager pager, String orderTypeUuid,
	        Boolean haveThisOrderType, String q, String fulfillerStatus, String formUuid, Boolean haveThisForm,
	        Boolean combineWithOr) {
		
		DbSession session = this.getSession();
		
		ListResult<Sample> listResults = new ListResult<Sample>();
		listResults.setResults(new ArrayList<Sample>());
		listResults.setPager(pager);
		
		if (endDate != null) {
			Calendar cal = Calendar.getInstance();
			cal.setTime(endDate);
			cal.set(Calendar.HOUR_OF_DAY, 23);
			cal.set(Calendar.MINUTE, 59);
			cal.set(Calendar.SECOND, 59);
			endDate = cal.getTime();
		}
		
		String hqlJoins = " FROM Sample s " + " JOIN s.sampleOrders so " + " JOIN so.order o ";
		
		if (orderTypeUuid != null && !orderTypeUuid.isEmpty()) {
			hqlJoins += " LEFT JOIN o.orderType ot ";
		}
		if (formUuid != null && !formUuid.isEmpty()) {
			hqlJoins += " LEFT JOIN o.encounter e LEFT JOIN e.form f ";
		}
		
		String whereClause = " WHERE o.voided = false ";
		
		String orderTypeCondition = "";
		String formCondition = "";
		
		if (orderTypeUuid != null && !orderTypeUuid.isEmpty()) {
			orderTypeCondition = haveThisOrderType != null && haveThisOrderType ? "ot.uuid = :orderTypeUuid"
			        : "s.id NOT IN (SELECT so2.sample.id FROM SampleOrder so2 WHERE so2.order.orderType.uuid = :orderTypeUuid AND so2.order.voided = false)";
		}
		
		if (formUuid != null && !formUuid.isEmpty()) {
			formCondition = haveThisForm != null && haveThisForm ? "f.uuid = :formUuid"
			        : "s.id NOT IN (SELECT so3.sample.id FROM SampleOrder so3 WHERE so3.order.encounter.form.uuid = :formUuid AND so3.order.voided = false)";
		}
		
		boolean useOr = combineWithOr != null && combineWithOr;
		
		if (!orderTypeCondition.isEmpty() && !formCondition.isEmpty()) {
			whereClause += useOr ? " AND (" + orderTypeCondition + " OR " + formCondition + ")" : " AND "
			        + orderTypeCondition + " AND " + formCondition;
		} else if (!orderTypeCondition.isEmpty()) {
			whereClause += " AND " + orderTypeCondition;
		} else if (!formCondition.isEmpty()) {
			whereClause += " AND " + formCondition;
		}
		
		if (fulfillerStatus != null && !fulfillerStatus.isEmpty()) {
			whereClause += " AND o.fulfillerStatus = :fulfillerStatus ";
		}
		
		if (q != null && !q.isEmpty()) {
			whereClause += " AND s.label LIKE :q ";
		}
		
		if (startDate != null && endDate != null) {
			whereClause += " AND o.dateCreated >= :startDate AND o.dateCreated <= :endDate ";
		}
		
		String countHql = "SELECT count(DISTINCT s.id) " + hqlJoins + whereClause;
		Query countQuery = session.createQuery(countHql);
		this.setExtendedParameters(countQuery, orderTypeUuid, q, startDate, endDate, fulfillerStatus, formUuid);
		Long totalCount = (Long) countQuery.uniqueResult();
		
		if (totalCount == null || totalCount == 0) {
			if (pager != null)
				pager.setTotal(0);
			return listResults;
		}
		
		String idHql = "SELECT s.id " + hqlJoins + whereClause + " GROUP BY s.id "
		        + " ORDER BY MIN(CASE WHEN o.urgency = :statUrgency THEN 0 ELSE 1 END) ASC, MAX(o.dateCreated) DESC";
		
		Query idQuery = session.createQuery(idHql);
		this.setExtendedParameters(idQuery, orderTypeUuid, q, startDate, endDate, fulfillerStatus, formUuid);
		idQuery.setParameter("statUrgency", org.openmrs.Order.Urgency.STAT);
		
		if (pager != null && pager.isAllowed()) {
			pager.setTotal(totalCount.intValue());
			idQuery.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			idQuery.setMaxResults(pager.getPageSize());
		}
		
		List<Integer> ids = idQuery.list();
		if (ids == null || ids.isEmpty())
			return listResults;
		
		String dataHql = "SELECT DISTINCT s FROM Sample s " + " JOIN FETCH s.sampleOrders so " + " JOIN FETCH so.order o "
		        + " JOIN FETCH o.orderType ot " + " LEFT JOIN FETCH o.encounter e " + " LEFT JOIN FETCH e.form f "
		        + " WHERE s.id IN (:ids) "
		        + " ORDER BY CASE WHEN o.urgency = :statUrgency THEN 0 ELSE 1 END ASC, o.dateCreated DESC";
		
		Query dataQuery = session.createQuery(dataHql);
		dataQuery.setParameterList("ids", ids);
		dataQuery.setParameter("statUrgency", org.openmrs.Order.Urgency.STAT);
		
		listResults.setResults(dataQuery.list());
		return listResults;
	}
	
	private void setExtendedParameters(Query query, String orderTypeUuid, String q, Date startDate, Date endDate,
	        String fulfillerStatus, String formUuid) {
		if (orderTypeUuid != null) {
			query.setParameter("orderTypeUuid", orderTypeUuid);
		}
		if (fulfillerStatus != null && !fulfillerStatus.isEmpty()) {
			try {
				query.setParameter("fulfillerStatus", Order.FulfillerStatus.valueOf(fulfillerStatus));
			}
			catch (IllegalArgumentException ignored) {}
		}
		if (formUuid != null && !formUuid.isEmpty()) {
			query.setParameter("formUuid", formUuid);
		}
		if (q != null && !q.isEmpty()) {
			query.setParameter("q", "%" + q + "%");
		}
		if (startDate != null && endDate != null) {
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
		}
	}
	
	public List<Sample> getSamplesByVisitOrPatientAndOrDates(String visitId, String patient, Date startDate, Date endDate) {
		
		DbSession session = this.getSession();
		
		// General search query
		String queryStr = "SELECT sp FROM Sample sp";
		
		// If visit is provided, use visit instead
		if (visitId != null && visitId.length() > 0) {
			queryStr = "SELECT sp \n" + "FROM Sample sp \n"
			        + "WHERE sp.visit = (SELECT v FROM Visit v WHERE v.uuid = :visitUuid)";
		}
		
		// if no visit is provided but patient is provided
		if ((visitId == null || visitId.equals("")) && patient != null) {
			queryStr += " LEFT JOIN sp.visit v LEFT JOIN v.patient pnt WHERE pnt.uuid=:patientUuid ";
		}
		
		// if visit / patient is provided
		if (visitId != null || patient != null) {
			if (startDate != null && endDate == null) {
				queryStr += " AND sp.dateCreated >= :startDate";
			}
			
			// if both dates are provided
			if (startDate != null && endDate != null) {
				queryStr += " AND sp.dateCreated >= :startDate AND sp.dateCreated <= :endDate";
			}
		}
		
		// Append with dates if provided but no patient/visit number
		
		if ((visitId == null || visitId.equals(""))) {
			if (patient == null || patient.equals("")) {
				// if start date only is provided
				if (startDate != null && endDate == null) {
					queryStr += " WHERE sp.dateCreated >= :startDate";
				}
				// if both dates are provided
				if (startDate != null && endDate != null) {
					queryStr += " WHERE sp.dateCreated >= :startDate AND sp.dateCreated <= :endDate";
				}
			}
		}
		
		// Construct a query object
		Query query = session.createQuery(queryStr);
		
		// Attach arguments accordingly
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
	
	public ListResult<SampleExt> getSamplesWithoutAllocations(Date startDate, Date endDate, Pager pager,
	        String locationUuid, String sampleCategory, String testCategory, String q, String hasStatus,
	        String acceptedByUuid, String testConceptUuid, String departmentUuid, String specimenSourceUuid,
	        String instrumentUuid, String visitUuid, String excludeStatus) {
		
		DbSession session = this.getSession();
		
		String queryStr = "SELECT sp FROM Sample sp ";
		queryStr += " LEFT JOIN sp.sampleOrders sos LEFT JOIN sos.order o ";
		
		if (testConceptUuid != null) {
			queryStr += " JOIN o.concept orderConcept ";
		}
		
		if (q != null) {
			queryStr += " JOIN sp.visit v LEFT JOIN v.patient p LEFT JOIN p.names pname LEFT JOIN p.identifiers pi LEFT JOIN v.attributes va ";
		}
		
		boolean hasWhere = false;
		
		if (testConceptUuid != null) {
			queryStr += " WHERE orderConcept.uuid = :testConceptUuid ";
			hasWhere = true;
		}
		
		if (q != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += "(lower(sp.label) like lower(:q) OR (lower(concat(pname.givenName,pname.middleName,pname.familyName)) LIKE lower(:q) OR lower(pname.givenName) LIKE lower(:q) OR lower(pname.middleName) LIKE lower(:q) OR lower(pname.familyName) LIKE lower(:q) OR lower(concat(pname.givenName,'',pname.familyName)) LIKE lower(:q) OR lower(concat(pname.givenName,'',pname.middleName)) LIKE lower(:q) OR lower(concat(pname.middleName,'',pname.familyName)) LIKE lower(:q)  OR pi.identifier LIKE :q OR lower(va.valueReference) LIKE lower(:q)))";
			hasWhere = true;
		}
		
		if (startDate != null && endDate != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " ((cast(sp.dateTime as date) BETWEEN :startDate AND :endDate) OR (cast(sp.dateCreated as date) BETWEEN :startDate AND :endDate))";
			hasWhere = true;
		}
		
		if (departmentUuid != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " sp.concept.uuid = :departmentUuid";
			hasWhere = true;
		}
		
		if (specimenSourceUuid != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " sp.specimenSource.uuid = :specimenSourceUuid";
			hasWhere = true;
		}
		
		if (instrumentUuid != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " sp IN (SELECT DISTINCT sst.sample FROM SampleStatus sst WHERE (sst.category='HAS_RESULTS' AND sst.sample IN (SELECT testAllocation.sampleOrder.id.sample FROM TestAllocation testAllocation WHERE testAllocation IN (SELECT res.testAllocation FROM Result res WHERE res.instrument.uuid = :instrumentUuid)))) ";
			hasWhere = true;
		}
		
		if (locationUuid != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " sp.visit.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)";
			hasWhere = true;
		}
		
		if (sampleCategory != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			hasWhere = true;
			if (sampleCategory.equalsIgnoreCase("not accepted")) {
				queryStr += " sp NOT IN (SELECT DISTINCT sst.sample FROM SampleStatus sst WHERE (sst.category='ACCEPTED' OR lower(sst.category) LIKE 'reject%' OR lower(sst.category) LIKE 'dispose%')) ";
			} else if (sampleCategory.equalsIgnoreCase("no results")) {
				queryStr += " sp NOT IN (SELECT DISTINCT sst.sample FROM SampleStatus sst WHERE (sst.category='HAS_RESULTS' OR lower(sst.category) LIKE 'reject%' OR lower(sst.category) LIKE 'dispose%')) AND sp IN (SELECT DISTINCT sst.sample FROM SampleStatus sst WHERE (sst.category='ACCEPTED'))";
			} else if (sampleCategory.equalsIgnoreCase("rejected")) {
				queryStr += " sp IN (SELECT sst.sample FROM SampleStatus sst WHERE lower(sst.category) LIKE 'reject%')";
			} else {
				queryStr += " sp IN (SELECT sst.sample FROM SampleStatus sst WHERE sst.category = :sampleCategory)";
			}
		}
		
		if (testCategory != null && !"Completed".equals(testCategory)) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " sp IN (SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testallocstatus.testAllocation FROM TestAllocationStatus testallocstatus WHERE testallocstatus.category = :testCategory))";
			hasWhere = true;
		}
		
		if ("Completed".equals(testCategory)) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " sp IN (SELECT testalloc.sampleOrder.id.sample FROM TestAllocation testalloc WHERE testalloc IN (SELECT testresults.testAllocation FROM Result testresults)) ";
			hasWhere = true;
		}
		
		if (hasStatus != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			hasWhere = true;
			if (hasStatus.equalsIgnoreCase("no")) {
				queryStr += " sp NOT IN (SELECT samplestatus.sample FROM SampleStatus samplestatus)";
			} else if (hasStatus.equalsIgnoreCase("yes")) {
				if (acceptedByUuid == null) {
					queryStr += " sp IN (SELECT samplestatus.sample FROM SampleStatus samplestatus)";
				} else {
					queryStr += " sp IN (SELECT samplestatus.sample FROM SampleStatus samplestatus WHERE samplestatus.user IN (SELECT usr FROM User usr WHERE uuid = :acceptedByUuid))";
				}
			}
		}
		
		if (visitUuid != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " sp.visit = (SELECT v FROM Visit v WHERE v.uuid = :visitUuid)";
			hasWhere = true;
		}
		
		if (excludeStatus != null) {
			queryStr += (hasWhere ? " AND " : " WHERE ");
			queryStr += " sp NOT IN (SELECT sst.sample FROM SampleStatus sst WHERE sst.category IN (:statuses))";
			hasWhere = true;
		}
		
		queryStr += " GROUP BY sp.id, sp.dateCreated ";
		queryStr += " ORDER BY MIN(CASE WHEN o.urgency = :urgency THEN 0 ELSE 1 END) ASC, sp.dateCreated DESC";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("urgency", org.openmrs.Order.Urgency.STAT);
		
		if (startDate != null && endDate != null) {
			query.setParameter("startDate", startDate);
			query.setParameter("endDate", endDate);
		}
		if (locationUuid != null) {
			query.setParameter("locationUuid", locationUuid);
		}
		if (q != null) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}
		if (departmentUuid != null) {
			query.setParameter("departmentUuid", departmentUuid);
		}
		if (specimenSourceUuid != null) {
			query.setParameter("specimenSourceUuid", specimenSourceUuid);
		}
		if (testCategory != null && !"Completed".equals(testCategory)) {
			query.setParameter("testCategory", testCategory);
		}
		if (acceptedByUuid != null && "yes".equalsIgnoreCase(hasStatus)) {
			query.setParameter("acceptedByUuid", acceptedByUuid);
		}
		if (testConceptUuid != null) {
			query.setParameter("testConceptUuid", testConceptUuid);
		}
		if (instrumentUuid != null) {
			query.setParameter("instrumentUuid", instrumentUuid);
		}
		if (visitUuid != null) {
			query.setParameter("visitUuid", visitUuid);
		}
		if (sampleCategory != null
		        && !Arrays.asList("not accepted", "no results", "rejected").contains(sampleCategory.toLowerCase())) {
			query.setParameter("sampleCategory", sampleCategory);
		}
		if (excludeStatus != null) {
			String cleanExclude = excludeStatus.replace("List:[", "").replace("]", "");
			List<String> valueList = Arrays.asList(cleanExclude.split(","));
			query.setParameterList("statuses", valueList);
		}
		
		if (pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		
		List<Sample> rawSamples = (List<Sample>) query.list();
		List<SampleExt> finalResults = new ArrayList<SampleExt>();
		for (Sample parent : rawSamples) {
			SampleExt child = new SampleExt();
			BeanUtils.copyProperties(parent, child);
			finalResults.add(child);
		}
		
		ListResult<SampleExt> listResults = new ListResult<SampleExt>();
		listResults.setPager(pager);
		listResults.setResults(finalResults);
		return listResults;
	}
	
	public List<Sample> getSamplesByBatchSampleUuid(String batchSampleUuid) {
		DbSession session = this.getSession();
		String queryStr = "SELECT s FROM Sample s WHERE s.batchSample IN (select bs FROM BatchSample bs WHERE bs.uuid =:batchUuid)";
		Query query = session.createQuery(queryStr);
		query.setParameter("batchSampleUuid", batchSampleUuid);
		return query.list();
	}
	
	public Sample getSamplesByLabel(String label) {
		if (label == null || label.trim().equals("")) {
			return null;
		}
		
		DbSession session = this.getSession();
		
		//		String queryStr = "SELECT sp FROM Sample sp " + "WHERE sp.voided = false " + "AND sp.label = :label";
		String queryStr = "SELECT sample FROM Sample sample WHERE sp.label = :label";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("label", label.trim());
		query.setMaxResults(1);
		
		List<Sample> results = query.list();
		return results.isEmpty() ? null : results.get(0);
	}
}
