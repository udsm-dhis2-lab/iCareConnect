package org.openmrs.module.icare.laboratory.models;

import org.hibernate.annotations.Type;
import org.openmrs.BaseChangeableOpenmrsMetadata;
import org.openmrs.Concept;
import javax.persistence.*;
import static javax.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "lb_worksheet")
public class Worksheet extends BaseChangeableOpenmrsMetadata implements java.io.Serializable {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "worksheet_id", unique = true, nullable = false)
    private Integer id;

    @Column(name = "code" ,length = 30)
    private String code;

    @Column(name = "description",length = 65535)
    private String description;

    @Column(name = "rows", columnDefinition = "TINYINT")
    @Type(type = "org.hibernate.type.IntegerType")
    private Integer rows;


    @Column(name = "columns", columnDefinition = "TINYINT")
    @Type(type = "org.hibernate.type.IntegerType")
    private Integer columns;

    @Column(name = "test_order_id")
    private Concept testOrder;

    @Column(name = "instrument_id")
    private Concept instrument;


    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Override
    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getRows() {
        return rows;
    }

    public void setRows(Integer rows) {
        this.rows = rows;
    }

    public Integer getColumns() {
        return columns;
    }

    public void setColumns(Integer columns) {
        this.columns = columns;
    }

    public Concept getTestOrder() {
        return testOrder;
    }

    public void setTestOrder(Concept testOrder) {
        this.testOrder = testOrder;
    }


}
