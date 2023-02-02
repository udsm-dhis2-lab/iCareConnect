package org.openmrs.module.icare.store.services;

import org.apache.commons.collections.IteratorUtils;
import org.openmrs.*;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.ConceptService;
import org.openmrs.api.OrderEntryException;
import org.openmrs.api.OrderService;
import org.openmrs.api.context.Context;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.billing.models.Prescription;
import org.openmrs.module.icare.core.ICareService;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.core.ListResult;
import org.openmrs.module.icare.core.Pager;
import org.openmrs.module.icare.core.dao.ICareDao;
import org.openmrs.module.icare.store.dao.*;
import org.openmrs.module.icare.store.models.*;
import org.openmrs.module.icare.store.util.StockOutException;
import org.openmrs.module.icare.store.util.TransactionUtil;

import java.util.Date;
import java.util.List;
import java.util.Map;

public class StoreServiceImpl extends BaseOpenmrsService implements StoreService {
	
	ICareDao dao;
	
	LedgerDAO ledgerDAO;
	
	RequisitionDAO requisitionDAO;
	
	IssueDAO issueDAO;
	
	ReceiptDAO receiptDAO;
	
	StockDAO stockDAO;
	
	LedgerTypeDAO ledgerTypeDAO;
	
	RequisitionStatusDAO requisitionStatusDAO;
	
	IssueStatusDAO issueStatusDAO;
	
	TransactionDAO transactionDAO;
	
	ReorderLevelDAO reorderLevelDAO;
	
	StockInvoiceDAO stockInvoiceDAO;
	
	SupplierDAO supplierDAO;
	
	StockInvoiceStatusDAO stockInvoiceStatusDAO;
	
	StockInvoiceItemDAO stockInvoiceItemDAO;
	
	StockInvoiceItemStatusDAO stockInvoiceItemStatusDAO;
	
	public void setLedgerDAO(LedgerDAO ledgerDAO) {
		this.ledgerDAO = ledgerDAO;
	}
	
	public void setRequisitionDAO(RequisitionDAO requisitionDAO) {
		this.requisitionDAO = requisitionDAO;
	}
	
	public void setIssueDAO(IssueDAO issueDAO) {
		this.issueDAO = issueDAO;
	}
	
	public void setReceiptDAO(ReceiptDAO receiptDAO) {
		this.receiptDAO = receiptDAO;
	}
	
	public void setStockDAO(StockDAO stockDAO) {
		this.stockDAO = stockDAO;
	}
	
	public void setLedgerTypeDAO(LedgerTypeDAO ledgerTypeDAO) {
		this.ledgerTypeDAO = ledgerTypeDAO;
	}
	
	public void setDao(ICareDao dao) {
		this.dao = dao;
	}
	
	public void setRequisitionStatusDAO(RequisitionStatusDAO requisitionStatusDAO) {
		this.requisitionStatusDAO = requisitionStatusDAO;
	}
	
	public void setIssueStatusDAO(IssueStatusDAO issueStatusDAO) {
		this.issueStatusDAO = issueStatusDAO;
	}
	
	public void setTransactionDAO(TransactionDAO transactionDAO) {
		this.transactionDAO = transactionDAO;
	}
	
	public void setReorderLevelDAO(ReorderLevelDAO reorderLevelDAO) {
		this.reorderLevelDAO = reorderLevelDAO;
	}
	
	public void setStockInvoiceDAO(StockInvoiceDAO stockInvoiceDAO) {
		this.stockInvoiceDAO = stockInvoiceDAO;
	}
	
	public void setSupplierDAO(SupplierDAO supplierDAO) {
		this.supplierDAO = supplierDAO;
	}
	
	public void setStockInvoiceStatusDAO(StockInvoiceStatusDAO stockInvoiceStatusDAO) {
		this.stockInvoiceStatusDAO = stockInvoiceStatusDAO;
	}
	
