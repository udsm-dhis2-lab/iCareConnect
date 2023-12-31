SELECT `HUDHURIO_LA_KWANZA`,(@row_number:=@row_number+1) AS "Na",TAREHE,`JINA_LA_MGONJWA`,`MAHALI_ANAISHI`,UMRI,`JINSIA_YA_MGONJWA`,`UZITO(kg)`,`UREFU(cm)`,`VIPIMO`,`MATOKEO_YA_VIPIMO`,DIAGNOSIS,`MATIBABU`,`MATOKEO_YA_MAHUDHURIO`,`MALIPO` FROM(
    SELECT
          CASE WHEN COUNT(othervisit.visit_id)> 0  THEN '' ELSE '*' END AS `HUDHURIO_LA_KWANZA`,
          DATE_FORMAT(CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'), "%d/%m/%Y %h:%i %p") AS TAREHE,
          CASE WHEN pn.middle_name IS NOT NULL THEN UPPER(CONCAT(pn.given_name,' ',pn.middle_name,' ',pn.family_name)) ELSE UPPER(CONCAT(pn.given_name,' ',pn.family_name)) END AS `JINA_LA_MGONJWA`,
          CASE WHEN pa.state_province IS NOT NULL THEN UPPER(CONCAT(pa.city_village,',',pa.state_province,' - ',pa.address1)) ELSE UPPER(CONCAT(pa.address2,',',pa.county_district,' - ',pa.address4)) END AS `MAHALI_ANAISHI`,
          CASE WHEN (TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 AND (TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 THEN CONCAT((TIMESTAMPDIFF(DAY,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Day(s)") WHEN (TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) =0 AND (TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))) !=0 THEN CONCAT((TIMESTAMPDIFF(MONTH,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Month(s)") ELSE CONCAT((TIMESTAMPDIFF(YEAR,p.birthdate,CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'))),' ',"Year(s)") END AS UMRI,
          CASE WHEN p.gender='M' THEN 'Me'  ELSE 'Ke' END AS `JINSIA_YA_MGONJWA`,
          GROUP_CONCAT(DISTINCT CASE WHEN ob2.concept_id='165861' THEN ob2.value_numeric  ELSE null END) AS `UZITO(kg)`,
          GROUP_CONCAT(DISTINCT CASE WHEN ob2.concept_id='165860' THEN ob2.value_numeric  ELSE null END) AS `UREFU(cm)`,
          GROUP_CONCAT(DISTINCT CASE WHEN ot.name='Test Order' THEN test_order_concept_name.name ELSE NULL END) AS `VIPIMO`,
          GROUP_CONCAT(DISTINCT CASE WHEN test_result_concept_name.name IS NULL THEN CONCAT(test_order_concept_name.name,'-',ob.value_text) ELSE CONCAT(test_order_concept_name.name,'-',test_result_concept_name.name) END)AS `MATOKEO_YA_VIPIMO`,
          GROUP_CONCAT(DISTINCT CASE WHEN ed.certainty='CONFIRMED' THEN diagnosis_concept_name.name ELSE NULL END) AS DIAGNOSIS,
          GROUP_CONCAT(DISTINCT d.name) AS `MATIBABU`,
          GROUP_CONCAT(DISTINCT result_encounter_type.name) AS `MATOKEO_YA_MAHUDHURIO`,
          payment_concept_name.name AS `MALIPO`
       FROM visit v
        -- INNER JOIN visit_type vt ON vt.visit_type_id=v.visit_type_id
       -- Addressing names and address
       INNER JOIN person p ON p.person_id=v.patient_id
       INNER JOIN person_name pn ON p.person_id=pn.person_id and pn.preferred =1
       LEFT JOIN person_address pa ON p.person_id=pa.person_id and pa.preferred =1
       -- Addressing hudhuriao la kwanza
       LEFT JOIN visit othervisit ON p.person_id=othervisit.patient_id
       AND othervisit.visit_id <> v.visit_id AND othervisit.date_started < v.date_started  AND YEAR(othervisit.date_started)=YEAR(v.date_started)
       -- Addressing vipimo vilivyoagizwa
       LEFT JOIN encounter test_order_encounter ON test_order_encounter.visit_id=v.visit_id
       LEFT JOIN orders test_order_order ON test_order_order.encounter_id=test_order_encounter.encounter_id
       LEFT JOIN order_type ot ON ot.order_type_id=test_order_order.order_type_id
       LEFT JOIN concept test_order_concept ON test_order_concept.concept_id=test_order_order.concept_id
       LEFT JOIN concept_name test_order_concept_name ON test_order_concept_name.concept_id=test_order_concept.concept_id AND test_order_concept_name.concept_name_type='FULLY_SPECIFIED'
       -- Addressing Matokeo ya vipimo
       LEFT JOIN obs ob ON ob.order_id=test_order_order.order_id
       LEFT JOIN concept_name test_result_concept_name ON test_result_concept_name.concept_id=ob.value_coded AND test_result_concept_name.concept_name_type = 'FULLY_SPECIFIED'
       -- Addressing other vitals obs
        LEFT JOIN obs ob2 ON ob2.encounter_id=test_order_encounter.encounter_id
       -- Addressing Diagnosis
       LEFT JOIN encounter diagnosis_encounter ON diagnosis_encounter.visit_id=v.visit_id
       LEFT JOIN encounter_diagnosis ed ON ed.encounter_id=diagnosis_encounter.encounter_id
       LEFT JOIN concept diagnosis_concept ON ed.diagnosis_coded=diagnosis_concept.concept_id
       LEFT JOIN concept_name diagnosis_concept_name ON diagnosis_concept_name.concept_id=diagnosis_concept.concept_id
       -- Addressing Matibabu
       LEFT JOIN prescription do ON do.order_id=test_order_order.order_id
       LEFT JOIN drug d ON d.drug_id=do.drug_inventory_id
       -- MATOKEO
       -- LEFT JOIN encounter result_encounter ON result_encounter.visit_id=v.visit_id
       LEFT JOIN encounter_type result_encounter_type ON diagnosis_encounter.encounter_type=result_encounter_type.encounter_type_id
       AND (result_encounter_type.encounter_type_id =1 OR result_encounter_type.encounter_type_id =2 OR result_encounter_type.encounter_type_id =22)
       -- MALIPO
       LEFT JOIN visit_attribute va ON va.visit_id = v.visit_id AND va.attribute_type_id=1
       LEFT JOIN concept visit_attribute_concept ON va.value_reference=visit_attribute_concept.uuid
       LEFT JOIN concept_name payment_concept_name ON payment_concept_name.concept_id=visit_attribute_concept.concept_id
       -- WHERE v.uuid='15eb0b9a-f1bf-4333-8c3f-28de3ae19866'
       -- ADDRESSING VISIT TYPE
       -- LEFT JOIN visit_type vt ON vt.visit_type_id=v.visit_type_id
       WHERE (v.visit_type_id=2 OR v.visit_type_id=5) AND v.voided=0 AND CAST(CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT') AS DATE) BETWEEN :startDate AND :endDate
       GROUP BY v.visit_id,v.date_started,`JINA_LA_MGONJWA`,`MAHALI_ANAISHI`,v.uuid, payment_concept_name.name
       ORDER BY v.date_started ASC) AS VISITDETAILS, (SELECT @row_number:=0) AS temp

