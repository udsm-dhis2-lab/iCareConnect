package org.openmrs.module.icare.billing.services.payment.gepg;

import java.util.ArrayList;

class BillItems {
    ArrayList<BillItem> BillItem = new ArrayList<>();

    // Getter Methods
    public ArrayList<BillItem> getBillItem() {
        return BillItem;
    }

    // Setter Methods
    public void setBillItem(ArrayList<BillItem> billItem) {
        this.BillItem = billItem;
    }

    @Override
    public String toString() {
        return "BillItems{" +
                "BillItem=" + BillItem +
                '}';
    }
}
