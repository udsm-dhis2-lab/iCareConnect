package org.openmrs.module.icare.core.dao;

import org.hibernate.Query;
import org.openmrs.User;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.models.PasswordHistory;

import java.util.List;

public class PasswordHistoryDAO extends BaseDAO<PasswordHistory>{

    public List<User> getUsersInPasswordHistory(){
        DbSession session = this.getSession();
        String queryStr = " SELECT DISTINCT ph.user FROM PasswordHistory ph";
        Query query = session.createQuery(queryStr);
        return query.list();
    }
}
