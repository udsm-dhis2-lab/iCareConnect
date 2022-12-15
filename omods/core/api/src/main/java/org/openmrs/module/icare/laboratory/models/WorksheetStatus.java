package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;

@Entity
@Table(name = "lb_worksheet_status")
public class WorksheetStatus extends BaseOpenmrsData implements java.io.Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "worksheet_status_id",unique = true,nullable = false)
    private Integer id;

    @Column(name = "worksheet_id")
    private Worksheet worksheet;

    @Column(name = "category", length = 32)
    private String Category;

    @Column(name = "status", length = 65535)
    private String status;

    @Column(name = "remarks", length = 65535)
    private String remarks;




    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id=id;
    }
}
