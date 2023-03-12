package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.TestRangeConfig;
import org.openmrs.module.icare.laboratory.models.TestTimeConfig;

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
}
