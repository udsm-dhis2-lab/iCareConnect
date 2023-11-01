package org.openmrs.module.icare.core.models;

import org.openmrs.*;
import org.openmrs.api.context.Context;

import javax.persistence.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "encounter_workflow_state")
public class EncounterWorkflowState extends BaseOpenmrsData {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "encounter_workflow_state_id", unique = true, nullable = false)
	private Integer id;
	
	@ManyToOne
	@JoinColumn(name = "encounter_id", nullable = false)
	private Encounter encounter;
	
	@ManyToOne
	@JoinColumn(name = "program_workflow_state_id", nullable = false)
	private ProgramWorkflowState programWorkflowState;
	
	public Integer getId() {
		return id;
	}
	
	@Override
	public void setId(Integer id) {
		this.id = id;
	}
	
	public Encounter getEncounter() {
		return encounter;
	}
	
	public void setEncounter(Encounter encounter) {
		this.encounter = encounter;
	}
	
	public ProgramWorkflowState getProgramWorkflowState() {
		return programWorkflowState;
	}
	
	public void setProgramWorkflowState(ProgramWorkflowState programWorkflowState) {
		this.programWorkflowState = programWorkflowState;
	}
	
	public static EncounterWorkflowState fromMap(Map<String, Object> encounterWorkflowStateMap) {
		EncounterWorkflowState encounterWorkflowState = new EncounterWorkflowState();
		if (encounterWorkflowStateMap.get("programWorkflowState") != null) {
			ProgramWorkflowState programWorkflowState = new ProgramWorkflowState();
			programWorkflowState.setUuid(((Map) encounterWorkflowStateMap.get("programWorkflowState")).get("uuid")
			        .toString());
			encounterWorkflowState.setProgramWorkflowState(programWorkflowState);
		}
		
		if (encounterWorkflowStateMap.get("encounters") != null) {
			for (Map<String, Object> encounterMap : (List<Map<String, Object>>) encounterWorkflowStateMap.get("encounters")) {
				
				Encounter encounter = Context.getEncounterService().getEncounterByUuid(encounterMap.get("uuid").toString());
				encounter.setUuid(encounterMap.get("uuid").toString());
				encounterWorkflowState.setEncounter(encounter);
			}
		}
		
		return encounterWorkflowState;
	}
	
	public Map<String,Object> toMap(){
        Map<String,Object> encounterWorkflowStateMap = new HashMap<>();

        if(this.getUuid() != null){
            encounterWorkflowStateMap.put("uuid", this.getUuid());
        }

        if(this.getEncounter() != null){
            Map<String, Object> encounterMap = new HashMap<>();
            encounterMap.put("uuid", this.encounter.getUuid());
            encounterWorkflowStateMap.put("encounter",encounterMap);
        }

        if(this.getProgramWorkflowState() != null){
            Map<String, Object> stateMap = new HashMap<>();
            stateMap.put("uuid",this.programWorkflowState.getUuid());
            encounterWorkflowStateMap.put("programWorkflowState",stateMap);
        }

        return encounterWorkflowStateMap;
    }
}
