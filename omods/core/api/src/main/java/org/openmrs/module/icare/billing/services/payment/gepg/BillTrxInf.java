package org.openmrs.module.icare.billing.services.payment.gepg;

public class BillTrxInf {
    private String BillId;
    private String SubSpCode;
    private String SpSysId;
    private String BillAmt;
    private String MiscAmt;
    private String BillExprDt;
    private String PyrId;
    private String PyrName;
    private String BillDesc;
    private String BillGenDt;
    private String BillGenBy;
    private String BillApprBy;
    private String PyrCellNum;
    private String PyrEmail;
    private String Ccy;
    private String BillEqvAmt;
    private String RemFlag;
    private String BillPayOpt;
    private BillItems BillItemsObject;

    // Getter Methods
    public String getBillId() {
        return BillId;
    }

    public String getSubSpCode() {
        return SubSpCode;
    }

    public String getSpSysId() {
        return SpSysId;
    }

    public String getBillAmt() {
        return BillAmt;
    }

    public String getMiscAmt() {
        return MiscAmt;
    }

    public String getBillExprDt() {
        return BillExprDt;
    }

    public String getPyrId() {
        return PyrId;
    }

    public String getPyrName() {
        return PyrName;
    }

    public String getBillDesc() {
        return BillDesc;
    }

    public String getBillGenDt() {
        return BillGenDt;
    }

    public String getBillGenBy() {
        return BillGenBy;
    }

    public String getBillApprBy() {
        return BillApprBy;
    }

    public String getPyrCellNum() {
        return PyrCellNum;
    }

    public String getPyrEmail() {
        return PyrEmail;
    }

    public String getCcy() {
        return Ccy;
    }

    public String getBillEqvAmt() {
        return BillEqvAmt;
    }

    public String getRemFlag() {
        return RemFlag;
    }

    public String getBillPayOpt() {
        return BillPayOpt;
    }

    public BillItems getBillItems() {
        return BillItemsObject;
    }

    // Setter Methods
    public void setBillId(String BillId) {
        this.BillId = BillId;
    }

    public void setSubSpCode(String SubSpCode) {
        this.SubSpCode = SubSpCode;
    }

    public void setSpSysId(String SpSysId) {
        this.SpSysId = SpSysId;
    }

    public void setBillAmt(String BillAmt) {
        this.BillAmt = BillAmt;
    }

    public void setMiscAmt(String MiscAmt) {
        this.MiscAmt = MiscAmt;
    }

    public void setBillExprDt(String BillExprDt) {
        this.BillExprDt = BillExprDt;
    }

    public void setPyrId(String PyrId) {
        this.PyrId = PyrId;
    }

    public void setPyrName(String PyrName) {
        this.PyrName = PyrName;
    }

    public void setBillDesc(String BillDesc) {
        this.BillDesc = BillDesc;
    }

    public void setBillGenDt(String BillGenDt) {
        this.BillGenDt = BillGenDt;
    }

    public void setBillGenBy(String BillGenBy) {
        this.BillGenBy = BillGenBy;
    }

    public void setBillApprBy(String BillApprBy) {
        this.BillApprBy = BillApprBy;
    }

    public void setPyrCellNum(String PyrCellNum) {
        this.PyrCellNum = PyrCellNum;
    }

    public void setPyrEmail(String PyrEmail) {
        this.PyrEmail = PyrEmail;
    }

    public void setCcy(String Ccy) {
        this.Ccy = Ccy;
    }

    public void setBillEqvAmt(String BillEqvAmt) {
        this.BillEqvAmt = BillEqvAmt;
    }

    public void setRemFlag(String RemFlag) {
        this.RemFlag = RemFlag;
    }

    public void setBillPayOpt(String BillPayOpt) {
        this.BillPayOpt = BillPayOpt;
    }

    public void setBillItems(BillItems BillItemsObject) {
        this.BillItemsObject = BillItemsObject;
    }

    @Override
    public String toString() {
        return "BillTrxInf{" +
                "BillId='" + BillId + '\'' +
                ", SubSpCode='" + SubSpCode + '\'' +
                ", SpSysId='" + SpSysId + '\'' +
                ", BillAmt='" + BillAmt + '\'' +
                ", MiscAmt='" + MiscAmt + '\'' +
                ", BillExprDt='" + BillExprDt + '\'' +
                ", PyrId='" + PyrId + '\'' +
                ", PyrName='" + PyrName + '\'' +
                ", BillDesc='" + BillDesc + '\'' +
                ", BillGenDt='" + BillGenDt + '\'' +
                ", BillGenBy='" + BillGenBy + '\'' +
                ", BillApprBy='" + BillApprBy + '\'' +
                ", PyrCellNum='" + PyrCellNum + '\'' +
                ", PyrEmail='" + PyrEmail + '\'' +
                ", Ccy='" + Ccy + '\'' +
                ", BillEqvAmt='" + BillEqvAmt + '\'' +
                ", RemFlag='" + RemFlag + '\'' +
                ", BillPayOpt='" + BillPayOpt + '\'' +
                ", BillItemsObject=" + BillItemsObject +
                '}';
    }
}