	public void setStockInvoiceItemDAO(StockInvoiceItemDAO stockInvoiceItemDAO) {
		this.stockInvoiceItemDAO = stockInvoiceItemDAO;
	}
	
	public void setStockInvoiceItemStatusDAO(StockInvoiceItemStatusDAO stockInvoiceItemStatusDAO) {
		this.stockInvoiceItemStatusDAO = stockInvoiceItemStatusDAO;
	}
	
	@Override
	public ReorderLevel addReorderLevel(ReorderLevel reorderLevel) {
		
		reorderLevel.setItem(this.dao.findByUuid(reorderLevel.getItem().getUuid()));
		
		reorderLevel.setLocation(Context.getLocationService().getLocationByUuid(reorderLevel.getLocation().getUuid()));
		
		return this.reorderLevelDAO.save(reorderLevel);
	}
	
	@Override
	public List<ReorderLevel> getAllReorderLevels() {
		
		return IteratorUtils.toList(this.reorderLevelDAO.findAll().iterator());
	}
	
	@Override
	public LedgerType addLedgerType(LedgerType ledgerType) {
		return this.ledgerTypeDAO.save(ledgerType);
	}
	
	@Override
	public List<LedgerType> getLedgerTypes() {
		return IteratorUtils.toList(this.ledgerTypeDAO.findAll().iterator());
	}
	
	@Override
	public List<Ledger> listLedgerEntries() {
		
		return IteratorUtils.toList(this.ledgerDAO.findAll().iterator());
		
	}
	
	@Override
	public Ledger saveLedger(Ledger ledger) throws StockOutException {
		
		Ledger ledgerToSave = ledger;
		
		if (ledger.getLedgerType() != null) {
			ledgerToSave.setLedgerType(this.ledgerTypeDAO.findByUuid(ledger.getLedgerType().getUuid()));
		}
		ledgerToSave.setRemarks(ledger.getRemarks());
		ledgerToSave.setExpiryDate(ledger.getExpiryDate());
		ledgerToSave.setBatchNo(ledger.getBatchNo());
		if (ledger.getItem() != null) {
			ledgerToSave.setItem(this.dao.findByUuid(ledger.getItem().getUuid()));
		}
		TransactionUtil.operateOnStock(ledger.getLedgerType().getOperation(), ledger);
		return this.ledgerDAO.save(ledger);
		
	}
	
	@Override
	public Stock getStockByItemBatchLocation(Item item, String batchNo, Date expiryDate, Location location) {
		return this.stockDAO.getStockByItemBatchExpDateLocation(item.getUuid(), batchNo, expiryDate, location.getUuid());
	}
	
	@Override
	public List<Stock> getStockByItemLocation(Item item, Location location) {
		return this.stockDAO.getStockByItemLocation(item.getUuid(), location.getUuid());
	}
	
	@Override
	public Requisition saveRequest(Requisition requisition) {
		
		this.requisitionDAO.save(requisition);
		
		return requisition;
	}
	
	@Override
	public RequisitionStatus saveRequestStatus(RequisitionStatus requisitionStatus) {
		
		Requisition requisition = this.getRequestByUuid(requisitionStatus.getRequisition().getUuid());
		
		requisitionStatus.setRequisition(requisition);
		
		return this.requisitionStatusDAO.save(requisitionStatus);
		
	}
	
	@Override
	public List<RequisitionStatus> getRequisitionStatuses() {
		return IteratorUtils.toList(this.requisitionStatusDAO.findAll().iterator());
	}
	
	@Override
	public ListResult<Requisition> getRequestsByRequestingLocation(String requestingLocationUuid, Pager pager,
	        RequisitionStatus.RequisitionStatusCode status) {
		
		ListResult<Requisition> requisitions = this.requisitionDAO.getRequisitionsByRequestingLocation(
		    requestingLocationUuid, pager, status);
		
		for (Requisition requisition : requisitions.getResults()) {
			List<RequisitionStatus> requisitionStatuses = this.requisitionStatusDAO.getStatusesByRequisition(requisition
			        .getUuid());
			
			requisition.setRequisitionStatuses(requisitionStatuses);
		}
		
		return requisitions;
		
	}
	
