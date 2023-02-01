package org.openmrs.module.icare.store.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openmrs.BaseOpenmrsData;
import org.openmrs.Concept;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "st_stock_invoice_item")
public class StockInvoiceItem extends BaseOpenmrsData implements java.io.Serializable, JSONConverter {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "stock_invoice_item_id", unique = true, nullable = false)
	private Integer id;
	
	@ManyToOne
	@JoinColumn(name = "stock_invoice_id")
	private StockInvoice stockInvoice;
	
	@ManyToOne
	@JoinColumn(name = "item_id")
	private Item item;
	
	@Column(name = "batch_no", length = 30)
	private String batchNo;
	
	@Column(name = "order_quantity")
	private Integer orderQuantity;
	
	@Column(name = "batch_quantity")
	private Integer batchQuantity;
	
	@Column(name = "expiry_date")
	private Date expiryDate;
	
	@ManyToOne
	@JoinColumn(name = "uom")
	private Concept uom;
	
	@Column(name = "unit_price")
	private Double unitPrice;
	
	@Column(name = "amount")
	private Double amount;
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		this.id = id;
	}
	
	public Item getItem() {
		return item;
	}
	
	public void setItem(Item item) {
		this.item = item;
	}
	
	public String getBatchNo() {
		return batchNo;
	}
	
	public void setBatchNo(String batchNo) {
		this.batchNo = batchNo;
	}
	
	public Integer getOrderQuantity() {
		return orderQuantity;
	}
	
	public void setOrderQuantity(Integer orderQuantity) {
		this.orderQuantity = orderQuantity;
	}
	
	public Integer getBatchQuantity() {
		return batchQuantity;
	}
	
	public void setBatchQuantity(Integer batchQuantity) {
		this.batchQuantity = batchQuantity;
	}
	
	public Date getExpiryDate() {
		return expiryDate;
	}
	
	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}
	
	public Concept getUom() {
		return uom;
	}
	
	public void setUom(Concept uom) {
		this.uom = uom;
	}
	
	public Double getUnitPrice() {
		return unitPrice;
	}
	
	public void setUnitPrice(Double unitPrice) {
		this.unitPrice = unitPrice;
	}
	
	public Double getAmount() {
		return amount;
	}
	
	public void setAmount(Double amount) {
		this.amount = amount;
	}
	
	public void setStockInvoice(StockInvoice stockInvoice) {
		this.stockInvoice = stockInvoice;
	}
	
	public StockInvoice getStockInvoice() {
		return stockInvoice;
	}
	
	@Override
    public Map<String, Object> toMap() {

        HashMap<String,Object> invoiceItemObject = new HashMap<>();
        invoiceItemObject.put("batchNo",this.getBatchNo());
        invoiceItemObject.put("orderQuantity",this.getOrderQuantity());
        invoiceItemObject.put("batchQuantity",this.getBatchQuantity());
        invoiceItemObject.put("unitPrice",this.getUnitPrice());
        invoiceItemObject.put("amount",this.getAmount());
        invoiceItemObject.put("expiryDate",this.getExpiryDate());

        HashMap<String,Object> stockInvoiceObject = new HashMap<>();
        stockInvoiceObject.put("uuid",this.stockInvoice.getUuid());
        stockInvoiceObject.put("display",this.stockInvoice.getInvoiceNumber());
        invoiceItemObject.put("stockInvoice",stockInvoiceObject);

        HashMap<String,Object> itemObject = new HashMap<>();
        itemObject.put("uuid",this.getItem().getUuid());
        itemObject.put("display",this.getItem().getDisplayString());
        invoiceItemObject.put("item",itemObject);

        HashMap<String,Object> uomObject = new HashMap<>();
        uomObject.put("uuid",this.getUom().getUuid());
        uomObject.put("display",this.getUom().getDisplayString());
        invoiceItemObject.put("uom",uomObject);
        return invoiceItemObject;
    }
	
	public static StockInvoiceItem fromMap(Map<String, Object> stockInvoiceItemMap) throws ParseException {
		
		StockInvoiceItem stockInvoiceItem = new StockInvoiceItem();
		
		Item item = new Item();
		item.setUuid(((Map) stockInvoiceItemMap.get("item")).get("uuid").toString());
		stockInvoiceItem.setItem(item);
		
		Concept uom = new Concept();
		uom.setUuid(((Map) stockInvoiceItemMap.get("uom")).get("uuid").toString());
		stockInvoiceItem.setUom(uom);
		
		stockInvoiceItem.setBatchNo(stockInvoiceItemMap.get("batchNo").toString());
		stockInvoiceItem.setUnitPrice((Double) stockInvoiceItemMap.get("unitPrice"));
		stockInvoiceItem.setAmount((Double) stockInvoiceItemMap.get("amount"));
		stockInvoiceItem.setBatchQuantity((Integer) stockInvoiceItemMap.get("batchQuantity"));
		stockInvoiceItem.setOrderQuantity((Integer) stockInvoiceItemMap.get("orderQuantity"));
		
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		if (stockInvoiceItemMap.get("expiryDate").toString().length() == 10) {
			stockInvoiceItem.setExpiryDate(dateFormat.parse(stockInvoiceItemMap.get("expiryDate").toString()));
		} else {
			stockInvoiceItem.setExpiryDate(dateFormat.parse(stockInvoiceItemMap.get("expiryDate").toString()
			        .substring(0, stockInvoiceItemMap.get("expiryDate").toString().indexOf("T"))));
		}
		
		//		if(stockInvoiceItemMap.get("stockInvoiceUuid") != null){
		//			StockInvoice stockInvoice = new StockInvoice();
		//			stockInvoice.setUuid(stockInvoiceItemMap.get("stockInvoiceUuid").toString());
		//			stockInvoiceItem.setStockInvoice(stockInvoice);
		//		}
		
		return stockInvoiceItem;
		
	}
}
