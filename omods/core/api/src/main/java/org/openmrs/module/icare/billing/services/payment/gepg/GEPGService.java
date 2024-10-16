package org.openmrs.module.icare.billing.services.payment.gepg;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ConcurrentHashMap;

import org.openmrs.Concept;
import org.openmrs.Patient;
import org.openmrs.module.icare.ICareConfig;
import org.openmrs.module.icare.billing.Utils.PaymentStatus;
import org.openmrs.module.icare.billing.dao.PaymentDAO;
import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.billing.models.Payment;
import org.openmrs.module.icare.billing.models.PaymentItem;
import org.openmrs.module.icare.billing.services.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.models.InvoiceItem;
import org.openmrs.module.icare.core.ICareService;
import org.openmrs.GlobalProperty;

@Service
public class GEPGService {

    @Autowired
    private ICareService icareService;

    @Autowired
    private BillingService billingService;

    PaymentDAO paymentDAO;
    // A map to hold callback responses based on the request ID
    private final Map<String, Map<String, Object>> callbackResponses = new ConcurrentHashMap<>();
   
    // Synchronized method to submit GePG request and wait for the callback
    public Map<String, Object> submitGepgRequest(String jsonPayload, String signature, String uccUrl) {
        Map<String, Object> responseMap = new HashMap<>();
        HttpURLConnection con = null;
       

        try {
            String apiUrl = uccUrl;
            URL url = new URL(apiUrl);
            con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.addRequestProperty("Authorization", "Bearer " + "authToken.getAccessToken()");
            con.addRequestProperty("Content-Type", "application/json");
            con.addRequestProperty("Signature", signature);
            con.setDoInput(true);
            con.setDoOutput(true);

            // Save the signature globally
            GlobalProperty globalProperty = new GlobalProperty();
            AdministrationService administrationService = Context.getAdministrationService();
            globalProperty.setProperty("gepg.signSignature.icareConnect");
            globalProperty.setPropertyValue(signature);
            administrationService.saveGlobalProperty(globalProperty);

            // Write JSON payload
            try (OutputStream os = con.getOutputStream();
                 BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, "UTF-8"))) {
                writer.write(jsonPayload);
                writer.flush();
            }

            // Process the response
            int responseCode = con.getResponseCode();
            responseMap.put("Code", responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
                    String inputLine;
                    StringBuilder content = new StringBuilder();
                    while ((inputLine = in.readLine()) != null) {
                        content.append(inputLine);
                    }
                    String responseString = content.toString();
                    responseMap.put("response", responseString);

                    // Extract SystemAckCode and check if it's "R3001"
                    if (responseString.contains("\"SystemAckCode\":\"R3001\"")) {
                        String requestId = extractRequestId(responseString); 

                        // Wait for the callback data for up to 2 minutes
                        synchronized (this) {
                            // waitForCallbackResponse(requestId, responseMap);
                        }
                    }
                }
            } else {
                try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(con.getErrorStream()))) {
                    StringBuilder errorContent = new StringBuilder();
                    String errorLine;
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorContent.append(errorLine);
                    }
                    responseMap.put("error", errorContent.toString());
                }
            }
        } catch (Exception e) {
            responseMap.put("Code", 500);
            responseMap.put("error", "Unexpected error: " + e.getMessage());
        } finally {
            if (con != null) {
                con.disconnect();
            }
        }
        return responseMap;
    }

//     public Map<String, Object> processGepgCallbackResponse(Map<String, Object> callbackData) {
//         System.out.println("Processing callback data: " + callbackData);
//         Map<String, Object> response = new HashMap<>();
        
//         try {
//             if (callbackData.containsKey("Status") && callbackData.containsKey("FeedbackData")) {
//                 Map<String, Object> status = (Map<String, Object>) callbackData.get("Status");
//                 Map<String, Object> feedbackData = (Map<String, Object>) callbackData.get("FeedbackData");