	@Override
	public ListResult<Requisition> getRequestsForRequestedLocation(String requestedLocationUuid, Pager pager,
	        RequisitionStatus.RequisitionStatusCode status) {
		
		ListResult<Requisition> requisitions = this.requisitionDAO.getRequisitionsByRequestedLocation(requestedLocationUuid,
		    pager, status);
		
		for (Requisition requisition : requisitions.getResults()) {
			List<RequisitionStatus> requisitionStatuses = this.requisitionStatusDAO.getStatusesByRequisition(requisition
			        .getUuid());
			
			requisition.setRequisitionStatuses(requisitionStatuses);
		}
		
		return requisitions;
		
	}
	
	@Override
	public Requisition getRequestByUuid(String requisitionUuid) {
		
		Requisition requisition = this.requisitionDAO.findByUuid(requisitionUuid);
		
		List<RequisitionStatus> requisitionStatuses = this.requisitionStatusDAO.getStatusesByRequisition(requisition
		        .getUuid());
		
		requisition.setRequisitionStatuses(requisitionStatuses);
		
		return requisition;
	}
	
	@Override
	public Issue saveIssue(Issue issue) throws StockOutException {
		
		for (IssueItem issueItem : issue.getIssueItems()) {
			TransactionUtil.operateOnStock("-", issueItem);
		}
		Issue newIssue = this.issueDAO.save(issue);
		IssueStatus issueStatus = new IssueStatus();
		issueStatus.setIssue(newIssue);
		issueStatus.setRemarks("Items have been issued");
		issueStatus.setStatus(IssueStatus.IssueStatusCode.ISSUED);
		this.saveIssueStatus(issueStatus);
		if (newIssue.getRequisition() != null) {
			RequisitionStatus requisitionStatus = new RequisitionStatus();
			requisitionStatus.setRemarks("Items have been received");
			requisitionStatus.setRequisition(newIssue.getRequisition());
			requisitionStatus.setStatus(RequisitionStatus.RequisitionStatusCode.ISSUED);
			this.saveRequestStatus(requisitionStatus);
		}
		return newIssue;
		
	}
	
	@Override
	public IssueStatus saveIssueStatus(IssueStatus issueStatus) {
		
		return this.issueStatusDAO.save(issueStatus);
		
	}
	
	@Override
	public List<Issue> getIssuesByIssueingLocation(String issueingLocationUuid) {
		
		List<Issue> issues = this.issueDAO.getIssuesByIssueingLocation(issueingLocationUuid);
		
		for (Issue issue : issues) {
			
			List<IssueStatus> issueStatuses = this.issueStatusDAO.getAllByIssue(issue.getUuid());
			
			issue.setIssueStatuses(issueStatuses);
		}
		
		return issues;
		
	}
	
	@Override
	public List<Issue> getIssuesForIssuedLocation(String issuedLocationUuid) {
		
		List<Issue> issues = this.issueDAO.getIssuesByIssuedLocation(issuedLocationUuid);
		for (Issue issue : issues) {
			
			List<IssueStatus> issueStatuses = this.issueStatusDAO.getAllByIssue(issue.getUuid());
			
			issue.setIssueStatuses(issueStatuses);
		}
		
		return issues;
	}
	
	@Override
	public List<IssueStatus> getIssueStatuses() {
		return IteratorUtils.toList(this.issueStatusDAO.findAll().iterator());
	}
	
