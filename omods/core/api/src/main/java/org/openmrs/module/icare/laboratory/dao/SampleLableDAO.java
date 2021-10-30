package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.SampleLable;

public class SampleLableDAO extends BaseDAO<SampleLable> {
	
	public SampleLable updateSampleLable(SampleLable sampleLable, Integer previosLable) {
		
		DbSession session = this.getSession();
		String queryStr = "UPDATE SampleLable set " + "currentLable = :currentLable," + " time = :time " + "where id = :id";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("currentLable", sampleLable.getCurrentLable());
		query.setParameter("time", sampleLable.getTime());
		query.setParameter("id", sampleLable.getId());
		
		Integer success = query.executeUpdate();
		
		if (success == 1) {
			
			return sampleLable;
			
		} else {
			
			return null;
			
		}
	}
}
