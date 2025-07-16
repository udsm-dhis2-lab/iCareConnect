package org.openmrs.module.icare.billing.services.payment.gepg;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openmrs.GlobalProperty;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.dao.GePGLogsDAO;
import org.openmrs.module.icare.billing.dao.PaymentDAO;
import org.openmrs.module.icare.billing.models.GePGLogs;
import org.openmrs.module.icare.billing.models.Payment;
import org.openmrs.module.icare.billing.services.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

import static java.lang.Integer.parseInt;
import static org.openmrs.module.icare.Utils.JSONExtractor.getValueByPath;

@Service
public class GEPGService {

    @Autowired
    private BillingService billingService;


    private final Map<String, Map<String, Object>> callbackResponses = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> submitGepgRequest(String jsonPayload, String signature, String uccUrl) throws Exception {
        Map<String, Object> responseMap = new ConcurrentHashMap<>();
        GePGLogs gepgLog = new GePGLogs();
        HttpURLConnection con = null;

        try {
            // Check if the existing payment request has a control number or is waiting for control number.
            Optional<String> requestIdOptional = getValueByPath(jsonPayload, String.class, "RequestData", "RequestId");
            AtomicReference<String> requestIdRef = new AtomicReference<>();

            requestIdOptional.ifPresent(requestIdRef::set);

            if(requestIdRef.get() != null){

                Payment existingPayment =  billingService.getPaymentById(Integer.parseInt(requestIdRef.get()));
                if(existingPayment.getReferenceNumber() != null && !existingPayment.getReferenceNumber().equals("0")){
                    responseMap.put("status", "success");
                    responseMap.put("controlNumber", existingPayment.getReferenceNumber());
                    responseMap.put("message", "Request processed successfully.");
                    return responseMap;

                }

                List<GePGLogs> logs = this.billingService.getGepgLogsByRequestId(requestIdRef.get(), null, null, true);

                if(!logs.isEmpty()){
                    for(GePGLogs log: logs){
                        Optional<String> systemAcknowledgementCodeOptional = Optional.empty();

                        AtomicReference<String> codeOrControlNumberRef = new AtomicReference<>();

                        if(log.getStatus().equals("REQUEST")){
                            systemAcknowledgementCodeOptional = getValueByPath(log.getResponse(), String.class, "AckData", "SystemAckCode");

                        }

                        if(log.getStatus().equals("CALLBACK")){
                            systemAcknowledgementCodeOptional = getValueByPath(log.getResponse(), String.class, "FeedbackData", "gepgBillSubResp", "BillTrxInf", "PayCntrNum");
                        }
                        systemAcknowledgementCodeOptional.ifPresent(codeOrControlNumberRef::set);

                        if(codeOrControlNumberRef.get().equals("R3001")){
                            responseMap.put("status", "success");
                            responseMap.put("message", "Request processed successfully. Waiting for control number to be sent!");
                            return responseMap;
                        }

                        if(codeOrControlNumberRef.get() != null && !codeOrControlNumberRef.get().equals("0")){
                            responseMap.put("status", "success");
                            responseMap.put("controlNumber", codeOrControlNumberRef.get());
                            responseMap.put("message", "Request processed successfully.");

                            this.billingService.setPaymentReferenceNumberByPaymentId(existingPayment.getId(), codeOrControlNumberRef.get());
                            return responseMap;
                        }
                    }
                }
            }

            URL url = new URL(uccUrl);
            con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.addRequestProperty("Authorization", "Bearer " + "authToken.getAccessToken()");
            con.addRequestProperty("Content-Type", "application/json");
            con.addRequestProperty("Signature", signature);
            con.setDoInput(true);
            con.setDoOutput(true);

            Map<String, Object> gepgLogMap = new HashMap<>();

            gepgLogMap.put("signature", signature);
            gepgLogMap.put("payload", jsonPayload);

            String logMapString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(gepgLogMap);
            gepgLog.setRequest(logMapString);

            requestIdOptional.ifPresent(gepgLog::setRequestId);

            Date now = new Date();
            gepgLog.setDateCreated(now);
            gepgLog.setDateUpdated(now);
            gepgLog.setStatus("REQUEST");

            billingService.createGepgLogs(gepgLog);

            // Write JSON payload
            try (OutputStream os = con.getOutputStream();
                    BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, "UTF-8"))) {
                writer.write(jsonPayload);
                writer.flush();
            }

