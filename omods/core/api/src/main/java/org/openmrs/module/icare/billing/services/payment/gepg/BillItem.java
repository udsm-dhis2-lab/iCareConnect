package org.openmrs.module.icare.billing.services.payment.gepg;

public class BillItem {
    private String billItemRef;
    private String billItemStatus;
    private String billItemAmt;
    private String billItemEqvAmt;
    private String billItemMiscAmt;
    private String billItemCc;

    public BillItem(String billItemRef, String billItemStatus, String billItemAmt, String billItemEqvAmt, String billItemMiscAmt, String billItemCc) {
        this.billItemRef = billItemRef;
        this.billItemStatus = billItemStatus;
        this.billItemAmt = billItemAmt;
        this.billItemEqvAmt = billItemEqvAmt;
        this.billItemMiscAmt = billItemMiscAmt;
        this.billItemCc = billItemCc;
    }

    @Override
    public String toString() {
        return "BillItem{" +
                "billItemRef='" + billItemRef + '\'' +
                ", billItemStatus='" + billItemStatus + '\'' +
                ", billItemAmt='" + billItemAmt + '\'' +
                ", billItemEqvAmt='" + billItemEqvAmt + '\'' +
                ", billItemMiscAmt='" + billItemMiscAmt + '\'' +
                ", billItemCc='" + billItemCc + '\'' +
                '}';
    }
}
