package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsMetadata;
import org.openmrs.Concept;

import javax.persistence.*;

@Entity
@Table(name = "lb_worksheet_control")
public class WorksheetControl extends BaseOpenmrsMetadata implements java.io.Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "worksheet_control_id",nullable = false,unique = true)
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "code")
    private String code;

    @Column(name = "test_order_id")
    private Concept testorder;


    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id = id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Concept getTestorder() {
        return testorder;
    }

    public void setTestorder(Concept testorder) {
        this.testorder = testorder;
    }
}
