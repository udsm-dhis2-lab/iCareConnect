import { getSanitizedReportParamType } from '../helpers/get-sanitized-report-param-type.helper';
import { Report } from './report.model';

export interface ReportGroup {
  id: string;
  name: string;
  reports: Report[];
}
