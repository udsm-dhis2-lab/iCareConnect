SELECT (@row_number:=@row_number+1) AS "Na",`Visit Date`,`Time (24hrs)`,Name,Gender,`Patient Type`,`Age in yrs`,`Visit Type` FROM(
SELECT
    DATE_FORMAT(DATE(CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT')), '%d-%m-%Y') AS "Visit Date",
    DATE_FORMAT( CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT'), '%H:%i:%s') AS "Time (24hrs)",
    CASE WHEN pn.middle_name IS NOT NULL THEN UPPER(CONCAT(pn.given_name,' ',pn.middle_name,' ',pn.family_name)) ELSE UPPER(CONCAT(pn.given_name,' ',pn.family_name)) END AS Name,
    p.gender AS Gender,
    (SELECT pa.value
		FROM person_attribute pa
        WHERE pa.person_attribute_type_id=68 AND pa.person_id=p.person_id
    ) AS `Patient Type`,
    ROUND(FLOOR(DATEDIFF(CURDATE(), p.birthdate) / 365.25) - 0.4999) AS "Age in yrs",
    vt.name as "Visit Type"
FROM
visit v
INNER JOIN person p ON p.person_id = v.patient_id AND v.patient_id NOT IN(SELECT  pa2.person_id FROM person_attribute pa2 WHERE pa2.person_attribute_type_id = 68)
INNER JOIN person_name pn ON pn.person_id = p.person_id
LEFT JOIN visit_type vt ON vt.visit_type_id = v.visit_type_id

WHERE CONVERT_TZ(v.date_started,'Etc/GMT+3','GMT')  BETWEEN :startDate AND :endDate) AS PATIENTDETAILS, (SELECT @row_number:=0) AS temp