            // Process the response
            int responseCode = con.getResponseCode();
            responseMap.put("Code", responseCode);

            gepgLog.setHttpStatusCode(responseCode);
            gepgLog.setDateUpdated(new Date());
            billingService.updateGepgLogs(gepgLog);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                StringBuilder content = new StringBuilder();
                try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
                    String inputLine;
                    while ((inputLine = in.readLine()) != null) {
                        content.append(inputLine);
                    }
                }

                String responseString = content.toString();
                responseMap.put("response", responseString);

                gepgLog.setResponse(responseString);

                // Extract relevant data from the response
                Map<String, Object> parsedResponse = parseJsonResponse(responseString);
                String requestId = (String) parsedResponse.get("RequestId");
                String ackCode = (String) parsedResponse.get("SystemAckCode");

                // Check if requestId is null
                if (requestId == null) {
                    responseMap.put("status", "error");
                    responseMap.put("message", "RequestId is null. Unable to fetch control number.");
                    return responseMap;
                }

                // Handle different ackCodes
                if ("R3001".equals(ackCode)) {
                    Integer requestpaymentId = null;
                    requestpaymentId = parseInt(requestId);
                    String controlNumber = billingService.fetchControlNumber(requestpaymentId);

                    responseMap.put("status", "success");
                    responseMap.put("controlNumber",
                            controlNumber != null ? controlNumber : "Not found within timeout");
                    responseMap.put("ackCode", ackCode);
                    responseMap.put("message", "Request processed successfully.");
                } else if ("CONS9005".equals(ackCode)) {
                    responseMap.put("status", "error");
                    responseMap.put("ackCode", ackCode);
                    responseMap.put("message", "Request failed: Please check the input values or contact support.");
                } else {
                    responseMap.put("status", "error");
                    responseMap.put("ackCode", ackCode);
                    responseMap.put("message", "Request failed with ack code: " + ackCode);
                }
            } else {
                handleErrorResponse(con, responseMap);

                String responseMapjson = objectMapper.writeValueAsString(responseMap);
                Optional<String> errorOptional = getValueByPath(responseMapjson, String.class, "error");
                errorOptional.ifPresent(gepgLog::setResponse);
                gepgLog.setDateUpdated(new Date());
                billingService.updateGepgLogs(gepgLog);
            }
        } catch (Exception e) {
            responseMap.put("Code", 500);
            responseMap.put("error", "Unexpected error: " + (e.getMessage() != null ? e.getMessage() : "null"));

            String responseMapjson = objectMapper.writeValueAsString(responseMap);
            Optional<String> errorOptional = getValueByPath(responseMapjson, String.class, "error");
            errorOptional.ifPresent(gepgLog::setResponse);
            Date now = new Date();
            gepgLog.setDateUpdated(now);
            billingService.updateGepgLogs(gepgLog);
        } finally {
            if (con != null) {
                con.disconnect();
            }
        }
        return responseMap;
    }

    private Map<String, Object> parseJsonResponse(String responseString) {
        Map<String, Object> resultMap = new ConcurrentHashMap<>();
        try {
            JsonNode jsonNode = objectMapper.readTree(responseString);

            // Extract SystemAuth information
            JsonNode systemAuth = jsonNode.get("SystemAuth");
            if (systemAuth != null) {
                String serviceCode = systemAuth.path("ServiceCode").asText();
                String signature = systemAuth.path("Signature").asText();
                resultMap.put("ServiceCode", serviceCode);
                resultMap.put("Signature", signature);
            }

            // Extract AckData information
            JsonNode ackData = jsonNode.get("AckData");
            if (ackData != null) {
                String requestId = ackData.path("RequestId").asText();
                String systemAckCode = ackData.path("SystemAckCode").asText();
                resultMap.put("RequestId", requestId);
                resultMap.put("SystemAckCode", systemAckCode);
            }

        } catch (IOException e) {
            System.out.println(e);
        }
        return resultMap;
    }

    private void handleErrorResponse(HttpURLConnection con, Map<String, Object> responseMap) throws IOException {
        try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(con.getErrorStream()))) {
            StringBuilder errorContent = new StringBuilder();
            String errorLine;
            while ((errorLine = errorReader.readLine()) != null) {
                errorContent.append(errorLine);
            }
            responseMap.put("error", errorContent.toString());
        }
    }
}
