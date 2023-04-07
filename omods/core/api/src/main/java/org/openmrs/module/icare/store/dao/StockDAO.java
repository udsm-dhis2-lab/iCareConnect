package org.openmrs.module.icare.store.dao;

// Generated Oct 7, 2020 12:49:21 PM by Hibernate Tools 5.2.10.Final

import org.hibernate.Query;
import org.openmrs.Concept;
import org.openmrs.Drug;
import org.openmrs.Location;
import org.openmrs.Visit;
import org.openmrs.api.context.Context;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.BaseDAO;
import org.openmrs.module.icare.store.models.OrderStatus;
import org.openmrs.module.icare.store.models.Stock;

import java.util.*;

/**
 * Home object for domain model class StStock.
 * 
 * @author Hibernate Tools
 * @see org.openmrs.module.icare.store.models.Stock
 */
public class StockDAO extends BaseDAO<Stock> {
	
	public List<Stock> getStockByItemId(String itemUuid) {
		
		DbSession session = this.getSession();
		String queryStr = "SELECT st \n" + "FROM Stock st \n"
		        + "WHERE st.item = (SELECT im FROM Item im WHERE im.uuid = :itemUuid AND im.stockable = true) \n";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("itemUuid", itemUuid);
		
		return query.list();
	}
	
	public List<Stock> getStockByDrugId(String drugUuid) {
		
		DbSession session = this.getSession();
		String queryStr = "SELECT st \n"
		        + "FROM Stock st \n"
		        + "WHERE st.item = (SELECT im FROM Item im WHERE im.drug = (SELECT d FROM Drug d WHERE d.uuid= :drugUuid) AND im.stockable = true) \n";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("drugUuid", drugUuid);
		
		return query.list();
	}
	
	public List<Stock> getStockByItemAndLocation(String itemUuid, String locationUuid) {
		DbSession session = this.getSession();
		String queryStr = "SELECT st \n" + "FROM Stock st \n"
		        + "WHERE st.item = (SELECT it FROM Item it WHERE it.uuid = :itemUuid) "
		        + "AND st.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)\n"
		        + "AND st.item.stockable = true AND st.quantity > 0 ORDER BY st.expiryDate DESC";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("itemUuid", itemUuid);
		query.setParameter("locationUuid", locationUuid);
		
		return query.list();
	}
	
	public List<Stock> getStockByItemAndLocations(String itemUuid, List<String> locationUuids) {
		/*DbSession session = this.getSession();
		String locations = "";
		for(String location: locationUuids){
			if(!locations.equals("")){
				locations += ",";
			}
			locations += "'" +location +"'";
		}
		String queryStr = "SELECT st \n" + "FROM Stock st \n"
				+ "WHERE st.item = (SELECT it FROM Item it WHERE it.uuid = :itemUuid) "
				+ "AND st.location = (SELECT l FROM Location l WHERE l.uuid IN (:locationUuids))\n"
				+ "AND st.item.stockable = true";

		Query query = session.createQuery(queryStr);
		query.setParameter("itemUuid", itemUuid);
		query.setParameter("locationUuids", locations);*/

        List<Stock> stockList = new ArrayList<>();

        for (String location : locationUuids) {
            stockList.addAll(getStockByItemAndLocation(itemUuid, location));
        }
        return stockList;
    }
	
	public List<Stock> getStockByDrugAndLocation(String drugUuid, String locationUuid) {
		DbSession session = this.getSession();
		String queryStr = "SELECT st FROM Stock st \n"
		        + "WHERE st.item = (SELECT it FROM Item it WHERE it.drug = (SELECT d FROM drug d WHERE d.uuid=:drugUuid)) "
		        + "AND st.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)\n"
		        + "AND st.item.stockable = true";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("drugUuid", drugUuid);
		query.setParameter("locationUuid", locationUuid);
		
		return query.list();
	}
	
