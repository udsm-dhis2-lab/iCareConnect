package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.SampleStorageOccupancy;

import java.util.List;

public class SampleStorageOccupancyDAO extends BaseDAO<SampleStorageOccupancy> {
	
	public SampleStorageOccupancy getActiveBySampleUuid(String sampleUuid) {
		DbSession session = this.getSession();
		String hql = "SELECT o FROM SampleStorageOccupancy o WHERE o.sample.uuid = :sampleUuid "
		        + "AND o.activeOccupancy = true AND (o.voided = false OR o.voided is null) ORDER BY o.storedAt DESC";
		Query query = session.createQuery(hql);
		query.setParameter("sampleUuid", sampleUuid);
		query.setMaxResults(1);
		List list = query.list();
		return list == null || list.isEmpty() ? null : (SampleStorageOccupancy) list.get(0);
	}
	
	public SampleStorageOccupancy getActiveBySlotUuid(String slotUuid) {
		DbSession session = this.getSession();
		String hql = "SELECT o FROM SampleStorageOccupancy o WHERE o.slotLocation.uuid = :slotUuid "
		        + "AND o.activeOccupancy = true AND (o.voided = false OR o.voided is null) ORDER BY o.storedAt DESC";
		Query query = session.createQuery(hql);
		query.setParameter("slotUuid", slotUuid);
		query.setMaxResults(1);
		List list = query.list();
		return list == null || list.isEmpty() ? null : (SampleStorageOccupancy) list.get(0);
	}
	
	public List<SampleStorageOccupancy> getBySampleUuid(String sampleUuid) {
		DbSession session = this.getSession();
		String hql = "SELECT o FROM SampleStorageOccupancy o WHERE o.sample.uuid = :sampleUuid "
		        + "AND (o.voided = false OR o.voided is null) ORDER BY o.storedAt DESC";
		Query query = session.createQuery(hql);
		query.setParameter("sampleUuid", sampleUuid);
		return query.list();
	}
}
