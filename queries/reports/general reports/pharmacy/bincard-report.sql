SELECT
ledger.date_created AS Date,
'' AS `Receipt from / Issued to`,
CASE WHEN lt.operation='+' THEN ledger.quantity ELSE '' END AS `Quantity Received`,
'' AS `Quantity Issued`,
ledger.expiry_date AS `Expiry Date`,
CASE WHEN lt.operation='-' THEN ledger.quantity ELSE '' END AS `Losses/ Adjusments`,
CASE WHEN lt.operation='-' THEN '' ELSE '' END AS Balance,
ledger.remarks AS Remarks,
user.username AS `Issued / Received By `
FROM st_ledger ledger
LEFT JOIN st_stock stock ON stock.item_id = ledger.item_id
LEFT JOIN st_ledger_type lt ON lt.ledger_type_id=ledger.ledger_type_id
LEFT JOIN users user ON user.user_id=ledger.creator
LEFT JOIN item it ON it.item_id =ledger.item_id
-- INNER JOIN st_transaction trs ON trs.item_id=ledger.item_id AND trs.batch_no=ledger.batch_no
LEFT JOIN location loc ON loc.location_id=ledger.location_id
WHERE it.uuid='0e3e09b9-07ae-480a-93c7-f378fa260c2b' AND loc.uuid='4187da6a-262f-45cf-abf1-a98ae80d0b8b'
AND ledger.date_created BETWEEN '2022-01-01' AND '2022-10-10'

UNION

SELECT
 issue.date_created as Date,
 loc.name as `Receipt from / Issued to`,
 '' AS `Quantity Received`,
 issue_item.quantity  AS `Quantity Issued`,
 issue_item.expiry_date AS `Expiry Date`,
 '' AS `Losses/ Adjusments`,
 '' AS Balance,
 st_status.remarks AS Remarks,
 user.username AS `Issued / Received By `
 FROM st_issue_item as issue_item
 LEFT JOIN st_issue issue ON issue_item.issue_id=issue.issue_id
 LEFT JOIN location loc ON loc.location_id=issue.issued_location_id
 LEFT JOIN st_stock stock ON stock.item_id=issue_item.item_id
 INNER JOIN st_issue_status st_status ON st_status.issue_id=issue.issue_id AND st_status.remarks LIKE '%received%'
 LEFT JOIN users user ON user.user_id=st_status.creator
 LEFT JOIN item it ON it.item_id=issue_item.item_id
 LEFT JOIN location loc2 ON loc2.location_id=issue.issueing_location_id
 WHERE it.uuid='0e3e09b9-07ae-480a-93c7-f378fa260c2b' AND loc2.uuid='4187da6a-262f-45cf-abf1-a98ae80d0b8b'
 AND issue.date_created BETWEEN '2020-01-01' AND '2022-10-10'
 ORDER BY date ASC;