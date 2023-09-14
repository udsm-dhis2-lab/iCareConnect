package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.Concept;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.TestRangeConfig;
import org.openmrs.module.icare.laboratory.models.TestTimeConfig;
import org.openmrs.module.icare.store.models.Requisition;

import java.util.List;

public class TestTimeConfigDAO extends BaseDAO<TestTimeConfig> {
	
	public List<TestTimeConfig> getConfigsByConcept(String uuid) {
		DbSession session = this.getSession();
		
		String queryStr = "SELECT ttc \n" + "FROM TestTimeConfig ttc \n"
		        + "WHERE ttc.concept = (SELECT c FROM Concept c WHERE c.uuid = :conceptUuid)";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("conceptUuid", uuid);
		
		return query.list();
	}
	
	public TestTimeConfig updateConfig(TestTimeConfig testTimeConfig) {
		DbSession session = this.getSession();
		
		String queryStr = "UPDATE TestTimeConfig set " + "standardTAT = :standardTAT," + "urgentTAT = :urgentTAT,"
		        + "addReqTimeLimit = :addReqTimeLimit," + "version = :version, " + "creator = :creator,"
		        + "dateCreated = :dateCreated," + "changedBy = :changedBy, " + "dateChanged = :dateChanged "
		        + "where uuid = :uuid";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("standardTAT", testTimeConfig.getStandardTAT());
		query.setParameter("urgentTAT", testTimeConfig.getUrgentTAT());
		query.setParameter("addReqTimeLimit", testTimeConfig.getAddReqTimeLimit());
		query.setParameter("version", testTimeConfig.getVersion());
		query.setParameter("uuid", testTimeConfig.getUuid());
		query.setParameter("changedBy", testTimeConfig.getChangedBy());
		query.setParameter("dateChanged", testTimeConfig.getDateChanged());
		query.setParameter("creator", testTimeConfig.getCreator());
		query.setParameter("dateCreated", testTimeConfig.getDateCreated());
		
		Integer success = query.executeUpdate();
		
		if (success == 1) {
			
			return testTimeConfig;
			
		} else {
			
			return null;
			
		}
		
	}
	
	public List<TestTimeConfig> getConfig(String q) {
		
		DbSession session = this.getSession();
		
		String queryStr = "SELECT ttc FROM TestTimeConfig ttc INNER JOIN ttc.concept c INNER JOIN c.names cn WITH cn.conceptNameType = 'FULLY_SPECIFIED'";
		
		if (q != null) {
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND";
			}
			
			queryStr += " (lower(cn.name) LIKE lower(:q) OR ttc.standardTAT LIKE :q)";
		}
		
		Query query = session.createQuery(queryStr);
		if (q != null) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}
		
		return query.list();
	}
	
	public TestTimeConfig deleteTestConfig(String testConfigUuid) {
		
		DbSession session = this.getSession();
		String selectQueryStr = "SELECT ttc FROM TestTimeConfig ttc WHERE ttc.uuid = :testConfigUuid";
		;
		
		Query selectQuery = session.createQuery(selectQueryStr);
		selectQuery.setParameter("testConfigUuid", testConfigUuid);
		
		TestTimeConfig deletedTestTimeConfig = (TestTimeConfig) selectQuery.uniqueResult(); // Fetch the object before deletion
		
		if (deletedTestTimeConfig != null) {
			String deleteQueryStr = "DELETE FROM TestTimeConfig ttc WHERE ttc.uuid = :testConfigUuid";
			
			Query deleteQuery = session.createQuery(deleteQueryStr);
			deleteQuery.setParameter("testConfigUuid", testConfigUuid);
			
			int deletedCount = deleteQuery.executeUpdate(); // Perform the deletion
			
			// Now 'deletedRequisition' contains the deleted object
		}
		
		//session.getTransaction().commit(); // Commit the transaction
		
		return deletedTestTimeConfig;
	}
}
