SELECT SUM(issue_item.quantity) as "QUANTITY", d.name as "DRUG", l.name as "ISSUED STORE",
pn.given_name as "FIRST NAME",pn.family_name as "LAST NAME"
	FROM st_issue issue 
	LEFT JOIN st_issue_item issue_item ON issue.issue_id = issue_item.issue_id
	LEFT JOIN item item ON item.item_id = issue_item.item_id
	LEFT JOIN drug d ON d.drug_id = item.drug_id
	LEFT JOIN location l ON l.location_id = issue.issued_location_id
	LEFT JOIN users u ON u.user_id = issue.creator
	LEFT JOIN person p ON p.person_id = u.user_id
	LEFT JOIN person_name pn ON pn.person_id = p.person_id
GROUP BY issue.issued_location_id, d.name,pn.given_name,pn.family_name
