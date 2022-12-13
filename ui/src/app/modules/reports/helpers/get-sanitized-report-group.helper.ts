import { ReportGroup } from '../models/report-group.model';
import { ReportParam } from '../models/report-params.model';
import { getSanitizedReportParamType } from './get-sanitized-report-param-type.helper';

export function getSanitizedReportGroup(reportGroupResponse: any): ReportGroup {
  return {
    id: reportGroupResponse?.id,
    name: reportGroupResponse?.name,
    reports: (reportGroupResponse?.reports || []).map((report) => {
      return {
        id: report?.uuid,
        name: report?.name || report?.display,
        ...getSanitizedParameters(report?.parameters),
      };
    }),
  };
}

export function getSanitizedParameters(
  parameterResponse: any[]
): {
  parameters: ReportParam[];
  dateParameters: ReportParam[];
  locationParameters: ReportParam[];
  otherParameters: ReportParam[];
} {
  const reportParameters = (parameterResponse || []).map((param) => {
    return {
      id: param?.name,
      name: param?.label,
      formName: param?.name,
      type: getSanitizedReportParamType(param?.type),
    };
  });
  return {
    parameters: reportParameters,
    dateParameters: reportParameters.filter((param) => param.type === 'DATE'),
    locationParameters: reportParameters.filter(
      (param) => param.type === 'LOCATION'
    ),
    otherParameters: reportParameters.filter(
      (param) => param.type !== 'DATE' && param.type !== 'LOCATION'
    ),
  };
}
