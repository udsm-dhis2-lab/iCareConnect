package org.openmrs.module.icare.web.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.DrugOrder;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.core.ICareService;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.laboratory.models.Sample;
import org.openmrs.module.icare.store.models.*;
import org.openmrs.module.icare.store.services.StoreService;
import org.openmrs.module.icare.store.util.StockOutException;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping(value = "/rest/" + RestConstants.VERSION_1 + "/store")
public class StoreController {
	
	protected final Log log = LogFactory.getLog(getClass());
	
	@Autowired
	StoreService storeService;
	
	@Autowired
	ICareService iCareService;
	
	@RequestMapping(value = "reorderlevel", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addReorderLevel(@RequestBody Map<String, Object> reorderLevelMap) {
		
		ReorderLevel reorderLevel = new ReorderLevel().fromMap(reorderLevelMap);
		
		ReorderLevel createdReorderLevel = storeService.addReorderLevel(reorderLevel);
		
		return createdReorderLevel.toMap();
	}
	
	@RequestMapping(value = "reorderlevels", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getAllReorderLevels() {
		
		List<ReorderLevel> reorderLevels = storeService.getAllReorderLevels();
		
		List<Map<String, Object>> reorderLevelsMapList = new ArrayList<Map<String, Object>>();
		for (ReorderLevel reorderLevel : reorderLevels) {
			reorderLevelsMapList.add(reorderLevel.toMap());
		}
		
		return reorderLevelsMapList;
		
	}
	
	@RequestMapping(value = "ledgertype", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addLedgerType(@RequestBody Map<String, Object> ledgerTypeMap) {
		
		LedgerType ledgerType = new LedgerType().fromMap(ledgerTypeMap);
		
		LedgerType createdLedgerType = storeService.addLedgerType(ledgerType);
		
		return createdLedgerType.toMap();
	}
	
	@RequestMapping(value = "ledgertypes", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> listLedgerTypes() {
		
		List<LedgerType> ledgerTypes = storeService.getLedgerTypes();
		
		List<Map<String, Object>> ledgerTypesMapList = new ArrayList<Map<String, Object>>();
		for (LedgerType ledgerType : ledgerTypes) {
			ledgerTypesMapList.add(ledgerType.toMap());
		}
		
		return ledgerTypesMapList;
	}
	
	@RequestMapping(value = "ledgers", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> listLedgerEntries() {
		
		List<Ledger> ledgers = storeService.listLedgerEntries();
		
		List<Map<String, Object>> ledgersMapList = new ArrayList<Map<String, Object>>();
		for (Ledger ledger : ledgers) {
			ledgersMapList.add(ledger.toMap());
		}
		
		return ledgersMapList;
	}
	
	@RequestMapping(value = "ledger", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addLedgerEntry(@RequestBody Map<String, Object> ledgerMap) throws ParseException,
	        StockOutException {
		
		Ledger ledger = Ledger.fromMap(ledgerMap);
		
		if (ledger.getLocation() != null) {
			ledger.setLocation(Context.getLocationService().getLocationByUuid(ledger.getLocation().getUuid()));
		}
		
		if (ledger.getItem() != null) {
			ledger.setItem(iCareService.getItemByUuid(ledger.getItem().getUuid()));
		}
		
		if (ledger.getLedgerType() != null) {
			ledger.setLedgerType(storeService.getLedgerTypeByUuid(ledger.getLedgerType().getUuid()));
		}
		
		Ledger createdLedger = storeService.saveLedger(ledger);
		
		return createdLedger.toMap();
	}
	
	@RequestMapping(value = "request", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> postRequisition(@RequestBody Map<String, Object> requisitionMap) {
		
		Requisition requisition = Requisition.fromMap(requisitionMap);
		
		if (requisition.getRequestingLocation() != null) {
			requisition.setRequestingLocation(Context.getLocationService().getLocationByUuid(
			    requisition.getRequestingLocation().getUuid()));
		}
		
		if (requisition.getRequestedLocation() != null) {
			requisition.setRequestedLocation(Context.getLocationService().getLocationByUuid(
			    requisition.getRequestedLocation().getUuid()));
		}
		
		List<RequisitionItem> requisitionItems = new ArrayList<RequisitionItem>();
		for (Map<String, Object> requisitionItemObject : (List<Map<String, Object>>) requisitionMap.get("requisitionItems")) {
			
			RequisitionItem requisitionItem = new RequisitionItem();
			requisitionItem.setItem(iCareService.getItemByUuid(((Map) requisitionItemObject.get("item")).get("uuid")
			        .toString()));
			requisitionItem.setQuantity((Integer) requisitionItemObject.get("quantity"));
			requisitionItem.setRequisition(requisition);
			
			requisitionItems.add(requisitionItem);
			
		}
		
		requisition.setRequisitionItems(requisitionItems);
		
		Requisition createdRequisition = storeService.saveRequest(requisition);
		
		return createdRequisition.toMap();
	}
	
	@RequestMapping(value = "requeststatus", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addRequisitionStatus(@RequestBody Map<String, Object> requisitionStatusMap) {
		
		RequisitionStatus requisitionStatus = new RequisitionStatus().fromMap(requisitionStatusMap);
		
		return storeService.saveRequestStatus(requisitionStatus).toMap();
	}
	
	@RequestMapping(value = "requests", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getRequisitionsByLocation(
	        @RequestParam(required = false) String requestingLocationUuid,
	        @RequestParam(required = false) String requestedLocationUuid) {
		
		if (requestedLocationUuid != null && requestingLocationUuid == null) {
			List<Requisition> requisitions = this.storeService.getRequestsForRequestedLocation(requestedLocationUuid);
			
			List<Map<String, Object>> requisitionsList = new ArrayList<Map<String, Object>>();
			
			for (Requisition requisition : requisitions) {
				requisitionsList.add(requisition.toMap());
			}
			
			return requisitionsList;
			
		}
		
		if (requestingLocationUuid != null && requestedLocationUuid == null) {
			List<Requisition> requisitions = this.storeService.getRequestsByRequestingLocation(requestingLocationUuid);
			
			List<Map<String, Object>> requisitionsList = new ArrayList<Map<String, Object>>();
			
			for (Requisition requisition : requisitions) {
				requisitionsList.add(requisition.toMap());
			}
			
			return requisitionsList;
		}
		
		return null;
		
	}
	
	@RequestMapping(value = "issue", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> postAnIssue(@RequestBody Map<String, Object> issueMap) throws StockOutException,
	        ParseException {
		
		Issue issue = Issue.fromMap(issueMap);
		
		if (issue.getRequisition() != null) {
			issue.setRequisition(storeService.getRequestByUuid(issue.getRequisition().getUuid()));
		}
		
		if (issue.getIssueingLocation() != null) {
			issue.setIssueingLocation(Context.getLocationService().getLocationByUuid(issue.getIssueingLocation().getUuid()));
		}
		
		if (issue.getIssuedLocation() != null) {
			issue.setIssuedLocation(Context.getLocationService().getLocationByUuid(issue.getIssuedLocation().getUuid()));
		}
		
		List<IssueItem> issueItems = new ArrayList<IssueItem>();
		for (Map<String, Object> issueItemObject : (List<Map<String, Object>>) issueMap.get("issueItems")) {
			IssueItem issueItem = new IssueItem();
			issueItem.setItem(iCareService.getItemByUuid(((Map) issueItemObject.get("item")).get("uuid").toString()));
			if (issueItemObject.get("quantity") instanceof Integer) {
				issueItem.setQuantity(((Integer) issueItemObject.get("quantity")).doubleValue());
			}
			if (issueItemObject.get("quantity") instanceof Double) {
				issueItem.setQuantity((Double) issueItemObject.get("quantity"));
			}
			
			if (issueItemObject.get("batch") instanceof String) {
				issueItem.setBatchNo((String) issueItemObject.get("batch"));
			}
			
			if (issueItemObject.get("expiryDate") instanceof String) {
				SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
				if (issueItemObject.get("expiryDate").toString().length() == 10) {
					issueItem.setExpiryDate(dateFormat.parse(issueItemObject.get("expiryDate").toString()));
				} else {
					issueItem.setExpiryDate(dateFormat.parse(issueItemObject.get("expiryDate").toString()
					        .substring(0, issueItemObject.get("expiryDate").toString().indexOf("T"))));
				}
			}
			
			issueItem.setIssue(issue);
			
			issueItems.add(issueItem);
			
		}
		
		issue.setIssueItems(issueItems);
		
		Issue createdIssue = storeService.saveIssue(issue);
		
		return createdIssue.toMap();
	}
	
	@RequestMapping(value = "issuestatus", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> addIssueStatus(@RequestBody Map<String, Object> issueStatusMap) {
		
		IssueStatus issueStatus = new IssueStatus().fromMap(issueStatusMap);
		
		issueStatus.setIssue(storeService.getIssueByUuid(issueStatus.getIssue().getUuid()));
		
		return storeService.saveIssueStatus(issueStatus).toMap();
	}
	
	@RequestMapping(value = "issues", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getIssuesByLocation(@RequestParam(required = false) String issueingLocationUuid,
	        @RequestParam(required = false) String issuedLocationUuid) {
		if (issuedLocationUuid != null && issueingLocationUuid == null) {
			List<Issue> issues = this.storeService.getIssuesForIssuedLocation(issuedLocationUuid);
			
			List<Map<String, Object>> issuesList = new ArrayList<Map<String, Object>>();
			
			for (Issue issue : issues) {
				issuesList.add(issue.toMap());
			}
			
			return issuesList;
			
		}
		
		if (issueingLocationUuid != null && issuedLocationUuid == null) {
			List<Issue> issues = this.storeService.getIssuesByIssueingLocation(issueingLocationUuid);
			
			List<Map<String, Object>> issuesList = new ArrayList<Map<String, Object>>();
			
			for (Issue issue : issues) {
				issuesList.add(issue.toMap());
			}
			
			return issuesList;
		}
		
		return null;
	}
	
	@RequestMapping(value = "receive", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> postAReceipt(@RequestBody Map<String, Object> receiptMap) throws StockOutException,
	        ParseException {
		
		Receipt receipt = new Receipt().fromMap(receiptMap);
		
		if (receipt.getIssue() != null) {
			receipt.setIssue(storeService.getIssueByUuid(receipt.getIssue().getUuid()));
		}
		
		if (receipt.getIssueingLocation() != null) {
			receipt.setIssueingLocation(Context.getLocationService().getLocationByUuid(
			    receipt.getIssueingLocation().getUuid()));
		}
		
		if (receipt.getReceivingLocation() != null) {
			receipt.setReceivingLocation(Context.getLocationService().getLocationByUuid(
			    receipt.getReceivingLocation().getUuid()));
		}
		
		List<ReceiptItem> receiptItems = new ArrayList<ReceiptItem>();
		for (Map<String, Object> receiptItemObject : (List<Map<String, Object>>) receiptMap.get("receiptItems")) {
			
			ReceiptItem receiptItem = new ReceiptItem();
			receiptItem.setItem(iCareService.getItemByUuid(((Map) receiptItemObject.get("item")).get("uuid").toString()));
			if (receiptItemObject.get("quantity") instanceof Integer) {
				receiptItem.setQuantity(((Integer) receiptItemObject.get("quantity")).doubleValue());
			} else if (receiptItemObject.get("quantity") instanceof Integer) {
				receiptItem.setQuantity((Double) receiptItemObject.get("quantity"));
			}
			
			if (receiptItemObject.get("batch") instanceof String) {
				receiptItem.setBatchNo((String) receiptItemObject.get("batch"));
			}
			
			if (receiptItemObject.get("expiryDate") instanceof String) {
				SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
				if (receiptItemObject.get("expiryDate").toString().length() == 10) {
					receiptItem.setExpiryDate(dateFormat.parse(receiptItemObject.get("expiryDate").toString()));
				} else {
					receiptItem.setExpiryDate(dateFormat.parse(receiptItemObject.get("expiryDate").toString()
					        .substring(0, receiptItemObject.get("expiryDate").toString().indexOf("T"))));
				}
			}
			
			receiptItem.setReceipt(receipt);
			receiptItems.add(receiptItem);
		}
		
		receipt.setIssueingLocation(Context.getLocationService().getLocationByUuid(receipt.getIssueingLocation().getUuid()));
		
		receipt.setReceivingLocation(Context.getLocationService()
		        .getLocationByUuid(receipt.getReceivingLocation().getUuid()));
		
		receipt.setReceiptItems(receiptItems);
		
		Receipt createdReceipt = storeService.saveReceive(receipt);
		
		return createdReceipt.toMap();
	}
	
	@RequestMapping(value = "receipts", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getReceiptsByLocation(@RequestParam(required = false) String issueingLocationUuid,
	        @RequestParam(required = false) String receivingLocationUuid) {
		if (issueingLocationUuid != null && receivingLocationUuid == null) {
			List<Receipt> receipts = this.storeService.getReceiptsByIssueingLocation(issueingLocationUuid);
			
			List<Map<String, Object>> receiptsList = new ArrayList<Map<String, Object>>();
			
			for (Receipt receipt : receipts) {
				receiptsList.add(receipt.toMap());
			}
			
			return receiptsList;
			
		}
		
		if (receivingLocationUuid != null && issueingLocationUuid == null) {
			List<Receipt> receipts = this.storeService.getReceiptsForReceivingLocation(receivingLocationUuid);
			
			List<Map<String, Object>> receiptsList = new ArrayList<Map<String, Object>>();
			
			for (Receipt receipt : receipts) {
				receiptsList.add(receipt.toMap());
			}
			
			return receiptsList;
		}
		
		return null;
	}
	
	@RequestMapping(value = "stock", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> listAllStockStatus(@RequestParam(required = false) String locationUuid,
	        @RequestParam(required = false) String q, @RequestParam(defaultValue = "100") Integer limit,
	        @RequestParam(defaultValue = "0") Integer startIndex, @RequestParam(required = false) String conceptClassName) {
		
		List<Stock> stocksStatus;
		
		if (locationUuid != null) {
			stocksStatus = this.storeService.getStockByLocation(locationUuid, q, startIndex, limit, conceptClassName);
		} else {
			stocksStatus = this.storeService.getAllStockStatusMetrics();
		}
		
		List<Map<String, Object>> stockStatusResponse = new ArrayList<Map<String, Object>>();
		for (Stock stock : stocksStatus) {
			stockStatusResponse.add(stock.toMap());
		}
		return stockStatusResponse;
	}
	
	@RequestMapping(value = "item/{itemUuid}/stock", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getItemStockStatus(@PathVariable("itemUuid") String itemUuid,
	        @RequestParam(required = false) String locationUuid) {
		
		List<Stock> stockStatus;
		if (locationUuid != null) {
			stockStatus = storeService.getStockByItemAndLocation(itemUuid, locationUuid);
		} else {
			stockStatus = storeService.getItemStockMetrics(itemUuid);
		}
		
		List<Map<String, Object>> stockStatusResponse = new ArrayList<Map<String, Object>>();
		for (Stock stock : stockStatus) {
			stockStatusResponse.add(stock.toMap());
		}
		return stockStatusResponse;
	}
	
	@RequestMapping(value = "prescription/{drugOrderUuid}/dispense", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> dispense(@PathVariable("drugOrderUuid") String drugOrderUuid,
	        @RequestBody Map<String, Object> orderObject) {
		OrderStatus orderStatus = storeService.dispense(drugOrderUuid, (String) orderObject.get("location"),
		    (String) orderObject.get("location"));
		return orderStatus.toMap();
	}
	
	@RequestMapping(value = "drugOrder/{drugOrderUuid}/dispense", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> dispenseDrug(@PathVariable("drugOrderUuid") String drugOrderUuid,
	        @RequestBody Map<String, Object> orderObject) {
		OrderStatus orderStatus = storeService.dispenseDrug(drugOrderUuid, (String) orderObject.get("location"),
		    (String) orderObject.get("location"));
		return orderStatus.toMap();
	}
	
	@RequestMapping(value = "orderStatus/{visitUuid}", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> orderStatus(@PathVariable("visitUuid") String visitUuid) {
		List<OrderStatus> orderStatuses = storeService.getOrderStatus(visitUuid);
		List<Map<String, Object>> stockStatusResponse = new ArrayList<Map<String, Object>>();
		for (OrderStatus orderStatus : orderStatuses) {
			stockStatusResponse.add(orderStatus.toMap());
		}
		return stockStatusResponse;
	}
	
	@RequestMapping(value = "drug/{drugUuid}/stock", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getDrugStockStatus(@PathVariable("drugUuid") String drugUuid,
	        @RequestParam(required = false) String locationUuid) {
		
		List<Stock> stockStatus;
		if (locationUuid != null) {
			stockStatus = storeService.getStockByDrugAndLocation(drugUuid, locationUuid);
		} else {
			stockStatus = storeService.getDrugStockMetrics(drugUuid);
		}
		
		List<Map<String, Object>> stockStatusResponse = new ArrayList<Map<String, Object>>();
		for (Stock stock : stockStatus) {
			stockStatusResponse.add(stock.toMap());
		}
		return stockStatusResponse;
	}
	
	@RequestMapping(value = "stockout", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getItemsStockedOut(
	        @RequestParam(required = false, value = "location") String locationUuid,
	        @RequestParam(defaultValue = "100") Integer limit, @RequestParam(defaultValue = "0") Integer startIndex) {
		List<Item> stockObjects = null;
		if (locationUuid != null) {
			stockObjects = storeService.getStockoutByLocation(locationUuid);
		} else {
			stockObjects = storeService.getStockout();
		}
		List<Map<String, Object>> stockStatusResponse = new ArrayList<Map<String, Object>>();
		for (Item item : stockObjects) {
			stockStatusResponse.add(item.toMap());
		}
		return stockStatusResponse;
	}
	
	@RequestMapping(value = "metrics", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> getLocationStockMetrics(
	        @RequestParam(required = false, value = "location") String locationUuid) throws Exception {
		
		if (locationUuid != null) {
			return storeService.getLocationStockMetrics(locationUuid);
		} else {
			throw new Exception("location is not provided");
		}
		
	}
}
