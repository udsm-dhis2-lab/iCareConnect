package org.openmrs.module.icare.billing.services.payment.gepg;

public class BillItem {
    private String ItemId;
    private String IsqBillItemId;
    private String BillItemAmt;
    private String EqvAmt;
    private String MiscAmt;
    private String PymtOpt;

    // Constructor
    public BillItem(String ItemId, String IsqBillItemId, String BillItemAmt, String EqvAmt, String MiscAmt, String PymtOpt) {
        this.ItemId = ItemId;
        this.IsqBillItemId = IsqBillItemId;
        this.BillItemAmt = BillItemAmt;
        this.EqvAmt = EqvAmt;
        this.MiscAmt = MiscAmt;
        this.PymtOpt = PymtOpt;
    }

    // Getter Methods
    public String getItemId() {
        return ItemId;
    }

    public String getIsqBillItemId() {
        return IsqBillItemId;
    }

    public String getBillItemAmt() {
        return BillItemAmt;
    }

    public String getEqvAmt() {
        return EqvAmt;
    }

    public String getMiscAmt() {
        return MiscAmt;
    }

    public String getPymtOpt() {
        return PymtOpt;
    }

    // Setter Methods
    public void setItemId(String ItemId) {
        this.ItemId = ItemId;
    }

    public void setIsqBillItemId(String IsqBillItemId) {
        this.IsqBillItemId = IsqBillItemId;
    }

    public void setBillItemAmt(String BillItemAmt) {
        this.BillItemAmt = BillItemAmt;
    }

    public void setEqvAmt(String EqvAmt) {
        this.EqvAmt = EqvAmt;
    }

    public void setMiscAmt(String MiscAmt) {
        this.MiscAmt = MiscAmt;
    }

    public void setPymtOpt(String PymtOpt) {
        this.PymtOpt = PymtOpt;
    }

    @Override
    public String toString() {
        return "BillItem{" +
                "ItemId='" + ItemId + '\'' +
                ", IsqBillItemId='" + IsqBillItemId + '\'' +
                ", BillItemAmt='" + BillItemAmt + '\'' +
                ", EqvAmt='" + EqvAmt + '\'' +
                ", MiscAmt='" + MiscAmt + '\'' +
                ", PymtOpt='" + PymtOpt + '\'' +
                '}';
    }
}
