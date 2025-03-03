import { ConsultationService } from './consultation.service';
import { FingerprintService } from './finger-print.service';

export const sharedServices: any[] = [ConsultationService,FingerprintService];
export { ConsultationService,FingerprintService };
