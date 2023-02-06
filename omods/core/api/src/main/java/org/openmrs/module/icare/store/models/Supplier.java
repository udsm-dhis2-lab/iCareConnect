package org.openmrs.module.icare.store.models;

import org.openmrs.BaseOpenmrsData;
import org.openmrs.module.icare.core.JSONConverter;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "st_supplier")
public class Supplier extends BaseOpenmrsData implements java.io.Serializable, JSONConverter {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "supplier_id", unique = true, nullable = false)
	private Integer id;
	
	@Column(name = "name", length = 20)
	private String name;
	
	@Column(name = "description", length = 100)
	private String description;
	
	@Override
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		this.id = id;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	@Override
    public Map<String, Object> toMap()
    {
        Map<String,Object> supplierMap = new HashMap<>();
        supplierMap.put("name",this.getName());
        supplierMap.put("description",this.getDescription());
        supplierMap.put("uuid",this.getUuid());
		supplierMap.put("voided",this.getVoided());
        return supplierMap;
    }
	
	public static Supplier fromMap(Map<String, Object> supplierMap) {
		
		Supplier supplier = new Supplier();
		if(supplierMap.get("description") != null){
			supplier.setDescription(supplierMap.get("description").toString());
		}
		if(supplierMap.get("name") != null) {
			supplier.setName(supplierMap.get("name").toString());
		}

		if(supplierMap.get("voided") != null){
			supplier.setVoided((boolean) supplierMap.get("voided"));
		}
		return supplier;
	}
}