	@Override
	public Receipt saveReceive(Receipt receipt) throws StockOutException {
		
		if (receipt.getIssue() != null) {
			receipt.setIssue(this.issueDAO.findByUuid(receipt.getIssue().getUuid()));
		}
		for (ReceiptItem receiptItem : receipt.getReceiptItems()) {
			TransactionUtil.operateOnStock("+", receiptItem);
		}
		Receipt newReceipt = this.receiptDAO.save(receipt);
		if (receipt.getIssue() != null) {
			IssueStatus issueStatus = new IssueStatus();
			issueStatus.setIssue(receipt.getIssue());
			issueStatus.setRemarks("Items have been received");
			issueStatus.setStatus(IssueStatus.IssueStatusCode.RECEIVED);
			this.saveIssueStatus(issueStatus);
			if (receipt.getIssue().getRequisition() != null) {
				RequisitionStatus requisitionStatus = new RequisitionStatus();
				requisitionStatus.setRemarks("Items have been received");
				requisitionStatus.setRequisition(receipt.getIssue().getRequisition());
				requisitionStatus.setStatus(RequisitionStatus.RequisitionStatusCode.RECEIVED);
				this.saveRequestStatus(requisitionStatus);
			}
		}
		return newReceipt;
	}
	
	@Override
	public List<Receipt> getReceiptsByIssueingLocation(String issueingLocationUuid) {
		
		return this.receiptDAO.getReceiptsByIssueingLocation(issueingLocationUuid);
		
	}
	
	@Override
	public List<Receipt> getReceiptsForReceivingLocation(String receivingLocationUuid) {
		
		return this.receiptDAO.getReceiptsByReceivingLocation(receivingLocationUuid);
		
	}
	
	@Override
	public List<Stock> getAllStockStatusMetrics() {
		return IteratorUtils.toList(this.stockDAO.findAll().iterator());
	}
	
	@Override
	public List<Stock> getStockByLocation(String locationUuid, String search, Integer startIndex, Integer limit,
	        String conceptClassName) {
		
		return this.stockDAO.getStockByLocation(locationUuid, search, startIndex, limit, conceptClassName);
	}
	
	@Override
	public List<Item> getStockout() {
		return this.stockDAO.getStockedOut();
	}
	
	@Override
	public List<Stock> getItemStockMetrics(String itemUuid) {
		return this.stockDAO.getStockByItemId(itemUuid);
	}
	
	@Override
	public List<Stock> getDrugStockMetrics(String drugUuid) {
		return this.stockDAO.getStockByDrugId(drugUuid);
	}
	
	@Override
	public OrderStatus dispense(String drugUuid, String locationUuid, String remarks) {
		OrderService orderService = Context.getOrderService();
		List<OrderStatus> orderStatuses = this.stockDAO.getOrderStatusByOrderUuid(drugUuid);
		for (OrderStatus orderStatus : orderStatuses) {
			if (orderStatus.getStatus() == OrderStatus.OrderStatusCode.DISPENSED) {
				throw new OrderEntryException("Order is already dispensed");
			}
		}
		Prescription savedOrder = (Prescription) orderService.getOrderByUuid(drugUuid);
		
		//Item item = orderMetaData.getItemPrice().getItem();
		ICareService iCareService = Context.getService(ICareService.class);
		Item item = iCareService.getItemByDrugUuid(savedOrder.getDrug().getUuid());
		
		List<Stock> stockList = this.getStockByItemAndLocation(item.getUuid(), locationUuid);
		AdministrationService administrationService = Context.getAdministrationService();
		String stockEnabled = administrationService.getGlobalProperty(ICareConfig.STOCK_ENABLE);
		
		if (!(stockEnabled != null && stockEnabled.equals("false"))) {
			
			if (stockList.get(0).getQuantity() < savedOrder.getQuantity()) {
				throw new StockOutException(item.getDisplayString() + " is stocked out.");
			}
			Double totalQuantity = savedOrder.getQuantity();
			for (Stock stock : stockList) {
				if (totalQuantity == 0.0) {
					break;
				}
				Double quantityToDeduct;
				if (totalQuantity > stock.getQuantity()) {
					quantityToDeduct = stock.getQuantity();
				} else {
					quantityToDeduct = totalQuantity;
				}
				StockableItem stockableItem = new StockableItem();
				stockableItem.setBatch(stock.getBatch());
				stockableItem.setExpiryDate(stock.getExpiryDate());
				stockableItem.setItem(item);
				stockableItem.setLocation(Context.getLocationService().getLocationByUuid(locationUuid));
				stockableItem.setQuantity(quantityToDeduct);
				TransactionUtil.deductStock(stockableItem);
				totalQuantity -= quantityToDeduct;
			}
		}
		OrderStatus orderStatus = new OrderStatus();
		orderStatus.setOrder(savedOrder);
		orderStatus.setStatus(OrderStatus.OrderStatusCode.DISPENSED);
		orderStatus.setRemarks(remarks);
		
		return this.stockDAO.saveOrderStatus(orderStatus);
	}
	
