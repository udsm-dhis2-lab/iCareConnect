package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;

@Entity
@Table(name = "lb_worksheet_definition")
public class WorksheetDefinition extends BaseOpenmrsData implements java.io.Serializable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "worksheet_definition_id",unique = true,nullable = false)
    private Integer id;

    @Column(name = "code", length = 30)
    private String code;

    @OneToOne
    @JoinColumn(name = "worksheet_id")
    private Worksheet worksheet;


    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id =id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Worksheet getWorksheet() {
        return worksheet;
    }

    public void setWorksheet(Worksheet worksheet) {
        this.worksheet = worksheet;
    }
}
