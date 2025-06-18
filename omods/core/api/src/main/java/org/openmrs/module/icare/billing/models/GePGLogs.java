package org.openmrs.module.icare.billing.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "gepg_logs")
public class GePGLogs {
	
	@Id
	@GeneratedValue()
	@Column(name = "gepg_logs_id", unique = true, nullable = false)
	private int id;
	
	@Column(name = "request_id")
	private String requestId;
	
	@Lob
	@Column(name = "request")
	private String request;
	
	@Lob
	@Column(name = "response")
	private String response;
	
	@Column(name = "http_status_code")
	private Integer httpStatusCode;
	
	@Column(name = "status")
	private String status;
	
	@CreationTimestamp
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "date_created", nullable = false, updatable = false)
	private Date dateCreated;
	
	@UpdateTimestamp
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "date_updated", nullable = false)
	private Date dateUpdated;
	
	public GePGLogs() {
		
	}
	
	public int getId() {
		return id;
	}
	
	public void setId(int id) {
		this.id = id;
	}
	
	public String getRequestId() {
		return requestId;
	}
	
	public void setRequestId(String requestId) {
		this.requestId = requestId;
	}
	
	public String getRequest() {
		return request;
	}
	
	public void setRequest(String request) {
		this.request = request;
	}
	
	public String getResponse() {
		return response;
	}
	
	public void setResponse(String response) {
		this.response = response;
	}
	
	public Date getDateCreated() {
		return dateCreated;
	}
	
	public Integer getHttpStatusCode() {
		return httpStatusCode;
	}
	
	public void setHttpStatusCode(Integer httpStatusCode) {
		this.httpStatusCode = httpStatusCode;
	}
	
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public void setDateCreated(Date dateCreated) {
		this.dateCreated = dateCreated;
	}
	
	public Date getDateUpdated() {
		return dateUpdated;
	}
	
	public void setDateUpdated(Date dateUpdated) {
		this.dateUpdated = dateUpdated;
	}
	
	public Map<String, Object> toMap() {
		HashMap<String, Object> gepgLogsMap = new HashMap<String, Object>();
		
		gepgLogsMap.put("id", this.getId());
		gepgLogsMap.put("request_id", this.getRequestId());
		
		gepgLogsMap.put("request", this.getRequest());
		
		gepgLogsMap.put("http_status_code", this.getHttpStatusCode());
		
		gepgLogsMap.put("status", this.getStatus());
		
		gepgLogsMap.put("response", this.getResponse());
		gepgLogsMap.put("date_created", this.getDateCreated());
		gepgLogsMap.put("date_updated", this.getDateUpdated());
		
		return gepgLogsMap;
	}
}