	@Override
	public OrderStatus dispenseDrug(String drugUuid, String locationUuid, String remarks) {
		OrderService orderService = Context.getOrderService();
		List<OrderStatus> orderStatuses = this.stockDAO.getOrderStatusByOrderUuid(drugUuid);
		for (OrderStatus orderStatus : orderStatuses) {
			if (orderStatus.getStatus() == OrderStatus.OrderStatusCode.DISPENSED) {
				throw new OrderEntryException("Order is already dispensed");
			}
		}
		Order savedOrder = orderService.getOrderByUuid(drugUuid);
		
		if (savedOrder instanceof Prescription) {
			Prescription prescription = (Prescription) savedOrder;
			ICareService iCareService = Context.getService(ICareService.class);
			Item item = iCareService.getItemByDrugUuid(prescription.getDrug().getUuid());
			
			List<Stock> stockList = this.getStockByItemAndLocation(item.getUuid(), locationUuid);
			AdministrationService administrationService = Context.getAdministrationService();
			String stockEnabled = administrationService.getGlobalProperty(ICareConfig.STOCK_ENABLE);
			
			if (!(stockEnabled != null && stockEnabled.equals("false"))) {
				if (stockList.size() == 0) {
					throw new StockOutException(item.getDisplayString() + " is stocked out.");
				}
				Double totalQuantity = prescription.getQuantity();
				for (Stock stock : stockList) {
					if (totalQuantity == 0.0) {
						break;
					}
					Double quantityToDeduct;
					if (totalQuantity > stock.getQuantity()) {
						quantityToDeduct = stock.getQuantity();
					} else {
						quantityToDeduct = totalQuantity;
					}
					StockableItem stockableItem = new StockableItem();
					stockableItem.setBatch(stock.getBatch());
					stockableItem.setExpiryDate(stock.getExpiryDate());
					stockableItem.setItem(item);
					stockableItem.setLocation(Context.getLocationService().getLocationByUuid(locationUuid));
					stockableItem.setQuantity(quantityToDeduct);
					TransactionUtil.deductStock(stockableItem);
					totalQuantity -= quantityToDeduct;
				}
			}
			OrderStatus orderStatus = new OrderStatus();
			orderStatus.setOrder(prescription);
			orderStatus.setStatus(OrderStatus.OrderStatusCode.DISPENSED);
			orderStatus.setRemarks(remarks);
			return this.stockDAO.saveOrderStatus(orderStatus);
		} else {
			DrugOrder drugOrder = (DrugOrder) savedOrder;
			ICareService iCareService = Context.getService(ICareService.class);
			Item item = iCareService.getItemByDrugUuid(drugOrder.getDrug().getUuid());
			
			List<Stock> stockList = this.getStockByItemAndLocation(item.getUuid(), locationUuid);
			AdministrationService administrationService = Context.getAdministrationService();
			String stockEnabled = administrationService.getGlobalProperty(ICareConfig.STOCK_ENABLE);
			
			if (!(stockEnabled != null && stockEnabled.equals("false"))) {
				if (stockList.size() == 0) {
					throw new StockOutException(item.getDisplayString() + " is stocked out.");
				}
				Double totalQuantity = drugOrder.getQuantity();
				for (Stock stock : stockList) {
					if (totalQuantity == 0.0) {
						break;
					}
					Double quantityToDeduct;
					if (totalQuantity > stock.getQuantity()) {
						quantityToDeduct = stock.getQuantity();
					} else {
						quantityToDeduct = totalQuantity;
					}
					StockableItem stockableItem = new StockableItem();
					stockableItem.setBatch(stock.getBatch());
					stockableItem.setExpiryDate(stock.getExpiryDate());
					stockableItem.setItem(item);
					stockableItem.setLocation(Context.getLocationService().getLocationByUuid(locationUuid));
					stockableItem.setQuantity(quantityToDeduct);
					TransactionUtil.deductStock(stockableItem);
					totalQuantity -= quantityToDeduct;
				}
			}
			OrderStatus orderStatus = new OrderStatus();
			orderStatus.setOrder(drugOrder);
			orderStatus.setStatus(OrderStatus.OrderStatusCode.DISPENSED);
			orderStatus.setRemarks(remarks);
			return this.stockDAO.saveOrderStatus(orderStatus);
		}
	}
	
