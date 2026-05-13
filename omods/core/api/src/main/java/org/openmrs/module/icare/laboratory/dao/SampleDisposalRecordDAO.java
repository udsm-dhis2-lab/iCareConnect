package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.SampleDisposalRecord;

import java.util.List;

public class SampleDisposalRecordDAO extends BaseDAO<SampleDisposalRecord> {
	
	public SampleDisposalRecord getLatestBySampleUuid(String sampleUuid) {
		DbSession session = this.getSession();
		String hql = "SELECT d FROM SampleDisposalRecord d WHERE d.sample.uuid = :sampleUuid "
		        + "AND (d.voided = false OR d.voided is null) ORDER BY d.disposedAt DESC";
		Query query = session.createQuery(hql);
		query.setParameter("sampleUuid", sampleUuid);
		query.setMaxResults(1);
		List list = query.list();
		return list == null || list.isEmpty() ? null : (SampleDisposalRecord) list.get(0);
	}
}
