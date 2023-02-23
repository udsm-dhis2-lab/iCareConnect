SELECT test,health_facility,number_of_requests,number_of_rejects,(number_of_rejects/number_of_requests)*100 AS percentage_of_rejects,rejection_reason
FROM(
 SELECT
		test_order_concept_name.name  AS test,
        CASE WHEN va.attribute_type_id=7 THEN l.name ELSE NULL END AS "health_facility",
        SUM(IF(test_order_concept.concept_id =219902, 1, 0)) AS "number_of_requests",
        SUM(IF(test_order_concept.concept_id =219902 AND (spstatus.category = 'REJECTED_LABORATORY' OR spstatus.category ='REJECTED_REGISTRATION'), 1, 0)) AS "number_of_rejects",
        "" AS "percentage_of_rejects",
        cn.name AS "rejection_reason"

		FROM lb_sample sp
     	INNER JOIN lb_sample_status spstatus ON spstatus.sample_id = sp.sample_id
		INNER JOIN concept c ON c.uuid = spstatus.status
		INNER JOIN concept_name cn ON cn.concept_id = c.concept_id and cn.concept_name_type = 'FULLY_SPECIFIED'
     	INNER JOIN visit v ON v.visit_id = sp.visit_id

        -- Addressing hospital
        LEFT JOIN visit_attribute va ON va.visit_id = v.visit_id
        LEFT JOIN location l on l.uuid = va.value_reference

     	-- Addressing vipimo vilivyoagizwa
     	INNER JOIN encounter test_order_encounter ON test_order_encounter.visit_id=v.visit_id
     	INNER JOIN orders test_order_order ON test_order_order.encounter_id=test_order_encounter.encounter_id
     	INNER JOIN order_type ot ON ot.order_type_id=test_order_order.order_type_id AND ot.name='Test Order'
     	INNER JOIN concept test_order_concept ON test_order_concept.concept_id=test_order_order.concept_id
     	INNER JOIN concept_name test_order_concept_name ON test_order_concept_name.concept_id=test_order_concept.concept_id AND test_order_concept_name.concept_name_type='FULLY_SPECIFIED'

		WHERE v.voided=0 AND CAST(CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT') AS DATE) BETWEEN "2022-01-01" AND "2023-12-02"
		GROUP BY health_facility,test,cn.name)	AS A
