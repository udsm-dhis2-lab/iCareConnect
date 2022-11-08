package org.openmrs.module.icare.laboratory.dao;

import org.hibernate.Query;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.laboratory.models.Sample;
import org.openmrs.module.icare.laboratory.models.SampleLable;
import org.openmrs.module.icare.report.dhis2.DHIS2Config;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

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

	public String generateSampleLabel() {
		AdministrationService adminService = Context.getService(AdministrationService.class);
		String idFormat = adminService.getGlobalProperty(ICareConfig.SAMPLE_ID_FORMAT);
		if(idFormat.contains("D{YYYY}") || idFormat.contains("D{YYY}") || idFormat.contains("D{YY}")){
			SimpleDateFormat formatter = new SimpleDateFormat("YYYY", Locale.ENGLISH);
			idFormat = idFormat.replace("D{YYYY}", formatter.format(new Date()).substring(2));
			DbSession session = this.getSession();
			new Sample();
			String queryStr = "SELECT COUNT(sp) FROM Sample sp \n"
					+ "WHERE YEAR(sp.dateTime) = :year";
			Calendar calendar = Calendar.getInstance();
			Query query = session.createQuery(queryStr);
			query.setParameter("year", calendar.get(Calendar.YEAR));
			long data = (long) query.list().get(0);
			idFormat = idFormat.replace("COUNT", "" + String.format("%07d", data + 1));
		} else {
			idFormat = "";
		}
		return  idFormat;
	}
}
