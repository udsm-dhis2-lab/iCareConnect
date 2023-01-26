package org.openmrs.module.icare.store.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.Concept;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.core.Item;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name="stock_invoice_item")
public class StockInvoiceItem extends BaseOpenmrsData implements java.io.Serializable, JSONConverter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "stock_invoice_id")
    private StockInvoice stockInvoice;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    @Column(name = "batch_no", length=30)
    private String batchNo;

    @Column(name = "order_quantity")
    private Integer orderQuantity;

    @Column(name = "batch_quantity")
    private Integer batchQuantity;

    @Column(name = "expiry_date")
    private Date expiryDate;

    @Column(name = "uom")
    private Concept uom;

    @Column(name = "unit_price")
    private Integer unitPrice;

    @Column(name = "amount")
    private Integer amount;


    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id =id;
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

    public Integer getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Integer unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
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
        invoiceItemObject.put("invoice",stockInvoiceObject);

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

    public static InvoiceItem fromMap(Map<String,Object> invoiceItemMap){

        InvoiceItem invoiceItem = new InvoiceItem();

        return invoiceItem;

    }
}