	public Supplier getSupplierByUuid(String supplierUuid) {
		return supplierDAO.findByUuid(supplierUuid);
	}
	
	@Override
	public ListResult<StockInvoice> getStockInvoices(Pager pager) {
		return stockInvoiceDAO.getStockInvoices(pager);
	}
	
	@Override
	public Supplier saveSupplier(Supplier supplier) {
		return supplierDAO.save(supplier);
	}
	
	@Override
	public List<Supplier> getSuppliers(Integer startIndex, Integer limit) {
		return supplierDAO.getSuppliers(startIndex, limit);
	}
	
	public StockInvoice getStockInvoicebyUuid(String stockInvoiceUuid) {
		return stockInvoiceDAO.findByUuid(stockInvoiceUuid);
	}
	
	@Override
	public StockInvoiceStatus saveStockInvoiceStatus(StockInvoiceStatus stockInvoiceStatus) throws Exception {
		StockInvoice stockInvoice = this.getStockInvoicebyUuid(stockInvoiceStatus.getStockInvoice().getUuid());
		if (stockInvoice == null) {
			throw new Exception(" The stock invoice with uuid " + stockInvoiceStatus.getStockInvoice().getUuid()
			        + " does not exist");
		}
		stockInvoiceStatus.setStockInvoice(stockInvoice);
		return stockInvoiceStatusDAO.save(stockInvoiceStatus);
	}
	
	@Override
	public List<StockInvoiceStatus> getStockInvoicesStatus(Integer startIndex, Integer limit, String q) {
		return stockInvoiceStatusDAO.getStockInvoicesStatus(startIndex, limit, q);
	}
	
