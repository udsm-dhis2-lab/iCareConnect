package org.openmrs.module.icare.billing.services.insurance;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openmrs.Visit;
import org.openmrs.module.icare.billing.services.insurance.nhif.NHIFServiceImpl;
import org.openmrs.module.icare.billing.services.insurance.nhif.claim.Folio;
import org.openmrs.module.icare.billing.services.insurance.nhif.claim.Signature;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Service
public class InsurancesServices {
	
	// ---------- NHIF Endpoints ----------
	private static final String API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/AuthorizeCard";
	
	private static final String POC_API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/GeneratePOCReferenceNo";
	
	private static final String POC_GET_API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/GetPointsOfCare";
	
	private static final String VISITYPE_API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/GetVisitTypes";
	
	private static final String TOKEN_URL = "https://verification.nhif.or.tz/authserver/connect/token";
	
	private static final String PREAPPROVAL_API = "https://test.nhif.or.tz/servicehub/api/PreApprovals/RequestServices";
	
	private static final String BENEFICIALY_DETAILS_API = "https://test.nhif.or.tz/servicehub/api/Verification/GetBeneficiaryDetails";
	
	private static final String PRACTITIONER_LOGIN = "https://test.nhif.or.tz/servicehub/api/Attendance/LoginPractitioner";
	
	private static final String PRACTITIONER_LOGOUT = "https://test.nhif.or.tz/servicehub/api/Attendance/LogoutPractitioner";
	
	private static final String GETBYNIN_API_URL = "https://test.nhif.or.tz/servicehub/api/Verification/GetCardDetailsByNIN";
	
	private static final String POTFOLIO_API_URL = "https://test.nhif.or.tz/ocs/api/Claims/SubmitFolio";
	
	// ---------- Credentials ----------
	private static final String CLIENT_ID = "04626";
	
	private static final String CLIENT_SECRET = "mXW2OcsZMBCLpWFMX6/I5A==";
	
	private static final String SCOPE = "OnlineServices";
	
	private static final String USERNAME = "hmis_username";
	
	private final ObjectMapper objectMapper = new ObjectMapper();
	
	// =========================================================
	//                 Plain DTO for NHIF response
	// =========================================================
	public static class NhifResponse {
		
		public final int status;
		
		public final String body;
		
		public final Map<String, List<String>> headers;
		
		public NhifResponse(int status, String body, Map<String, List<String>> headers) {
            this.status = status;
            this.body = body;
            // Defensive copy of headers limited to simple map (optional)
            this.headers = headers == null ? new HashMap<>() : new HashMap<>(headers);
        }
	}
	
