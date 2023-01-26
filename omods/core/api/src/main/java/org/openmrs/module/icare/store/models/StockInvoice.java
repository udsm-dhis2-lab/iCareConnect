package org.openmrs.module.icare.store.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Entity
@Table(name = "st_stock_invoice")
public class StockInvoice extends BaseOpenmrsData implements java.io.Serializable, JSONConverter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_invoice_id",unique= true, nullable = false)
    private Integer id;

    @Column(name = "invoice_number", length=20)
    private String invoiceNumber;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @Column(name = "receiving_date")
    private Date receivingDate;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "stockInvoice")
    private List<StockInvoiceItem> stockInvoiceItems = new ArrayList<>(0);

    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id =id;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setPurchaseOrder(PurchaseOrder purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public PurchaseOrder getPurchaseOrder() {
        return purchaseOrder;
    }

    public void setReceivingDate(Date receivingDate) {
        this.receivingDate = receivingDate;
    }

    public Date getReceivingDate() {
        return receivingDate;
    }

    public List<StockInvoiceItem> getStockInvoiceItems() {
        return stockInvoiceItems;
    }

    public void setStockInvoiceItems(List<StockInvoiceItem> stockInvoiceItems) {
        this.stockInvoiceItems = stockInvoiceItems;
    }

    public static StockInvoice fromMap(Map<String,Object> stockInvoiceMap) throws ParseException {

        StockInvoice stockInvoice = new StockInvoice();
        stockInvoice.setInvoiceNumber(stockInvoiceMap.get("invoiceNumber").toString());

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        if (stockInvoiceMap.get("receivingDate").toString().length() == 10) {
            stockInvoice.setReceivingDate(dateFormat.parse(stockInvoiceMap.get("receivingDate").toString()));
        } else {
            stockInvoice.setReceivingDate(dateFormat.parse(stockInvoiceMap.get("receivingDate").toString().substring(0, stockInvoiceMap.get("receivingDate").toString().indexOf("T"))));
        }

        Supplier supplier = new Supplier();
        supplier.setUuid(((Map) stockInvoiceMap.get("supplier")).get("uuid").toString());
        stockInvoice.setSupplier(supplier);

        if(stockInvoiceMap.get("purchaseOrder") != null){
            PurchaseOrder purchaseOrder = new PurchaseOrder();
            purchaseOrder.setUuid(((Map)stockInvoiceMap.get("purchaseOrder")).get("uuid").toString());
            stockInvoice.setPurchaseOrder(purchaseOrder);
        }

         return stockInvoice;
    }

    @Override
    public Map<String, Object> toMap() {

        HashMap<String,Object> stockInvoiceObject = new HashMap<String,Object>();
        stockInvoiceObject.put("invoiceNumber",this.getInvoiceNumber());
        stockInvoiceObject.put("receivingDate", this.getReceivingDate());

        if(this.getSupplier() != null){
            Map<String,Object> supplierObject = new HashMap<>();
            supplierObject.put("uuid",this.getSupplier().getUuid());
            supplierObject.put("name", this.getSupplier().getName());
            stockInvoiceObject.put("supplier",supplierObject);
        }

        if(this.purchaseOrder != null){
            Map<String,Object> purchaseOrderObject = new HashMap<String,Object>();
            purchaseOrderObject.put("uuid",this.getPurchaseOrder().getUuid());
            purchaseOrderObject.put("display",this.getPurchaseOrder().getCode());
            stockInvoiceObject.put("purchaseOrder",purchaseOrderObject);
        }

        if (this.getCreator() != null) {
            Map<String, Object> creatorObject = new HashMap<String, Object>();
            creatorObject.put("uuid", this.getCreator().getUuid());
            creatorObject.put("display", this.getCreator().getDisplayString());
            stockInvoiceObject.put("creator", creatorObject);
        }
        return stockInvoiceObject;
    }


}
