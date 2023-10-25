package org.openmrs.module.icare.core.aop;

import org.aopalliance.aop.Advice;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.User;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.core.ICareService;
import org.springframework.aop.Advisor;
import org.springframework.aop.support.StaticMethodMatcherPointcutAdvisor;

import java.lang.reflect.Method;
import java.util.Date;

public class LoginAdvisor extends StaticMethodMatcherPointcutAdvisor implements Advisor {
	
	protected final Log log = LogFactory.getLog(getClass());
	
	public String sessionType;
	
	@Override
	public boolean matches(Method method, Class<?> aClass) {
		log.info("ICareAdvice Matching:" + method.getName());
		if (method.getName().equals("openSession") || method.getName().equals("closeSession")) {
			if (method.getName().equals("openSession")) {
				System.out.println("openSession now");
				sessionType = "openSession";
			}
			if (method.getName().equals("closeSession")) {
				System.out.println("closeSession now");
				sessionType = "closeSession";
			}
			return true;
			
		} else {
			return false;
		}
		
	}
	
	@Override
	public Advice getAdvice() {
		return new LoginAdvice();
	}
	
	private class LoginAdvice implements MethodInterceptor {
		
		public Object invoke(MethodInvocation invocation) throws Throwable {
			//			ICareService iCareService = Context.getService(ICareService.class);
			//			if (invocation.getArguments()[0] instanceof User) {
			//				Date date = new Date();
			//
			//				iCareService.savePasswordHistory((User) invocation.getArguments()[0],
			//				    invocation.getArguments()[2].toString());
			//			} else {
			//
			//				iCareService.savePasswordHistory(null, invocation.getArguments()[1].toString());
			//			}
			if (sessionType == "openSession") {
				System.out.println("nmelogin dadeq");
			}
			if (sessionType == "closeSession") {
				System.out.println("nmelogout dadeq");
			}
			
			return invocation.proceed();
		}
	}
}
