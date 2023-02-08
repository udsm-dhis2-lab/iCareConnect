import { monthsOfTheYear } from "../constants/constants.constants";

export function getCurrentDate() {
  const now = new Date();

  now.setMinutes(now.getMinutes());
  return (
    now.getFullYear() +
    "-" +
    formatNumber((now.getMonth() + 1).toString()) +
    "-" +
    formatNumber(now.getDate().toString()) +
    "T" +
    now.getHours() +
    ":" +
    now.getMinutes() +
    ":" +
    now.getSeconds() +
    ".000+0530"
  );
}

function formatNumber(n) {
  if (n.length == 1) {
    return "0" + n;
  } else {
    return n;
  }
}

export function formatDateToYYMMDD(dateValue) {
  return (
    dateValue.getFullYear() +
    "-" +
    formatMonthOrDate(dateValue.getMonth() + 1, "m") +
    "-" +
    formatMonthOrDate(dateValue.getDate(), "d")
  );
}

function formatMonthOrDate(value, type) {
  if (type == "m" && value.toString().length == 1) {
    return "0" + value;
  } else if (type == "d" && value.toString().length == 1) {
    return "0" + value;
  } else {
    return value;
  }
}

export function getMonthYearRepresentation(dateId) {
  return ((
    monthsOfTheYear.filter(
      (monthYear) => monthYear?.value === dateId.substring(4)
    ) || []
  ).map((monthYearFiltered) => {
    return monthYearFiltered?.name + " " + dateId.substring(0, 4);
  }) || [])[0];
}

export function dateToISOStringMidnight(date: Date) {
  const year = date.getFullYear();
  const month =
    (date.getMonth() + 1).toString().length > 1
      ? `${date.getMonth() + 1}`
      : `0${date.getMonth() + 1}`;
  const day =
    date.getDate().toString().length > 1
      ? `${date.getDate()}`
      : `0${date.getDate()}`;
  return `${year}-${month}-${day}T00:00:00.000Z`;
}