	@Override
	public StockInvoice updateStockInvoice(StockInvoice stockInvoice) throws Exception {
		
		if (stockInvoice.getSupplier() != null) {
			Supplier supplier = this.getSupplierByUuid(stockInvoice.getSupplier().getUuid());
			if (supplier == null) {
				throw new Exception("The supplier with uuid " + stockInvoice.getSupplier().getUuid() + " does not exist");
			}
			stockInvoice.setSupplier(supplier);
		}
		StockInvoice existingStockInvoice = new StockInvoice();
		if (stockInvoice.getInvoiceNumber() != null || stockInvoice.getSupplier() != null) {
			existingStockInvoice = this.stockInvoiceDAO.updateStockInvoice(stockInvoice);
		}
		if (stockInvoice.getStockInvoiceItems() != null) {
			existingStockInvoice = this.stockInvoiceDAO.findByUuid(stockInvoice.getUuid());
			for (StockInvoiceItem stockInvoiceItem : stockInvoice.getStockInvoiceItems()) {
				stockInvoiceItem.setStockInvoice(existingStockInvoice);
				this.saveStockInvoiceItem(stockInvoiceItem);
			}
			List<StockInvoiceItem> savedStockInvoiceItems = stockInvoice.getStockInvoiceItems();
			existingStockInvoice.setStockInvoiceItems(savedStockInvoiceItems);
		}

		if(stockInvoice.getStockInvoiceStatuses() != null) {
			for (StockInvoiceStatus stockInvoiceStatus : stockInvoice.getStockInvoiceStatuses()) {
				//TODO Limit status to check the ones available in enums
				existingStockInvoice = this.stockInvoiceDAO.findByUuid(stockInvoice.getUuid());
				stockInvoiceStatus.setRemarks(stockInvoiceStatus.getStatus());
				stockInvoiceStatus.setStockInvoice(existingStockInvoice);
				this.saveStockInvoiceStatus(stockInvoiceStatus);
			}
		}
		
		return existingStockInvoice;
	}
	
	@Override
	public StockInvoice getStockInvoice(String stockInvoiceUuid) {
		return stockInvoiceDAO.findByUuid(stockInvoiceUuid);
	}
	
	@Override
	public StockInvoiceItem updateStockInvoiceItem(StockInvoiceItem stockInvoiceItem) throws Exception {
		if (stockInvoiceItem.getItem() != null) {
			ICareService iCareService = Context.getService(ICareService.class);
			Item item = iCareService.getItemByUuid(stockInvoiceItem.getItem().getUuid());
			if (item == null) {
				throw new Exception("The item with uuid " + stockInvoiceItem.getItem().getUuid() + " does not exist");
			}
			stockInvoiceItem.setItem(item);
			if(stockInvoiceItem.getStockInvoiceItemStatuses() != null) {
				for (StockInvoiceItemStatus stockInvoiceItemStatus : stockInvoiceItem.getStockInvoiceItemStatuses()) {
					stockInvoiceItemStatus.setStockInvoiceItem(stockInvoiceItem);
					this.saveStockInvoiceItemStatus(stockInvoiceItemStatus);
				}
			}
		}
		return stockInvoiceItemDAO.updateStockInvoiceItem(stockInvoiceItem);
	}
	
	@Override
	public StockInvoiceItem getStockInvoiceItem(String stockInvoiceItemUuid) {
		return stockInvoiceItemDAO.findByUuid(stockInvoiceItemUuid);
	}
	
	@Override
	public StockInvoiceItem saveStockInvoiceItem(StockInvoiceItem stockInvoiceItem) throws Exception {
		Item item = dao.findByUuid(stockInvoiceItem.getItem().getUuid());
		if (item == null) {
			throw new Exception("The item with uuid" + stockInvoiceItem.getItem().getUuid() + " does not exist");
		}
		
		ConceptService conceptService = Context.getService(ConceptService.class);
		Concept uom = conceptService.getConceptByUuid(stockInvoiceItem.getUom().getUuid());
		if (uom == null) {
			throw new Exception("The unit of measurement with uuid" + stockInvoiceItem.getUom().getUuid()
			        + " does not exist");
		}
		
		stockInvoiceItem.setItem(item);
		stockInvoiceItem.setUom(uom);
		
		StockInvoiceItem savedStockInvoiceItem = stockInvoiceItemDAO.save(stockInvoiceItem);
		
		for (StockInvoiceItemStatus stockInvoiceItemStatus : stockInvoiceItem.getStockInvoiceItemStatuses()) {
			stockInvoiceItemStatus.setStockInvoiceItem(savedStockInvoiceItem);
			this.saveStockInvoiceItemStatus(stockInvoiceItemStatus);
		}
		
		return savedStockInvoiceItem;
	}
	
