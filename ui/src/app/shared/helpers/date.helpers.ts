import * as moment from "moment";

export function getDateDifferenceYearsMonthsDays(d1, d2) {
  var DateDiff = {
    inDays: function (d1, d2) {
      var t2 = d2.getTime();
      var t1 = d1.getTime();

      return (t2 - t1) / (24 * 3600 * 1000);
    },

    inWeeks: function (d1, d2) {
      var t2 = d2.getTime();
      var t1 = d1.getTime();

      return (t2 - t1) / (24 * 3600 * 1000 * 7);
    },

    inMonths: function (d1, d2) {
      var d1Y = d1.getFullYear();
      var d2Y = d2.getFullYear();
      var d1M = d1.getMonth();
      var d2M = d2.getMonth();

      return d2M + 12 * d2Y - (d1M + 12 * d1Y);
    },

    inYears: function (d1, d2) {
      return d2.getFullYear() - d1.getFullYear();
    },
  };
  var months = DateDiff.inYears(d1, d2) * 12;
  var month = DateDiff.inMonths(d1, d2) - months;
  var days = DateDiff.inYears(d1, d2) * 365;

  var dy = DateDiff.inDays(d1, d2) - days - month * 30;
  return {
    years: DateDiff.inYears(d1, d2),
    months: month,
    days: dy,
  };
}

export function getAgeInYearsMontthsDays(birthdate) {
  var DOB = new Date(birthdate);
  var today = new Date();
  var age = today.getTime() - DOB.getTime();
  var elapsed = new Date(age);
  var year = elapsed.getFullYear() - 1970;
  var month = elapsed.getMonth();
  var day = elapsed.getDate();

  return {
    years: year,
    months: month,
    days: day,
  };
}