	public List<Stock> getStockByItemLocation(String itemUuid, String locationUuid) {
		
		DbSession session = this.getSession();
		Date expireDate = new Date();
		System.out.println("dates expiry");
		System.out.println(expireDate);
		
		String queryStr = "SELECT st \n" + "FROM Stock st \n"
		        + "WHERE st.item = (SELECT it FROM Item it WHERE it.uuid = :itemUuid) "
		        + "AND st.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)\n"
		        + "AND st.item.stockable = true AND st.expiryDate >= :expireDate";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("itemUuid", itemUuid);
		query.setParameter("locationUuid", locationUuid);
		query.setParameter("expireDate", expireDate);
		
		return (List<Stock>) query.list();
		
	}
	
	public Stock getStockByItemBatchExpDateLocation(String itemUuid, String batch, Date expireDate, String locationUuid) {
		DbSession session = this.getSession();
		
		if (batch == null && expireDate == null) {
			
			expireDate = new Date();
			System.out.println("dates expiry");
			System.out.println(expireDate);
			
			String queryStr = "SELECT st \n" + "FROM Stock st \n"
			        + "WHERE st.item = (SELECT it FROM Item it WHERE it.uuid = :itemUuid) "
			        + "AND st.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)\n"
			        + "AND st.item.stockable = true AND st.expiryDate <= :expireDate";
			
			Query query = session.createQuery(queryStr);
			query.setParameter("itemUuid", itemUuid);
			query.setParameter("locationUuid", locationUuid);
			query.setParameter("expireDate", expireDate);
			
			System.out.println(query.getQueryString());
			
			return (Stock) query.uniqueResult();
			
		} else {
			
			String queryStr = "SELECT st \n" + "FROM Stock st \n"
			        + "WHERE st.item = (SELECT it FROM Item it WHERE it.uuid = :itemUuid) "
			        + "AND st.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)\n"
			        + "AND st.item.stockable = true AND st.batch = :batch " + "AND st.expiryDate = :expireDate";
			
			Query query = session.createQuery(queryStr);
			query.setParameter("itemUuid", itemUuid);
			query.setParameter("locationUuid", locationUuid);
			query.setParameter("batch", batch);
			query.setParameter("expireDate", expireDate);
			
			System.out.println(query.getQueryString());
			
			return (Stock) query.uniqueResult();
			
		}
		
	}
	
	public List<Stock> getStockByLocation(String locationUuid, String search, Integer startIndex, Integer limit,
	        String conceptClassName) {
		
		DbSession session = this.getSession();
		String queryStr = "SELECT st \n"
		        + "FROM Stock st \n LEFT JOIN st.item it LEFT JOIN it.concept c LEFT JOIN it.drug d";
		
		if (search != null) {
			queryStr += " LEFT JOIN c.names cn WHERE (lower(d.name) LIKE lower(:search) OR lower(cn.name) like lower(:search) ) ";
		}
		if (search != null) {
			queryStr += " AND st.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)";
		} else {
			queryStr += " WHERE st.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid)";
		}
		
		if (conceptClassName != null) {
			
			if (!queryStr.contains("WHERE")) {
				queryStr += " WHERE ";
			} else {
				queryStr += " AND ";
			}
			queryStr += " c.conceptClass =(SELECT ccl FROM ConceptClass ccl WHERE ccl.name = :conceptClassName)";
			
		}
		
		if (!queryStr.contains("WHERE")) {
			queryStr += " WHERE ";
		} else {
			queryStr += " AND ";
		}
		queryStr += " (d.retired = false OR c.retired = false) AND it.voided=false";
		
		Query query = session.createQuery(queryStr);
		query.setFirstResult(startIndex);
		query.setMaxResults(limit);
		
		if (search != null) {
			query.setParameter("search", "%" + search.replace(" ", "%") + "%");
		}
		if (conceptClassName != null) {
			query.setParameter("conceptClassName", conceptClassName);
		}
		if (locationUuid != null) {
			query.setParameter("locationUuid", locationUuid);
		}
		return query.list();
		
	}
	
	public ListResult<Item> getStockedOut(Pager pager) {
		
		DbSession session = this.getSession();
		String queryStr = "SELECT item FROM Item item \n"
		        + "WHERE item.stockable = true AND item.voided=false AND ( item IN(SELECT stock.item FROM Stock stock WHERE stock.quantity = 0))";
		
		Query query = session.createQuery(queryStr);

		ListResult<Item> listResults = new ListResult();
		listResults.setPager(pager);
		listResults.setResults(query.list());
		return listResults;

	}
	
