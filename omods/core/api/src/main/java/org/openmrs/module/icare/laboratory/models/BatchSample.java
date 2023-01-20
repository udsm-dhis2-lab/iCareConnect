package org.openmrs.module.icare.laboratory.models;

import org.openmrs.BaseOpenmrsData;

import javax.persistence.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "lb_batch_sample")
public class BatchSample extends BaseOpenmrsData implements java.io.Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_sample_id", unique = true, nullable = false)
    private Integer id;

    @Column(name = "code", length = 30)
    private String code;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer integer) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Batch getBatch() {
        return batch;
    }

    public void setBatch(Batch batch) {
        this.batch = batch;
    }

    public Map<String,Object> toMap(){

        Map<String,Object> newBatchSampleObject = new HashMap<>();
        newBatchSampleObject.put("code",this.getCode());
        newBatchSampleObject.put("uuid",this.getUuid());
        newBatchSampleObject.put("dateCreated",this.getDateCreated());

        if(this.batch != null){
            Map<String, Object> batchObject = new HashMap<>();
            batchObject.put("uuid",this.getBatch().getUuid());
            batchObject.put("display",this.getBatch().getBatchName());
            newBatchSampleObject.put("batch",batchObject);
        }
        if (this.creator != null){
            Map<String,Object> userObject = new HashMap<>();
            userObject.put("uuid",this.getCreator().getUuid());
            userObject.put("display",this.getCreator().getDisplayString());
            newBatchSampleObject.put("creator",userObject);
        }

        return newBatchSampleObject;
    }

    public static BatchSample fromMap(Map<String,Object> batchSampleMap){

        BatchSample batchSample = new BatchSample();

        batchSample.setCode(batchSampleMap.get("code").toString());

        Batch batch = new Batch();
        batch.setUuid(((Map) batchSampleMap.get("batch")).get("uuid").toString());

        batchSample.setBatch(batch);

        return batchSample;
    }
}
