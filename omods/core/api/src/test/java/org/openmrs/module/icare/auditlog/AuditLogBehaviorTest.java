package org.openmrs.module.icare.auditlog;

import org.junit.Test;
import org.openmrs.Concept;
import org.openmrs.ConceptName;

import java.util.List;
import java.util.Locale;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.openmrs.module.icare.auditlog.AuditLog.Action.CREATED;

public class AuditLogBehaviorTest extends BaseBehaviorTest{

    @Test
    public void shouldCreateAnAuditLogEntryWhenANewObjectIsCreated() {
        Concept concept = new Concept();
        ConceptName cn = new ConceptName("new", Locale.ENGLISH);
        cn.setConcept(concept);
        concept.addName(cn);
        concept.setDatatype(conceptService.getConceptDatatype(4));
        concept.setConceptClass(conceptService.getConceptClass(4));
        conceptService.saveConcept(concept);
        List<AuditLog> logs = getAllLogs();
        System.out.println(getAllLogs());
        assertNotNull(concept.getConceptId());
        //Should have created an entry for the concept and concept name
        assertEquals(2, logs.size());
        //The latest logs come first
        assertEquals(CREATED, logs.get(0).getAction());
        assertEquals(CREATED, logs.get(1).getAction());
    }

}
