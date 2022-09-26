package org.openmrs.module.icare.store.services;

import org.openmrs.DrugOrder;
import org.openmrs.Location;
import org.openmrs.api.OpenmrsService;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.store.models.*;
import org.openmrs.module.icare.store.util.StockOutException;

import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Transactional
public interface StoreService extends OpenmrsService {
	
	public ReorderLevel addReorderLevel(ReorderLevel reorderLevel);
	
	public List<ReorderLevel> getAllReorderLevels();
	
	public LedgerType addLedgerType(LedgerType ledgerType);
	
	public List<LedgerType> getLedgerTypes();
	
	public List<Ledger> listLedgerEntries();
	
	public Ledger saveLedger(Ledger ledger) throws StockOutException;
	
	Stock getStockByItemBatchLocation(Item item, String batchNo, Date expiryDate, Location location);
	
	List<Stock> getStockByItemLocation(Item item, Location location);
	
	public Requisition saveRequest(Requisition requisition);
	
	public RequisitionStatus saveRequestStatus(RequisitionStatus requisitionStatus);
	
	public List<RequisitionStatus> getRequisitionStatuses();
	
	public List<Requisition> getRequestsByRequestingLocation(String requestingLocationUuid);
	
	public List<Requisition> getRequestsForRequestedLocation(String requestedLocationUuid);
	
	public Requisition getRequestByUuid(String requisitionUuid);
	
	public Issue saveIssue(Issue issue) throws StockOutException;
	
	public IssueStatus saveIssueStatus(IssueStatus issueStatus);
	
	public List<Issue> getIssuesByIssueingLocation(String issueingLocationUuid);
	
	public List<Issue> getIssuesForIssuedLocation(String issuedLocationUuid);
	
	public List<IssueStatus> getIssueStatuses();
	
	public Receipt saveReceive(Receipt receipt) throws StockOutException;
	
	public List<Receipt> getReceiptsByIssueingLocation(String issueingLocationUuid);
	
	public List<Receipt> getReceiptsForReceivingLocation(String receivingLocationUuid);
	
	public List<Stock> getAllStockStatusMetrics();
	
	List<OrderStatus> getOrderStatusByOrderUuid(String orderUuid);
	
	public List<Stock> getStockByItemAndLocation(String itemUuid, String locationUuid);
	
	public List<Stock> getStockByLocation(String locationUuid, String search, Integer startIndex, Integer limit,
	        String conceptClassName);
	
	public List<Item> getStockout();
	
	public List<Stock> getItemStockMetrics(String itemUuid);
	
	public LedgerType getLedgerTypeByUuid(String ledgerTypeUuid);
	
	public Ledger getLedgerByUuid(String ledgerUuid);
	
	public Issue getIssueByUuid(String issueUuid);
	
	List<Item> getStockoutByLocation(String locationUuid);
	
	Stock saveStock(Stock stock);
	
	Transaction saveTransaction(Transaction transaction);
	
	List<Transaction> getTransactionsByLocationUuid(String uuid);
	
	public Map<String, Object> getLocationStockMetrics(String locationUuid);
	
	List<Stock> getStockByItemAndLocations(String itemUuid, List<String> locationUuids);
	
	List<Stock> getStockByDrugAndLocation(String drugUuid, String locationUuid);
	
	List<Stock> getDrugStockMetrics(String drugUuid);
	
	OrderStatus dispense(String drugOrderUuid, String locationUuid, String remarks);
	
	List<OrderStatus> getOrderStatus(String visitUuid);
	
	OrderStatus dispenseDrug(String drugOrderUuid, String location, String location1);
}
