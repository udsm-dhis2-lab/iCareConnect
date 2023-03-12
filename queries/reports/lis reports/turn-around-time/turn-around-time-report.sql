SELECT
sp.label AS 'Lab Number',
test_order_concept_name.name AS Test,
CASE WHEN spstatus.status = 'PRIORITY' THEN cn.name ELSE NULL END AS Priority,
'' AS 'HFac',
'' AS 'Wrd/Clin',
'' AS 'WorkArea',
CASE WHEN spstatus.status = 'RECEIVED_ON' THEN spstatus.remarks ELSE NULL END AS `received on`,
DATE_FORMAT(CONVERT_TZ(sp.date_time,'Etc/GMT+3','GMT'), "%d/%m/%Y %h:%i %p") AS 'Accession Date'


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
;