//                 Map<String, Object> gepgBillSubResp = (Map<String, Object>) feedbackData.get("gepgBillSubResp");
//                 Map<String, Object> billTrxInf = (Map<String, Object>) gepgBillSubResp.get("BillTrxInf");

//                 String billId = (String) billTrxInf.get("BillId");
//                 String payCntrNum = (String) billTrxInf.get("PayCntrNum");

//                 // 1. Get invoice from bill
//                 Invoice invoice = billingService.getInvoiceDetailsByUuid(billId);
//                 if (invoice == null) {
//                     throw new Exception("Bill id " + billId + " is not valid");
//                 }
//                 String  paymentTypeConceptUuid = Context.getAdministrationService().getGlobalProperty(ICareConfig.DEFAULT_PAYMENT_TYPE_VIA_CONTROL_NUMBER);
//                 if (paymentTypeConceptUuid == null) {
//                     throw new Exception("No default payment type based on control number");
//                 }
//                 Concept paymentType = Context.getConceptService().getConceptByUuid(paymentTypeConceptUuid);
//                 Payment payment = new Payment();
//                 payment.setPaymentType(paymentType);
//                 payment.setReferenceNumber(payCntrNum);
//                 payment.setInvoice(invoice);

//                 // Payment Items
//                 List<PaymentItem> paymentItems = new ArrayList<PaymentItem>();
//                 for (InvoiceItem invoiceItem: invoice.getInvoiceItems()) {
//                     PaymentItem paymentItem = new PaymentItem();
//                     paymentItem.setAmount(invoiceItem.getPrice());
//                     paymentItem.setOrder(invoiceItem.getOrder());
//                     paymentItem.setItem(invoiceItem.getItem());
//                     paymentItem.setStatus(PaymentStatus.UNPAID);
//                     paymentItems.add(paymentItem);
//                 }
//                 payment.setItems(paymentItems);
//                 payment.setReceivedBy("SYSTEM");
//                 payment.setStatus(PaymentStatus.UNPAID);
//                 payment.setCreator(Context.getAuthenticatedUser());
//                 payment.setDateCreated( new Date());
//                 new Payment();
//                 boolean isUpdated = true;
//                 // will used to update Control Number
//                 // boolean isUpdated = icareService.updateGepgControlNumber(payCntrNum, billId);

//                 if (isUpdated) {
//                     // Save control number in global property
//                     List<Payment> payments = this.paymentDAO.findByPatientUuid(invoice.getVisit().getPatient().getUuid());
//                     System.out.println(payments.size());
//                     Payment savedPayment = this.paymentDAO.save(payment);
// //                    response.put("referenceNumber",payCntrNum);
//                     GlobalProperty globalProperty = new GlobalProperty();
//                     AdministrationService administrationService = Context.getAdministrationService();
//                     globalProperty.setProperty("gepg.updatedInvoiceItem.icareConnect");
// //                    globalProperty.setPropertyValue("Success Control NUmber saved with payment control number "+ savedPayment.getReferenceNumber() + " and uuid " + savedPayment.getUuid());
//                     administrationService.saveGlobalProperty(globalProperty);

//                     response.put("status", "success");
//                     response.put("message", "Callback processed and control number updated successfully");
//                 } else {
//                     response.put("status", "error");
//                     response.put("message", "Failed to update control number for BillId: " + billId);
//                 }
//             } else {
//                 System.out.println("Status or FeedbackData field not found in callback data");
//                 response.put("status", "error");
//                 response.put("message", "Status or FeedbackData field not found in callback data");
//             }
//         } catch (Exception e) {
//             e.printStackTrace();
//             response.put("status", "error");
//             response.put("message", "Internal server error");
//             response.put("error", e.getMessage());
//         }
    
//         return response;
//     }
    
    
    // Helper method to extract RequestId from the response
    private String extractRequestId(String responseString) {
        return responseString.contains("RequestId") ? responseString.split("RequestId\":\"")[1].split("\"")[0] : null;
    }

    // Method to save callback data
    public void saveCallbackData(String requestId, Map<String, Object> callbackData) {
        callbackResponses.put(requestId, callbackData);
    }
}