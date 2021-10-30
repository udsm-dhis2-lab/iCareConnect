package org.openmrs.module.icare.web.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.module.icare.billing.models.Discount;
import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.billing.models.Payment;
import org.openmrs.module.icare.billing.services.BillingService;
import org.openmrs.module.icare.billing.services.insurance.SyncResult;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

//import com.google.gson.Gson;
//import com.google.gson.GsonBuilder;

@Controller
@RequestMapping(value = "/rest/" + RestConstants.VERSION_1 + "/billing")
public class BillingController extends BaseController {
	
	protected final Log log = LogFactory.getLog(getClass());
	
	@Autowired
	BillingService billingService;
	
	@RequestMapping(value = "invoice", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> onGetPatientPendingBillsMap(
	        @RequestParam(value = "patient", required = false) String patient,
	        @RequestParam(value = "visit", required = false) String visit) {
		if (patient != null) {
			List<Invoice> invoices = onGetPatientPendingBills(patient);
			List<Map<String, Object>> invoiceMaps = new ArrayList<Map<String, Object>>();
			for (Invoice invoice : invoices) {
				invoiceMaps.add(invoice.toMap());
			}
			return invoiceMaps;
		} else if (visit != null) {
			List<Invoice> invoices = billingService.getInvoicesByVisitUuid(visit);
			List<Map<String, Object>> invoiceMaps = new ArrayList<Map<String, Object>>();
			for (Invoice invoice : invoices) {
				invoiceMaps.add(invoice.toMap());
			}
			return invoiceMaps;
		} else {
			return null;
		}
	}
	
	public List<Invoice> onGetPatientPendingBills(@RequestParam("patient") String patient) {
		return billingService.getPendingInvoices(patient);
	}
	
	@RequestMapping(value = "payment", method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> onGetPatientPaymentsJSON(@RequestParam("patient") String patient) {
		List<Payment> payments = onGetPatientPayments(patient);
		List<Map<String, Object>> paymentMaps = new ArrayList<Map<String, Object>>();
		for (Payment payment : payments) {
			paymentMaps.add(payment.toMap());
		}
		return paymentMaps;
	}
	
	@RequestMapping(value = "insurance/sync/priceList", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> syncPriceList(@RequestParam("insurance") String insurance) throws Exception {
		SyncResult syncResult = billingService.syncInsurance(insurance);
		return syncResult.toMap();
	}
	
	public List<Payment> onGetPatientPayments(@RequestParam("patient") String patient) {
		return billingService.getPatientPayments(patient);
	}
	
	@RequestMapping(value = "payment", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, Object> onPostConfirmPaymentMap(@RequestBody Payment payment) throws Exception {
		Payment newPayment = this.onPostConfirmPayment(payment);
		return newPayment.toMap();
	}
	
	public Payment onPostConfirmPayment(Payment payment) throws Exception {
		return billingService.confirmPayment(payment);
	}
	
	@RequestMapping(value = "discount", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, Object> onPostDiscountInvoiceMap(@RequestBody Discount discount) throws Exception {
		Discount newDiscount = this.onPostDiscountInvoice(discount);
		return newDiscount.toMap();
	}
	
	public Discount onPostDiscountInvoice(Discount discount) throws Exception {
		return billingService.discountInvoice(discount);
	}
}
