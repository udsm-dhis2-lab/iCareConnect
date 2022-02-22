package org.openmrs.module.icare.store.util;

import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.store.models.Stock;
import org.openmrs.module.icare.store.models.Transaction;
import org.openmrs.module.icare.store.services.StoreService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

        System.out.println(stockable.getItem());
        System.out.println(stockable.getBatchNo());
        System.out.println(stockable.getExpiryDate());
        System.out.println(stockable.getLocation());


        Stock stock = null;
//        Stock stock = storeService.getStockByItemBatchLocation(stockable.getItem(), stockable.getBatchNo(),
//                stockable.getExpiryDate(), stockable.getLocation());

        System.out.println("testing");
        List<Transaction> transactionList = new ArrayList<>();
        List<Stock> stockList = storeService.getStockByItemLocation(stockable.getItem(), stockable.getLocation());
        List<Map<String, Object>> stockListMap = new ArrayList<>();
        double totalStock = 0.00;

        for (Stock stockItem : stockList) {
            stockListMap.add(stockItem.toMap());
            totalStock = totalStock + stockItem.getQuantity();
        }

        AdministrationService administrationService = Context.getAdministrationService();
        String allowNegativeStock = administrationService.getGlobalProperty(ICareConfig.ALLOW_NEGATIVE_STOCK);

        System.out.println(stockListMap.toString());

        // check if stock to issue is more than total stock
        if (totalStock - stockable.getQuantity() < 0) {
            // if diffentnce < 0 throw execption
            if (allowNegativeStock == null || allowNegativeStock.equals("false")) {
                throw new StockOutException("Negative Stock is not allowed");
            }
        } else {

            double stockNeed = stockable.getQuantity();

            System.out.println("stockList size is : " + stockList.size());
            // if difference >= 0 go through stocks
            for (int i = 0; i <= stockList.size() - 1; i++) {

                System.out.println("iteration : " + i);
                System.out.println("stcoke need is : " + stockNeed);
                // for each stock check if stock need to be deducted
                if (stockNeed > 0) {

                    // should deduct all stock
                    if (stockList.get(i).getQuantity() - stockNeed < 0) {


                        System.out.println("stock item is not enough, deduct all");

                        // deduct to 0
                        transactionList.add(i, new Transaction());
                        transactionList.get(i).setItem(stockable.getItem());
                        transactionList.get(i).setLocation(stockable.getLocation());
                        transactionList.get(i).setBatchNo(stockList.get(i).getBatch());
                        transactionList.get(i).setExpireDate(stockable.getExpiryDate());
                        transactionList.get(i).setCurrentQuantity(0.0);
                        transactionList.get(i).setPreviousQuantity(stockList.get(i).getQuantity());

                        stockNeed = stockNeed -stockList.get(i).getQuantity();

                        stockList.get(i).setQuantity(0.0);

                        storeService.saveStock(stockList.get(i));
                        storeService.saveTransaction(transactionList.get(i));




                    } else {

                        System.out.println("stock item is enough");
                        // deduction operations and transactions
                        transactionList.add(i, new Transaction());
                        transactionList.get(i).setItem(stockable.getItem());
                        transactionList.get(i).setLocation(stockable.getLocation());
                        transactionList.get(i).setBatchNo(stockList.get(i).getBatch());
                        transactionList.get(i).setExpireDate(stockable.getExpiryDate());
                        transactionList.get(i).setCurrentQuantity(stockList.get(i).getQuantity() - stockNeed);
                        transactionList.get(i).setPreviousQuantity(stockList.get(i).getQuantity());

                        stockList.get(i).setQuantity(stockList.get(i).getQuantity() - stockNeed);

                        storeService.saveStock(stockList.get(i));
                        storeService.saveTransaction(transactionList.get(i));


                        stockNeed = stockNeed - stockList.get(i).getQuantity();
                    }


                } else {

                    transactionList.add(i, null);
                    // do nothing on this batch stck has already been deducted

                }

            }


        }


//        if (stock == null) {
//            transaction.setPreviousQuantity(0.0);
//            stock = new Stock();
//            stock.setQuantity(0.0);
//            stock.setBatch(stockable.getBatchNo());
//            stock.setExpiryDate(stockable.getExpiryDate());
//            stock.setItem(stockable.getItem());
//            stock.setLocation(stockable.getLocation());
//        } else {
//            transaction.setPreviousQuantity(stock.getQuantity());
//        }
//
//        Double newQuantity = stock.getQuantity() - stockable.getQuantity();
//
//        System.out.println("the quantity : ");
//        System.out.println(newQuantity);

//        AdministrationService administrationService = Context.getAdministrationService();
//        String allowNegativeStock = administrationService.getGlobalProperty(ICareConfig.ALLOW_NEGATIVE_STOCK);
//        if (newQuantity < 0 && (allowNegativeStock == null || allowNegativeStock.equals("false"))) {
//            throw new StockOutException("Negative Stock is not allowed");
//        }
//        transaction.setCurrentQuantity(newQuantity);
//        stock.setQuantity(newQuantity);
//        storeService.saveStock(stock);
//        storeService.saveTransaction(transaction);
    }
	
	public static void operateOnStock(String operation, Stockable stockable) throws StockOutException {
		if (operation.equals("+")) {
			TransactionUtil.addStock(stockable);
		} else if (operation.equals("-")) {
			TransactionUtil.deductStock(stockable);
		}
	}
}