	@Override
	public StockInvoiceItemStatus saveStockInvoiceItemStatus(StockInvoiceItemStatus stockInvoiceItemStatus) {
		return this.stockInvoiceItemStatusDAO.save(stockInvoiceItemStatus);
	}
	
	@Override
	public StockInvoice saveStockInvoice(StockInvoice stockInvoice) throws Exception {
		
		Supplier supplier = this.getSupplierByUuid(stockInvoice.getSupplier().getUuid());
		if (supplier == null) {
			throw new Exception("The supplier with uuid " + stockInvoice.getSupplier().getUuid() + " does not exist");
		}
		stockInvoice.setSupplier(supplier);
		StockInvoice savedStockInvoice = this.stockInvoiceDAO.save(stockInvoice);
		
		for (StockInvoiceItem stockInvoiceItem : savedStockInvoice.getStockInvoiceItems()) {
			this.saveStockInvoiceItem(stockInvoiceItem);
		}
		
		for (StockInvoiceStatus stockInvoiceStatus : stockInvoice.getStockInvoiceStatuses()) {
			//TODO Limit status to check the ones available in enums
			
			stockInvoiceStatus.setRemarks(stockInvoiceStatus.getStatus());
			stockInvoiceStatus.setStockInvoice(savedStockInvoice);
			this.saveStockInvoiceStatus(stockInvoiceStatus);
		}
		return savedStockInvoice;
	}
	
	@Override
	public List<OrderStatus> getOrderStatus(String visitUuid) {
		return this.stockDAO.getOrderStatusByVisit(visitUuid);
	}
	
	@Override
	public List<OrderStatus> getOrderStatusByOrderUuid(String orderUuid) {
		return this.stockDAO.getOrderStatusByOrderUuid(orderUuid);
	}
	
	@Override
	public List<Stock> getStockByItemAndLocation(String itemUuid, String locationUuid) {
		return this.stockDAO.getStockByItemAndLocation(itemUuid, locationUuid);
	}
	
	@Override
	public List<Stock> getStockByItemAndLocations(String itemUuid, List<String> locationUuids) {
		return this.stockDAO.getStockByItemAndLocations(itemUuid, locationUuids);
	}
	
	@Override
	public List<Stock> getStockByDrugAndLocation(String itemUuid, String locationUuid) {
		return this.stockDAO.getStockByDrugAndLocation(itemUuid, locationUuid);
	}
	
	@Override
	public LedgerType getLedgerTypeByUuid(String ledgerTypeUuid) {
		return this.ledgerTypeDAO.findByUuid(ledgerTypeUuid);
	}
	
	@Override
	public Ledger getLedgerByUuid(String ledgerUuid) {
		return this.ledgerDAO.findByUuid(ledgerUuid);
	}
	
	@Override
	public Issue getIssueByUuid(String issueUuid) {
		return this.issueDAO.findByUuid(issueUuid);
	}
	
	@Override
	public List<Item> getStockoutByLocation(String locationUuid, String q, Integer startIndex, Integer limit,
	        String conceptClassName) {
		return this.stockDAO.getStockedOutByLocation(locationUuid, q, startIndex, limit, conceptClassName);
	}
	
	@Override
	public Stock saveStock(Stock stock) {
		return this.stockDAO.save(stock);
	}
	
	@Override
	public Transaction saveTransaction(Transaction transaction) {
		return this.transactionDAO.save(transaction);
	}
	
	@Override
	public List<Transaction> getTransactionsByLocationUuid(String locationUuid) {
		return this.transactionDAO.getTransactionsByLocationUuid(locationUuid);
	}
	
	@Override
	public Map<String, Object> getLocationStockMetrics(String locationUuid) {
		return this.stockDAO.getStockMetricsByLocation(locationUuid);
	}
	
	@Override
	public void onStartup() {
		
	}
	
	@Override
	public void onShutdown() {
		
	}
}