	// =========================================================
	//                 Tiny HTTP Helper (DRY)
	// =========================================================
	/** Open and configure a connection with common headers. */
	private HttpURLConnection open(String urlStr, String method, String token, String contentType) throws Exception {
		URL url = new URL(urlStr);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod(method);
		conn.setRequestProperty("Accept", "application/json");
		if (contentType != null)
			conn.setRequestProperty("Content-Type", contentType);
		if (token != null && !token.isEmpty())
			conn.setRequestProperty("Authorization", "Bearer " + token);
		if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) {
			conn.setDoOutput(true);
		}
		return conn;
	}
	
	/** Write request body as UTF-8. */
	private void write(HttpURLConnection conn, String body) throws Exception {
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = body.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
    }
	
	/** Read stream fully to a String. */
	private String readAll(InputStream stream) throws Exception {
        if (stream == null) return "";
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
        }
        return sb.toString();
    }
	
	/** Build plain NhifResponse mirroring NHIF's status + body + (optional) headers. */
	private NhifResponse toNhifResponse(HttpURLConnection conn) throws Exception {
		int code = conn.getResponseCode();
		InputStream is = code < 400 ? conn.getInputStream() : conn.getErrorStream();
		String body = readAll(is);
		Map<String, List<String>> headers = conn.getHeaderFields();
		return new NhifResponse(code, body, headers);
	}
	
	// =========================================================
	//                    Token acquisition
	// =========================================================
	/** Get NHIF access token (string). */
	public String getAuthToken() {
		HttpURLConnection conn = null;
		try {
			conn = open(TOKEN_URL, "POST", null, "application/x-www-form-urlencoded");
			String requestBody = "grant_type=" + URLEncoder.encode("client_credentials", "UTF-8") + "&client_id="
			        + URLEncoder.encode(CLIENT_ID, "UTF-8") + "&client_secret=" + URLEncoder.encode(CLIENT_SECRET, "UTF-8")
			        + "&scope=" + URLEncoder.encode(SCOPE, "UTF-8") + "&username=" + URLEncoder.encode(USERNAME, "UTF-8")
			        + "&password=" + URLEncoder.encode(CLIENT_SECRET, "UTF-8");
			
			write(conn, requestBody);
			
			int code = conn.getResponseCode();
			String body = readAll(code == 200 ? conn.getInputStream() : conn.getErrorStream());
			
			if (code != 200) {
				System.out.println("Failed to get token: HTTP " + code + " | Response: " + body);
				return null;
			}
			
			JsonNode node = objectMapper.readTree(body);
			return node.has("access_token") ? node.get("access_token").asText() : null;
			
		}
		catch (Exception e) {
			System.out.println("Error getting token: " + e.getMessage());
			return null;
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	// =========================================================
	//                       NHIF Calls
	// =========================================================
	
	/** Verification/Authorize Card (POST) */
	public NhifResponse authorizeCard(String jsonPayload) {
		String token = getAuthToken();
		if (token == null)
			return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
		
		HttpURLConnection conn = null;
		try {
			conn = open(API_URL, "POST", token, "application/json");
			write(conn, jsonPayload);
			return toNhifResponse(conn);
		}
		catch (Exception e) {
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	/** Generate POC Reference (POST) */
	public NhifResponse generatePocRef(String jsonPayload) {
		if (jsonPayload == null)
			return new NhifResponse(400, "{\"error\":\"Payload Error\"}", null);
		
		String token = getAuthToken();
		if (token == null)
			return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
		
		HttpURLConnection conn = null;
		try {
			conn = open(POC_API_URL, "POST", token, "application/json");
			write(conn, jsonPayload);
			return toNhifResponse(conn);
		}
		catch (Exception e) {
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	/** Points of Care (GET) */
	public NhifResponse getPointsOfCare() {
		String token = getAuthToken();
		if (token == null)
			return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
		
		HttpURLConnection conn = null;
		try {
			conn = open(POC_GET_API_URL, "GET", token, null);
			return toNhifResponse(conn);
		}
		catch (Exception e) {
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	/** Visit Types (GET) */
	public NhifResponse getVisitTypes() {
		String token = getAuthToken();
		if (token == null)
			return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
		
		HttpURLConnection conn = null;
		try {
			conn = open(VISITYPE_API_URL, "GET", token, null);
			return toNhifResponse(conn);
		}
		catch (Exception e) {
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	/** Pre-approval Request (POST) */
	public NhifResponse preapproval(Map<String, Object> requestPayload) {
		if (requestPayload == null || requestPayload.isEmpty())
			return new NhifResponse(400, "{\"error\":\"Payload cannot be null or empty\"}", null);
		
		String token = getAuthToken();
		if (token == null)
			return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
		
		HttpURLConnection conn = null;
		try {
			String json = new ObjectMapper().writeValueAsString(requestPayload);
			conn = open(PREAPPROVAL_API, "POST", token, "application/json");
			write(conn, json);
			return toNhifResponse(conn);
		}
		catch (Exception e) {
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	/** Beneficiary Details (POST) */
	public NhifResponse beneficiaryDetails(String jsonPayload) {
		String token = getAuthToken();
		if (token == null)
			return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
		
		HttpURLConnection conn = null;
		try {
			conn = open(BENEFICIALY_DETAILS_API, "POST", token, "application/json");
			write(conn, jsonPayload);
			return toNhifResponse(conn);
		}
		catch (Exception e) {
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	/** Practitioner Login (POST) */
	public NhifResponse loginPractitioner(String jsonPayload) {
		if (jsonPayload == null)
			return new NhifResponse(400, "{\"error\":\"Payload Error\"}", null);
		
		String token = getAuthToken();
		if (token == null)
			return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
		
		HttpURLConnection conn = null;
		try {
			conn = open(PRACTITIONER_LOGIN, "POST", token, "application/json");
			write(conn, jsonPayload);
			return toNhifResponse(conn);
		}
		catch (Exception e) {
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	/** Submit Portfolio/Folio (POST to OCS) */
	public NhifResponse submitPortfolio(Visit visit, String signatory, String signatoryID, String signatureData) {
		try {
			InsuranceService insuranceService = new NHIFServiceImpl();
			ClaimResult result = insuranceService.claim(visit);
			
			if (result.getFolio() == null) {
				String msg = result.getMessage() == null ? "No folio created" : result.getMessage();
				return new NhifResponse(400, jsonError(msg), null);
			}
			
			// Add signature onto folio
			Folio folio = result.getFolio();
			Signature signature = new Signature();
			signature.setSignatory(signatory);
			signature.setSignatoryID(signatoryID);
			signature.setSignatureData(signatureData);
			Date now = new Date();
			signature.setDateCreated(formatDate(now));
			signature.setCreatedBy("system");
			signature.setLastModified(formatDate(now));
			signature.setLastModifiedBy("system");
			folio.getSignatures().add(signature);
			
			String token = getAuthToken();
			if (token == null)
				return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
			
			HttpURLConnection conn = null;
			try {
				ObjectMapper mapper = new ObjectMapper();
				mapper.enable(SerializationFeature.INDENT_OUTPUT);
				String folioJson = mapper.writeValueAsString(folio);
				
				conn = open(POTFOLIO_API_URL, "POST", token, "application/json");
				write(conn, folioJson);
				return toNhifResponse(conn);
			}
			finally {
				if (conn != null)
					conn.disconnect();
			}
			
		}
		catch (Exception e) {
			e.printStackTrace();
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
	}
	
	/** Get Card Details by NIN (GET) */
	public NhifResponse getCardDetailsByNIN(String nationalID) {
		if (nationalID == null || nationalID.trim().isEmpty())
			return new NhifResponse(400, "{\"error\":\"Null or empty nationalID is not allowed\"}", null);
		
		String token = getAuthToken();
		if (token == null)
			return new NhifResponse(401, "{\"error\":\"Failed to obtain authentication token\"}", null);
		
		HttpURLConnection conn = null;
		try {
			String fullUrl = GETBYNIN_API_URL + "?nationalID=" + urlEncode(nationalID);
			System.out.println("API URL: " + fullUrl);
			conn = open(fullUrl, "GET", token, null);
			return toNhifResponse(conn);
		}
		catch (Exception e) {
			return new NhifResponse(500, jsonError(e.getMessage()), null);
		}
		finally {
			if (conn != null)
				conn.disconnect();
		}
	}
	
	// =========================================================
	//                         Utils
	// =========================================================
	
	private static String urlEncode(String s) {
		try {
			return URLEncoder.encode(s, "UTF-8");
		}
		catch (Exception e) {
			return s;
		}
	}
	
	private static String formatDate(Date date) {
		if (date == null)
			return null;
		DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);
		return fmt.format(Instant.ofEpochMilli(date.getTime()));
	}
	
	private static String jsonError(String message) {
		String s = message == null ? "" : message;
		s = s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
		return "{\"error\":\"" + s + "\"}";
	}
}
