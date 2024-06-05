package org.openmrs.module.icare.billing.services.payment.gepg;

public class BillHdr {
    private String SpCode;
    private String RtrRespFlg;

    // Getter Methods
    public String getSpCode() {
        return SpCode;
    }

    public String getRtrRespFlg() {
        return RtrRespFlg;
    }

    // Setter Methods
    public void setSpCode(String SpCode) {
        this.SpCode = SpCode;
    }

    public void setRtrRespFlg(String RtrRespFlg) {
        this.RtrRespFlg = RtrRespFlg;
    }

    @Override
    public String toString() {
        return "BillHdr{" + "SpCode='" + SpCode + '\'' + ", RtrRespFlg='" + RtrRespFlg + '\'' + '}';
    }
}
