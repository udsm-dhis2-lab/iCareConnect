package org.openmrs.module.icare.laboratory.models;

import org.openmrs.Order;

import javax.persistence.Embeddable;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.util.Objects;

//@Embeddable
//public class SampleOrderID implements java.io.Serializable {
//
//	@ManyToOne
//	@JoinColumn(name = "sample_id")
//	private Sample sample;
//
//	@ManyToOne
//	@JoinColumn(name = "order_id")
//	private Order order;
//
//	public Sample getSample() {
//		return sample;
//	}
//
//	public void setSample(Sample sample) {
//		this.sample = sample;
//	}
//
//	public Order getOrder() {
//		return order;
//	}
//
//	public void setOrder(Order order) {
//		this.order = order;
//	}
//
//}

public class SampleOrderID implements java.io.Serializable {
	
	private Integer sample;
	
	private Integer order;
	
	public SampleOrderID() {
	}
	
	public SampleOrderID(Integer sample, Integer order) {
		this.sample = sample;
		this.order = order;
	}
	
	public Integer getSample() {
		return sample;
	}
	
	public void setSample(Integer sample) {
		this.sample = sample;
	}
	
	public Integer getOrder() {
		return order;
	}
	
	public void setOrder(Integer order) {
		this.order = order;
	}
	
	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;
		SampleOrderID that = (SampleOrderID) o;
		return Objects.equals(sample, that.sample) && Objects.equals(order, that.order);
	}
	
	@Override
	public int hashCode() {
		return Objects.hash(sample, order);
	}
	
}
