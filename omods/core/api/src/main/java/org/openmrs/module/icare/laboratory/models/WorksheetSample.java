package org.openmrs.module.icare.laboratory.models;

import org.hibernate.annotations.Type;
import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;

import static javax.persistence.GenerationType.IDENTITY;

public class WorksheetSample extends BaseOpenmrsData implements java.io.Serializable {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "worksheet_sample_id", unique = true, nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "worksheet_definition_id")
    private WorksheetDefinition worksheetDefinition;

    @Column(name = "row", columnDefinition = "TINYINT")
    @Type(type = "org.hibernate.type.IntegerType")
    private Integer row;

    @Column(name = "column", columnDefinition = "TINYINT")
    @Type(type = "org.hibernate.type.IntegerType")
    private Integer column;

    @ManyToOne
    @JoinColumn(name = "sample_id",nullable = true)
    private Sample sample;

    @Column(name = "control_id", nullable = true)
    private WorksheetSampleControl worksheetSampleControl;

    @Column(name = "type")
    private String type;


    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id =id;
    }

    public WorksheetDefinition getWorksheetDefinition() {
        return worksheetDefinition;
    }

    public void setWorksheetDefinition(WorksheetDefinition worksheetDefinition) {
        this.worksheetDefinition = worksheetDefinition;
    }

    public Integer getRow() {
        return row;
    }

    public void setRow(Integer row) {
        this.row = row;
    }

    public Integer getColumn() {
        return column;
    }

    public void setColumn(Integer column) {
        this.column = column;
    }

    public Sample getSample() {
        return sample;
    }

    public void setSample(Sample sample) {
        this.sample = sample;
    }

    public WorksheetSampleControl getWorksheetSampleControl() {
        return worksheetSampleControl;
    }

    public void setWorksheetSampleControl(WorksheetSampleControl worksheetSampleControl) {
        this.worksheetSampleControl = worksheetSampleControl;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
