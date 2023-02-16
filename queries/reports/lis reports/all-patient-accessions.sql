SELECT
	DATE_FORMAT(CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'), "%d/%m/%Y %h:%i %p") AS "accession_date",
    u.username AS `accessed_by`,
		UPPER(CONCAT(pn.given_name,' ',pn.family_name)) AS `patient_name`,
	-- CONCAT(pa.city_village,',',pa.state_province,' - ',pa.address1) AS `MAHALI ANAISHI`,
	CASE WHEN (TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 AND (TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 THEN CONCAT((TIMESTAMPDIFF(DAY,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Day(s)") WHEN (TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 AND (TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) !=0 THEN CONCAT((TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Month(s)") ELSE CONCAT((TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Year(s)") END AS age,
    CASE WHEN p.gender='M' THEN 'M'  ELSE 'F' END AS `gender`,
    GROUP_CONCAT(DISTINCT sp.label) AS "lab_no",
    GROUP_CONCAT(DISTINCT diagnosis_concept_name.name) AS `icd_10`,
    GROUP_CONCAT(DISTINCT CASE WHEN spstatus.status = 'COLLECTED_ON' THEN spstatus.remarks ELSE NULL END) AS `collected_on`,
    GROUP_CONCAT(DISTINCT CASE WHEN spstatus.status = 'RECEIVED_ON' THEN spstatus.remarks ELSE NULL END) AS `received_on`,
    GROUP_CONCAT( DISTINCT CASE WHEN spstatus2.status = 'PRIORITY' THEN cn.name ELSE NULL END) AS `routine`,
     CASE WHEN ot.name='Test Order'  THEN test_order_concept_name.name ELSE NULL END AS test
    FROM visit v

	-- Addressing names and address
	INNER JOIN person p ON p.person_id=v.patient_id
	INNER JOIN person_name pn ON p.person_id=pn.person_id AND pn.preferred =1
	LEFT JOIN person_address pa ON p.person_id=pa.person_id AND pa.preferred =1
    LEFT JOIN lb_sample sp ON sp.visit_id = v.visit_id
	INNER JOIN lb_sample_status spstatus ON spstatus.sample_id = sp.sample_id
    INNER JOIN lb_sample_status spstatus2 ON spstatus2.sample_id = sp.sample_id
	LEFT JOIN concept c ON c.uuid = spstatus2.remarks
    LEFT JOIN concept_name cn ON cn.concept_id = c.concept_id and cn.concept_name_type = 'FULLY_SPECIFIED'

    -- Addressing Diagnosis
	LEFT JOIN encounter diagnosis_encounter ON diagnosis_encounter.visit_id=v.visit_id
	LEFT JOIN encounter_diagnosis ed ON ed.encounter_id=diagnosis_encounter.encounter_id
	LEFT JOIN concept diagnosis_concept ON ed.diagnosis_coded=diagnosis_concept.concept_id
	LEFT JOIN concept_name diagnosis_concept_name ON diagnosis_concept_name.concept_id=diagnosis_concept.concept_id

    -- Addressing vipimo vilivyoagizwa
	LEFT JOIN encounter test_order_encounter ON test_order_encounter.visit_id=v.visit_id
	INNER JOIN orders test_order_order ON test_order_order.encounter_id=test_order_encounter.encounter_id
	INNER JOIN order_type ot ON ot.order_type_id=test_order_order.order_type_id AND ot.name='Test Order'
	LEFT JOIN concept test_order_concept ON test_order_concept.concept_id=test_order_order.concept_id
	LEFT JOIN concept_name test_order_concept_name ON test_order_concept_name.concept_id=test_order_concept.concept_id AND test_order_concept_name.concept_name_type='FULLY_SPECIFIED'

    -- Addressing creator
    LEFT JOIN users u on u.user_id = v.creator

    WHERE v.voided=0 AND CAST(CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT') AS DATE) BETWEEN :startDate AND :endDate
    GROUP BY v.visit_id,v.date_started,`patient_name`,test;


    -- Based on sample
--    SELECT
--    	DATE_FORMAT(CONVERT_TZ(sp.date_time	,'Etc/GMT+3','GMT'), "%d/%m/%Y %h:%i %p") AS "accession_date",
--        u.username AS `accessed_by`,
--    		UPPER(CONCAT(pn.given_name,' ',pn.family_name)) AS `patient_name`,
--    	-- CONCAT(pa.city_village,',',pa.state_province,' - ',pa.address1) AS `MAHALI ANAISHI`,
--    	CASE WHEN (TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 AND (TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 THEN CONCAT((TIMESTAMPDIFF(DAY,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Day(s)") WHEN (TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 AND (TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) !=0 THEN CONCAT((TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Month(s)") ELSE CONCAT((TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Year(s)") END AS age,
--        CASE WHEN p.gender='M' THEN 'M'  ELSE 'F' END AS `gender`,
--    	sp.label AS "lab_no",
--    	GROUP_CONCAT(DISTINCT diagnosis_concept_name.name) AS `icd_10`,
--    	GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'COLLECTED_ON' THEN spstatus.remarks ELSE NULL END) AS `collected_on`,
--    	GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'RECEIVED_ON' THEN spstatus.remarks ELSE NULL END) AS `received_on`,
--    	GROUP_CONCAT( DISTINCT CASE WHEN spstatus2.status = 'PRIORITY' THEN cn.name ELSE NULL END) AS `priority`,
--    	test_order_concept_name.name  AS test
--
--         FROM lb_sample sp
--    	INNER JOIN lb_sample_status spstatus ON spstatus.sample_id = sp.sample_id
--        INNER JOIN lb_sample_status spstatus2 ON spstatus2.sample_id = sp.sample_id
--        LEFT JOIN concept c ON c.uuid = spstatus2.remarks
--        LEFT JOIN concept_name cn ON cn.concept_id = c.concept_id and cn.concept_name_type = 'FULLY_SPECIFIED'
--    	INNER JOIN visit v ON v.visit_id = sp.visit_id
--
--       -- Addressing names and address
--     	INNER JOIN person p ON p.person_id=v.patient_id
--     	INNER JOIN person_name pn ON p.person_id=pn.person_id AND pn.preferred =1
--     	LEFT JOIN person_address pa ON p.person_id=pa.person_id AND pa.preferred =1
--
--        -- Addressing creator
--         INNER JOIN users u on u.user_id = sp.creator
--
--         -- Addressing Diagnosis
--     	LEFT JOIN encounter diagnosis_encounter ON diagnosis_encounter.visit_id=v.visit_id
--     	LEFT JOIN encounter_diagnosis ed ON ed.encounter_id=diagnosis_encounter.encounter_id
--     	LEFT JOIN concept diagnosis_concept ON ed.diagnosis_coded=diagnosis_concept.concept_id
--     	LEFT JOIN concept_name diagnosis_concept_name ON diagnosis_concept_name.concept_id=diagnosis_concept.concept_id AND diagnosis_concept_name.concept_name_type='FULLY_SPECIFIED'
--
--    	-- Addressing vipimo vilivyoagizwa
--    	INNER JOIN encounter test_order_encounter ON test_order_encounter.visit_id=v.visit_id
--    	INNER JOIN orders test_order_order ON test_order_order.encounter_id=test_order_encounter.encounter_id
--    	INNER JOIN order_type ot ON ot.order_type_id=test_order_order.order_type_id AND ot.name='Test Order'
--    	INNER JOIN concept test_order_concept ON test_order_concept.concept_id=test_order_order.concept_id
--    	INNER JOIN concept_name test_order_concept_name ON test_order_concept_name.concept_id=test_order_concept.concept_id AND test_order_concept_name.concept_name_type='FULLY_SPECIFIED'
--
--        WHERE v.voided=0 AND CAST(CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT') AS DATE) BETWEEN "2023-01-30" AND "2023-03-01"
--        GROUP BY sp.sample_id,`patient_name`,test
--    ;