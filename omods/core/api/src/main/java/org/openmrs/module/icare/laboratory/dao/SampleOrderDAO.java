package org.openmrs.module.icare.laboratory.dao;

// Generated Oct 7, 2020 12:49:21 PM by Hibernate Tools 5.2.10.Final

import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.SampleOrder;
import org.openmrs.module.icare.laboratory.models.SampleOrderID;

/**
 * Home object for domain model class LbSampleOrder.
 * 
 * @see org.openmrs.module.icare.core.dao.LbSampleOrder
 * @author Hibernate Tools
 */
public class SampleOrderDAO extends BaseDAO<SampleOrder> {
	
	public SampleOrder get(SampleOrderID id) {
		DbSession session = getSession();
		return (SampleOrder) session.get(SampleOrder.class, id);
	}
}
