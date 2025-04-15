import { ConsultationService } from './consultation.service';
import { FingerprintService } from './finger-print.service';
import { InsuranceService } from './insurance.service';

export const sharedServices: any[] = [ConsultationService,FingerprintService,InsuranceService];
export { ConsultationService,FingerprintService,InsuranceService };
