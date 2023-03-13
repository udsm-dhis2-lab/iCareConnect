-- SELECT lab_no,test,priority,health_facility,work_area,received_on,registered_on,A,collection_registration,received_registration,requested_full_result,requested_reviewed FROM(
SELECT
sp.label AS lab_no,
test_order_concept_name.name AS test,
(SELECT GROUP_CONCAT(DISTINCT  cn.name)
		FROM lb_sample_status spstatus
        INNER JOIN concept c ON c.uuid = spstatus.remarks
		INNER JOIN concept_name cn ON cn.concept_id = c.concept_id and cn.concept_name_type = 'FULLY_SPECIFIED'
        WHERE spstatus.sample_id = sp.sample_id AND spstatus.status = 'PRIORITY'

    ) AS priority,
(SELECT GROUP_CONCAT(DISTINCT CASE WHEN va.attribute_type_id=7 THEN l.name ELSE NULL END)
        FROM visit v
        LEFT JOIN visit_attribute va ON va.visit_id = v.visit_id
        LEFT JOIN location l on l.uuid = va.value_reference
        WHERE  v.visit_id = sp.visit_id
		) AS 'health_facility',

(SELECT GROUP_CONCAT( DISTINCT cn.name)
        FROM concept_name cn
        INNER JOIN concept c1 ON c1.concept_id = cn.concept_id AND c1.class_id=36
        WHERE  c1.concept_id = sp.concept_id AND cn.concept_name_type = 'FULLY_SPECIFIED'
		) AS 'work_area',
(SELECT GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'RECEIVED_ON' THEN spstatus.remarks ELSE NULL END)
     	FROM lb_sample_status spstatus
        WHERE spstatus.sample_id = sp.sample_id
    ) AS 'received_on',
DATE_FORMAT(CONVERT_TZ(sp.date_time,'Etc/GMT+3','GMT'), "%d/%m/%Y %h:%i %p") AS 'registered_on',
UNIX_TIMESTAMP(sp.date_time) AS A,
(SELECT GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'COLLECTED_ON' THEN spstatus.remarks/1000 ELSE NULL END)
        FROM lb_sample_status spstatus
        WHERE spstatus.sample_id = sp.sample_id
    ) AS B,
-- CASE WHEN spstatus.status = 'COLLECTED_ON' THEN (UNIX_TIMESTAMP(CONVERT_TZ(sp.date_time,'Etc/GMT+3','GMT'))- spstatus.remarks )/60 ELSE NULL END AS collection_registration,
(SELECT GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'COLLECTED_ON' THEN ROUND((UNIX_TIMESTAMP(sp.date_time)- spstatus.remarks/1000 )/60,2) ELSE NULL END)
        FROM lb_sample_status spstatus
        WHERE spstatus.sample_id = sp.sample_id
    ) AS collection_registration,
(SELECT GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'RECEIVED_ON' THEN ROUND((UNIX_TIMESTAMP(sp.date_time)- spstatus.remarks/1000 )/60,2) ELSE NULL END)
        FROM lb_sample_status spstatus
        WHERE spstatus.sample_id = sp.sample_id
    ) AS received_registration,
(SELECT GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'HAS RESULTS' THEN ROUND((UNIX_TIMESTAMP(spstatus.timestamp)- UNIX_TIMESTAMP(sp.date_time) )/60,2) ELSE NULL END)
        FROM lb_sample_status spstatus
        WHERE spstatus.sample_id = sp.sample_id
    ) AS requested_full_result,
(SELECT GROUP_CONCAT( DISTINCT CASE WHEN spstatus.status = 'AUTHORIZED' THEN ROUND((UNIX_TIMESTAMP(spstatus.timestamp)- UNIX_TIMESTAMP(sp.date_time) )/60,2) ELSE NULL END)
        FROM lb_sample_status spstatus
        INNER JOIN lb_sample_order so ON so.sample_id = spstatus.sample_id  AND so.order_id = test_order_order.order_id
        WHERE spstatus.sample_id = sp.sample_id
    ) AS requested_reviewed



	FROM lb_sample sp
    INNER JOIN lb_sample_status spstatus ON spstatus.sample_id = sp.sample_id
    LEFT JOIN concept c ON c.uuid = spstatus.remarks
    LEFT JOIN concept_name cn ON cn.concept_id = c.concept_id and cn.concept_name_type = 'FULLY_SPECIFIED'
	INNER JOIN visit v ON v.visit_id = sp.visit_id
	-- Addressing vipimo vilivyoagizwa
	INNER JOIN encounter test_order_encounter ON test_order_encounter.visit_id=v.visit_id
	INNER JOIN orders test_order_order ON test_order_order.encounter_id=test_order_encounter.encounter_id
	INNER JOIN order_type ot ON ot.order_type_id=test_order_order.order_type_id AND ot.name='Test Order'
	INNER JOIN concept test_order_concept ON test_order_concept.concept_id=test_order_order.concept_id
	INNER JOIN concept_name test_order_concept_name ON test_order_concept_name.concept_id=test_order_concept.concept_id AND test_order_concept_name.concept_name_type='FULLY_SPECIFIED'
    WHERE CAST(CONVERT_TZ(sp.date_time,'Etc/GMT+3','GMT') AS DATE) BETWEEN '2023-03-10'AND '2023-03-30'
    GROUP BY sp.sample_id,test
-- )AS A;