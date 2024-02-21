package org.openmrs.module.icare.web.controller;

import org.openmrs.User;
import org.openmrs.UserSessionListener;
import org.openmrs.module.icare.auditlog.AuditLog;
import org.openmrs.module.icare.core.ICareService;
import org.springframework.beans.factory.annotation.Autowired;

import javax.transaction.Transactional;
import java.util.Date;

public class BaseController implements UserSessionListener {
	
	/*protected final Log log = LogFactory.getLog(getClass());
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String, Object> handleError(HttpServletRequest req, Exception ex) {
		log.error("Request: " + req.getRequestURL() + " raised " + ex);
		Map<String, Object> errorMessage = new HashMap<String, Object>();
		errorMessage.put("message", ex.toString());
		errorMessage.put("status", "ERROR");
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw);
		ex.printStackTrace(pw);
		String sStackTrace = sw.toString(); // stack trace as a string
		errorMessage.put("details", sStackTrace);
		return errorMessage;
	}*/
	
	@Autowired
	ICareService iCareService;
	
	@Override
	@Transactional
	public void loggedInOrOut(User user, Event event, Status status) {
		
		if (event == Event.LOGIN) {
			// User logged in successfully
			System.out.println("User " + user.getUsername() + " logged in at " + new Date() + " and status " + event);
			AuditLog auditLog = new AuditLog(User.class, "LOGGED IN", user, new Date());
			iCareService.saveAuditLog(auditLog);
			// Log the event or perform other actions
		} else if (event == Event.LOGOUT) {
			// User logged out successfully
			System.out.println("User " + user.getUsername() + " logged out at " + new Date() + " and event " + event);
			AuditLog auditLog = new AuditLog(User.class, "LOGGED OUT", user, new Date());
			iCareService.saveAuditLog(auditLog);
			
		}
		
	}
}