		public ListResult<Item> getNearlyStockedOut(String locationUuid,Pager pager) {

			DbSession session = this.getSession();

//			String queryStr = "SELECT stc.item,SUM(stc.quantity) FROM Stock stc \n"
//					+ "WHERE stc.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid) \n" + "GROUP BY stc.item \n"
//					+ "HAVING SUM(stc.quantity) <=  (SELECT rol.quantity FROM ReorderLevel rol \n"
//					+ "WHERE rol.id.location = (SELECT loc FROM Location loc WHERE loc.uuid = :locationUuid) AND rol.id.item = stc.item)";
//
//			String queryStr = "SELECT s FROM Stock s JOIN (SELECT s.item, SUM(s.quantity) as totalQuantity FROM Stock s WHERE s.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid) GROUP BY s.item) AS sq ON s.item = sq.item JOIN ReorderLevel r ON s.item = r.id.item WHERE sq.totalQuantity <= r.quantity";

//			String queryStr = "SELECT s FROM Stock s INNER JOIN ReorderLevel r ON s.item = r.id.item WHERE s.item IN ( SELECT s2.item FROM Stock s2 WHERE s2.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid) GROUP BY s2.item HAVING SUM(s2.quantity) < r.quantity)";

			String queryStr = "SELECT item FROM Item item WHERE item IN( SELECT s.item FROM Stock s WHERE s.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid) AND  s.item IN ( SELECT r.id.item FROM ReorderLevel r WHERE ( SELECT SUM(s2.quantity) FROM Stock s2 WHERE s2.item = r.id.item AND s2.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid AND s2.expiryDate > current_date) GROUP BY s2.item) <= r.quantity)) ";


			Query query = session.createQuery(queryStr);
			query.setParameter("locationUuid", locationUuid);

			if (pager.isAllowed()) {
				pager.setTotal(query.list().size());
				query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
				query.setMaxResults(pager.getPageSize());
			}

			ListResult<Item> listResults = new ListResult<>();
			listResults.setPager(pager);
			listResults.setResults(query.list());
			return listResults;
		}

	public ListResult<Item> getNearlyExpiredByLocation(String locationUuid, Pager pager) {

		DbSession session = this.getSession();

		String queryStr = "SELECT stc FROM Stock stc INNER JOIN stc.item it LEFT JOIN it.concept c LEFT JOIN it.drug d WHERE stc.expiryDate <= current_date + 30 AND stc.expiryDate > current_date AND (d.retired = false OR c.retired = false) AND stc.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid) ";;

		Query query = session.createQuery(queryStr);
		query.setParameter("locationUuid", locationUuid);

		if (pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}

		ListResult<Item> listResults = new ListResult<>();
		listResults.setPager(pager);
		listResults.setResults(query.list());
		return listResults;

	}

	public ListResult<Item> getExpiredItemsByLocation(String locationUuid, Pager pager) {

		DbSession session = this.getSession();

		String queryStr = "SELECT stc FROM Stock stc INNER JOIN stc.item it LEFT JOIN it.concept c LEFT JOIN it.drug d WHERE stc.expiryDate <= current_date AND (d.retired = false OR c.retired = false) AND  stc.location = (SELECT l FROM Location l WHERE l.uuid = :locationUuid) ";

		Query query = session.createQuery(queryStr);
		query.setParameter("locationUuid", locationUuid);

		if (pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}
		//Stock
		ListResult<Item> listResults = new ListResult<>();
		listResults.setPager(pager);
		listResults.setResults(query.list());
		return listResults;

	}
	
