package org.openmrs.module.icare.billing.services.payment.gepg;

public class BillItem {

    private String BillItemRef;
    private String UseItemRefOnPay;
    private String BillItemAmt;
    private String BillItemEqvAmt;
    private String BillItemMiscAmt;
    private String GfsCode;

    public BillItem(String billItemRef, String useItemRefOnPay, String billItemAmt, String billItemEqvAmt, String billItemMiscAmt, String gfsCode) {
        BillItemRef = billItemRef;
        UseItemRefOnPay = useItemRefOnPay;
        BillItemAmt = billItemAmt;
        BillItemEqvAmt = billItemEqvAmt;
        BillItemMiscAmt = billItemMiscAmt;
        GfsCode = gfsCode;
    }


}
