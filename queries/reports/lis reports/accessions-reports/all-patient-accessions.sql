 SELECT
		sp.label AS "lab_no",
     	DATE_FORMAT(CONVERT_TZ(sp.date_time	,'Etc/GMT+3','GMT'), "%d/%m/%Y %h:%i %p") AS "reg_date",
        pi.identifier AS "file_no",
        GROUP_CONCAT( DISTINCT CASE WHEN spstatus2.status = 'PRIORITY' THEN cn.name ELSE NULL END) AS "priority",
        GROUP_CONCAT(DISTINCT CASE WHEN va.attribute_type_id=7 THEN l.name ELSE NULL END) AS "health_facility",
        GROUP_CONCAT(DISTINCT pa.address1) AS "Address",
        CASE WHEN (TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 AND (TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 THEN CONCAT((TIMESTAMPDIFF(DAY,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Day(s)") WHEN (TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 AND (TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) !=0 THEN CONCAT((TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Month(s)") ELSE CONCAT((TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Year(s)") END AS "age(years)",
		CONCAT((TIMESTAMPDIFF(DAY,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT')))) AS "age(days)",
        DATE_FORMAT(CONVERT_TZ(p.birthdate	,'Etc/GMT+3','GMT'), "%d/%m/%Y ") AS "date_of_birth",
		CASE WHEN p.gender='M' THEN 'M'  ELSE 'F' END AS "sex",
     	GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'COLLECTED_ON' THEN spstatus.remarks ELSE NULL END) AS "collected_on",
        GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'COLLECTED_BY' THEN UPPER(spstatus.remarks) ELSE NULL END) AS "collected_by",
     	GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'RECEIVED_ON' THEN spstatus.remarks ELSE NULL END) AS "received_on",
        GROUP_CONCAT( DISTINCT u.username) AS "received_by",
        GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'DELIVERED_ON' THEN spstatus.remarks ELSE NULL END) AS"delivered_on",
        GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'DELIVERED_BY' THEN UPPER(spstatus.remarks) ELSE NULL END) AS "delivered_by",
        GROUP_CONCAT( DISTINCT CASE WHEN spstatus2.status = 'CONDITION' THEN cn.name ELSE NULL END) AS "specimen_condition",
        GROUP_CONCAT( DISTINCT CASE WHEN spstatus2.status = 'TRANSPORT_CONDITION' THEN cn.name ELSE NULL END) AS "transport_condition",
        GROUP_CONCAT( DISTINCT CASE WHEN spstatus2.status = 'TRANSPORT_TEMPERATURE' THEN cn.name ELSE NULL END) AS "transport_temperature",
        GROUP_CONCAT(DISTINCT diagnosis_concept_name.name) AS "icd_10",
        GROUP_CONCAT(DISTINCT CASE WHEN va.attribute_type_id=16 THEN UPPER(va.value_reference) ELSE NULL END) AS "refering_doctor",
        GROUP_CONCAT(DISTINCT CASE WHEN va.attribute_type_id=18 THEN va.value_reference ELSE NULL END) AS "refering_doctor_email",
        GROUP_CONCAT(DISTINCT CASE WHEN va.attribute_type_id=17 THEN va.value_reference ELSE NULL END) AS "refering_doctor_phone",
        
     	test_order_concept_name.name  AS test
 
		FROM lb_sample sp
     	INNER JOIN lb_sample_status spstatus ON spstatus.sample_id = sp.sample_id
		INNER JOIN lb_sample_status spstatus2 ON spstatus2.sample_id = sp.sample_id
		LEFT JOIN concept c ON c.uuid = spstatus2.remarks
		LEFT JOIN concept_name cn ON cn.concept_id = c.concept_id and cn.concept_name_type = 'FULLY_SPECIFIED'
     	INNER JOIN visit v ON v.visit_id = sp.visit_id
 
         -- Addressing names and address
      	INNER JOIN person p ON p.person_id=v.patient_id
      	INNER JOIN person_name pn ON p.person_id=pn.person_id AND pn.preferred =1
        INNER JOIN patient_identifier pi ON pi.patient_id = v.patient_id AND pi.identifier_type=5
      	LEFT JOIN person_address pa ON p.person_id=pa.person_id AND pa.preferred =1
		
        -- Addressing hospital
        LEFT JOIN visit_attribute va ON va.visit_id = v.visit_id
        LEFT JOIN location l on l.uuid = va.value_reference
        
         -- Addressing user
            INNER JOIN users u on u.user_id = spstatus.user_id
            
 
         --  Addressing Diagnosis
      	LEFT JOIN encounter diagnosis_encounter ON diagnosis_encounter.visit_id=v.visit_id
      	LEFT JOIN encounter_diagnosis ed ON ed.encounter_id=diagnosis_encounter.encounter_id
      	LEFT JOIN concept diagnosis_concept ON ed.diagnosis_coded=diagnosis_concept.concept_id
      	LEFT JOIN concept_name diagnosis_concept_name ON diagnosis_concept_name.concept_id=diagnosis_concept.concept_id AND diagnosis_concept_name.concept_name_type='FULLY_SPECIFIED'
 
     	-- Addressing vipimo vilivyoagizwa
     	INNER JOIN encounter test_order_encounter ON test_order_encounter.visit_id=v.visit_id
     	INNER JOIN orders test_order_order ON test_order_order.encounter_id=test_order_encounter.encounter_id
     	INNER JOIN order_type ot ON ot.order_type_id=test_order_order.order_type_id AND ot.name='Test Order'
     	INNER JOIN concept test_order_concept ON test_order_concept.concept_id=test_order_order.concept_id
     	INNER JOIN concept_name test_order_concept_name ON test_order_concept_name.concept_id=test_order_concept.concept_id AND test_order_concept_name.concept_name_type='FULLY_SPECIFIED'
 
		WHERE v.voided=0 AND CAST(CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT') AS DATE) BETWEEN "2023-01-01" AND "2023-12-02"
		GROUP BY sp.sample_id,test,file_no;
        