	//TODO fix getting by location query
	public ListResult<Item> getStockedOutByLocation(String locationUuid, Pager pager, String q, String conceptClassName) {
		DbSession session = this.getSession();
		//String queryStr = "SELECT item FROM Item item \n"
		//        + "WHERE item.stockable = true AND item.uuid NOT IN(SELECT stock.item.uuid FROM Stock stock WHERE stock.location.uuid =:locationUuid)";
		//String queryStr = "SELECT item FROM Item item, Stock stock WHERE item.stockable = true AND stock.item=item AND stock.location.uuid =:locationUuid";
		String queryStr = "SELECT item FROM Item item LEFT JOIN item.concept c WITH c.retired = false LEFT JOIN item.drug d WITH d.retired = false \n";
		
		if (q != null) {
			queryStr += " LEFT JOIN c.names cn";
			queryStr += " WHERE lower(d.name) LIKE lower(:q) OR lower(cn.name) like lower(:q) ";
		}
		
		if (!queryStr.contains("WHERE")) {
			queryStr += " WHERE ";
		} else {
			queryStr += " AND ";
		}
		queryStr += "  item.stockable = true AND item.voided=false AND (item IN(SELECT stock.item FROM Stock stock WHERE stock.location.uuid =:locationUuid AND stock.quantity = 0))";
		
		Query query = session.createQuery(queryStr);
		//		query.setFirstResult(startIndex);
		//		query.setMaxResults(limit);
		
		if (q != null) {
			query.setParameter("q", "%" + q.replace(" ", "%") + "%");
		}
		//		if (conceptClassName != null) {
		//			query.setParameter("conceptClassName", conceptClassName);
		//		}
		
		query.setParameter("locationUuid", locationUuid);

		if (pager.isAllowed()) {
			pager.setTotal(query.list().size());
			query.setFirstResult((pager.getPage() - 1) * pager.getPageSize());
			query.setMaxResults(pager.getPageSize());
		}

		ListResult<Item> listResults = new ListResult<>();
		listResults.setPager(pager);
		listResults.setResults(query.list());
		return listResults;
	}
	
	public Map<String, Object> getStockMetricsByLocation(String locationUuid) {

		Pager pager = new Pager();
		pager.setAllowed(false);

		Map<String, Object> metricsMap = new HashMap<String, Object>();
		metricsMap.put("nearlyStockedOut", this.getNearlyStockedOut(locationUuid,pager).getResults().size());
		metricsMap.put("nearlyExpired", this.getNearlyExpiredByLocation(locationUuid,pager).getResults().size());
		metricsMap.put("stockedOut", this.getStockedOutByLocation(locationUuid, pager, null, null).getResults().size());
		metricsMap.put("expired", this.getExpiredItemsByLocation(locationUuid,pager).getResults().size());
		
		return metricsMap;
		
	}
	
	public List<OrderStatus> getOrderStatusByVisit(String visitUuid) {
		DbSession session = this.getSession();
		//String queryStr = "SELECT item FROM Item item \n"
		//        + "WHERE item.stockable = true AND item.uuid NOT IN(SELECT stock.item.uuid FROM Stock stock WHERE stock.location.uuid =:locationUuid)";
		//String queryStr = "SELECT item FROM Item item, Stock stock WHERE item.stockable = true AND stock.item=item AND stock.location.uuid =:locationUuid";
		String queryStr = "SELECT os FROM OrderStatus os\n" + "INNER JOIN os.order o\n" + "INNER JOIN o.encounter e\n"
		        + "INNER JOIN e.visit v\n" + "WHERE v.uuid=:visitUuid";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("visitUuid", visitUuid);
		return query.list();
	}
	
	public List<OrderStatus> getOrderStatusByOrderUuid(String orderUuid) {
		DbSession session = this.getSession();
		//String queryStr = "SELECT item FROM Item item \n"
		//        + "WHERE item.stockable = true AND item.uuid NOT IN(SELECT stock.item.uuid FROM Stock stock WHERE stock.location.uuid =:locationUuid)";
		//String queryStr = "SELECT item FROM Item item, Stock stock WHERE item.stockable = true AND stock.item=item AND stock.location.uuid =:locationUuid";
		String queryStr = "SELECT os FROM OrderStatus os\n" + "INNER JOIN os.order o\n" + "WHERE o.uuid=:orderUuid";
		
		Query query = session.createQuery(queryStr);
		query.setParameter("orderUuid", orderUuid);
		return query.list();
	}
	
	public OrderStatus saveOrderStatus(OrderStatus entity) {
		DbSession session = getSession();
		session.saveOrUpdate("OrderStatus", entity);
		session.flush();
		return entity;
	}

}
