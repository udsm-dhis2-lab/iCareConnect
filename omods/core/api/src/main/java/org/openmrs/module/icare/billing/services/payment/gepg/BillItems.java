package org.openmrs.module.icare.billing.services.payment.gepg;

import java.util.ArrayList;
import java.util.List;

public class BillItems {
    private List<BillItem> BillItem = new ArrayList<>();

    // Getter Method
    public List<BillItem> getBillItem() {
        return BillItem;
    }

    // Setter Method
    public void setBillItem(List<BillItem> BillItem) {
        this.BillItem = BillItem;
    }

    @Override
    public String toString() {
        return "BillItems{" + "BillItem=" + BillItem + '}';
    }
}
