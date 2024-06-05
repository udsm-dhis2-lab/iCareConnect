package org.openmrs.module.icare.billing.services.payment.gepg;

public class BillSubmissionRequest {
	
    public BillSubmissionRequest createBillSubmissionRequest(String uuid) {
        System.out.println("Received UUID on Submission Request: " + uuid);
        System.out.println("Generating Bill Submission request.........................");
    
        // Create and populate BillHdr
        BillHdr billHdr = new BillHdr();
        billHdr.setSpCode("SP111");
        billHdr.setRtrRespFlg("true");
    
        // Create and populate BillTrxInf
        BillTrxInf billTrxInf = new BillTrxInf();
        billTrxInf.setBillId("123456222");
        billTrxInf.setSubSpCode("7001");
        billTrxInf.setSpSysId("LHGSE001");
        billTrxInf.setBillAmt("30000");
        billTrxInf.setMiscAmt("0");
        billTrxInf.setBillExprDt("2018-08-08T07:09:34");
        billTrxInf.setPyrId("40");
        billTrxInf.setPyrName("PATRICK PASCHAL");
        billTrxInf.setBillDesc("Application Fees Payment");
        billTrxInf.setBillGenDt("2018-05-10T07:09:34");
        billTrxInf.setBillGenBy("40");
        billTrxInf.setBillApprBy("PATRICK PASCHAL");
        billTrxInf.setPyrCellNum("0767454012");
        billTrxInf.setPyrEmail("patrickkalu199@gmail.com");
        billTrxInf.setCcy("TZS");
        billTrxInf.setBillEqvAmt("30000");
        billTrxInf.setRemFlag("false");
        billTrxInf.setBillPayOpt("3");
    
        // Create and populate BillItems
        BillItems billItems = new BillItems();
        billItems.getBillItem().add(new BillItem("FRRR40", "N", "30000", "30000", "0", "140313"));
        billItems.getBillItem().add(new BillItem("11", "N", "5000", "5000", "0.0", "140371"));
    
        // Set BillItems to BillTrxInf
        billTrxInf.setBillItems(billItems);
    
        // Create and populate BillSubmissionRequest
        BillSubmissionRequest billRequest = new BillSubmissionRequest();
        billRequest.setBillHdr(billHdr);
        billRequest.setBillTrxInf(billTrxInf);
    
        System.out.println("BillSubmissionRequest created in mock: " + billRequest);
        return billRequest;
    }
    
	private BillHdr BillHdrObject;
	private BillTrxInf BillTrxInfObject;
	
	// Getter Methods
	public BillHdr getBillHdr() {
		return BillHdrObject;
	}
	
	public BillTrxInf getBillTrxInf() {
		return BillTrxInfObject;
	}
	
	// Setter Methods
	public void setBillHdr(BillHdr BillHdrObject) {
		this.BillHdrObject = BillHdrObject;
	}
	
	public void setBillTrxInf(BillTrxInf BillTrxInfObject) {
		this.BillTrxInfObject = BillTrxInfObject;
	}
	
	@Override
	public String toString() {
		return "BillSubmissionRequest{" + "BillHdrObject=" + BillHdrObject + ", BillTrxInfObject=" + BillTrxInfObject + '}';
	}
}
