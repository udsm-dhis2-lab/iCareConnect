package org.openmrs.module.icare.store.util;

import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.store.models.Stock;
import org.openmrs.module.icare.store.models.Transaction;
import org.openmrs.module.icare.store.services.StoreService;

public class TransactionUtil {
	
	public static void addStock(Stockable stockable) {
		Transaction transaction = new Transaction();
		transaction.setItem(stockable.getItem());
		transaction.setLocation(stockable.getLocation());
		transaction.setBatchNo(stockable.getBatchNo());
		transaction.setExpireDate(stockable.getExpiryDate());
		
		StoreService storeService = Context.getService(StoreService.class);
		Stock stock = storeService.getStockByItemBatchLocation(stockable.getItem(), stockable.getBatchNo(),
		    stockable.getExpiryDate(), stockable.getLocation());
		if (stock == null) {
			transaction.setPreviousQuantity(0.0);
			stock = new Stock();
			stock.setQuantity(0.0);
			stock.setBatch(stockable.getBatchNo());
			stock.setExpiryDate(stockable.getExpiryDate());
			stock.setItem(stockable.getItem());
			stock.setLocation(stockable.getLocation());
		} else {
			transaction.setPreviousQuantity(stock.getQuantity());
		}
		Double newQuantity = stockable.getQuantity() + stock.getQuantity();
		transaction.setCurrentQuantity(newQuantity);
		stock.setQuantity(newQuantity);
		
		storeService.saveStock(stock);
		storeService.saveTransaction(transaction);
	}
	
	public static void deductStock(Stockable stockable) throws StockOutException {
		Transaction transaction = new Transaction();
		transaction.setItem(stockable.getItem());
		transaction.setLocation(stockable.getLocation());
		transaction.setBatchNo(stockable.getBatchNo());
		transaction.setExpireDate(stockable.getExpiryDate());
		
		StoreService storeService = Context.getService(StoreService.class);
		Stock stock = storeService.getStockByItemBatchLocation(stockable.getItem(), stockable.getBatchNo(),
		    stockable.getExpiryDate(), stockable.getLocation());
		if (stock == null) {
			transaction.setPreviousQuantity(0.0);
			stock = new Stock();
			stock.setQuantity(0.0);
			stock.setBatch(stockable.getBatchNo());
			stock.setExpiryDate(stockable.getExpiryDate());
			stock.setItem(stockable.getItem());
			stock.setLocation(stockable.getLocation());
		} else {
			transaction.setPreviousQuantity(stock.getQuantity());
		}
		Double newQuantity = stock.getQuantity() - stockable.getQuantity();
		AdministrationService administrationService = Context.getAdministrationService();
		String allowNegativeStock = administrationService.getGlobalProperty(ICareConfig.ALLOW_NEGATIVE_STOCK);
		if (newQuantity < 0 && (allowNegativeStock == null || allowNegativeStock.equals("false"))) {
			throw new StockOutException("Negative Stock is not allowed");
		}
		transaction.setCurrentQuantity(newQuantity);
		stock.setQuantity(newQuantity);
		storeService.saveStock(stock);
		storeService.saveTransaction(transaction);
	}
	
	public static void operateOnStock(String operation, Stockable stockable) throws StockOutException {
		if (operation.equals("+")) {
			TransactionUtil.addStock(stockable);
		} else if (operation.equals("-")) {
			TransactionUtil.deductStock(stockable);
		}
	}
}
