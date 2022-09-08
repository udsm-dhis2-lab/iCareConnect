package org.openmrs.module.icare.core;

import org.openmrs.Location;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Summary {

    private Long allPatients;

    private Long activeVisits;

    private Map<Location, Long> locations;

    public Map<String, Object> toMap(){
        Map<String,Object> result = new HashMap<>();
        result.put("allPatients", this.getAllPatients());
        result.put("activeVisits", this.getActiveVisits());
        List<Map<String,Object>> locationsList = new ArrayList<>();

        for (Map.Entry<Location, Long> entry : locations.entrySet()){
            Map<String,Object> locationMap = new HashMap<>();
            locationMap.put("uuid", entry.getKey().getUuid());
            locationMap.put("name", entry.getKey().getName());
            locationMap.put("activeVisits", entry.getValue());
            locationsList.add(locationMap);
        }
        result.put("locations", locationsList);
        return result;
    }

    public Long getActiveVisits() {
        return activeVisits;
    }

    public void setActiveVisits(Long activeVisits) {
        this.activeVisits = activeVisits;
    }

    public Long getAllPatients() {
        return allPatients;
    }

    public void setAllPatients(Long allPatients) {
        this.allPatients = allPatients;
    }

    public Map<Location, Long> getLocations() {
        return locations;
    }

    public void setLocations(Map<Location, Long> locations) {
        this.locations = locations;
    }
}
