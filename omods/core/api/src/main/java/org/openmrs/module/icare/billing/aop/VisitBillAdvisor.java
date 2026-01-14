package org.openmrs.module.icare.billing.aop;

import org.aopalliance.aop.Advice;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.Visit;
import org.openmrs.api.VisitService;
import org.openmrs.api.context.Context;
import org.openmrs.module.icare.billing.services.BillingService;
import org.springframework.aop.Advisor;
import org.springframework.aop.support.StaticMethodMatcherPointcutAdvisor;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Method;

public class VisitBillAdvisor extends StaticMethodMatcherPointcutAdvisor {
	
	protected final Log log = LogFactory.getLog(getClass());
	
	private static final ThreadLocal<Boolean> inCreateVisit = new ThreadLocal<Boolean>() {
		
		@Override
		protected Boolean initialValue() {
			return false;
		}
	};
	
	@Override
	public boolean matches(Method method, Class<?> targetClass) {
		if (method.getName().equals("saveVisit")) {
			log.debug("ICareAdvice Matching saveVisit method");
			return true;
		}
		return false;
	}
	
	@Override
	public Advice getAdvice() {
		return new VisitBillCreationAdvice();
	}
	
	private class VisitBillCreationAdvice implements MethodInterceptor {
		
		public Object invoke(MethodInvocation invocation) throws Throwable {
			if (inCreateVisit.get()) {
				return invocation.proceed();
			}
			
			try {
				inCreateVisit.set(true);
				
				Visit visit = (Visit) invocation.getArguments()[0];
				
				VisitService visitService = Context.getVisitService();
				Visit existingVisit = visitService.getVisitByUuid(visit.getUuid());
				
				if (existingVisit != null) {
					return invocation.proceed();
				}
				
				BillingService billingService = Context.getService(BillingService.class);
				Visit result = billingService.createVisit(invocation);
				
				return result;
			}
			finally {
				inCreateVisit.remove();
			}
		}
	}
}
