import { AbbreviatePipe } from './abbreviate.pipe';
import { FilterByPipe } from './filter-by.pipe';
import { SearchItemPipe } from './search-item.pipe';
import { HideActionOptionPipe } from './hide-action-option.pipe';
import { WithLoadingPipe } from './with-loading.pipe';
import { NumberToWordsPipe } from './number-to-words.pipe';
import { FilterLocationByServicePipe } from './filter-location-by-service.pipe';
import { FilterFormsByServiceProvidedPipe } from './filter-forms-by-service-provided.pipe';
import { FilterFormsByLocationPipe } from './filter-forms-by-location.pipe';
import { FilterServicesConceptPipe } from './filter-services-concept.pipe';
import { FormatIsoStrDateForDisplayPipe } from './format-iso-str-date-for-display.pipe';
import { FilterDiagnosesPipe } from './filter-diagnoses.pipe';

export const sharedPipes: any[] = [
  FilterByPipe,
  WithLoadingPipe,
  AbbreviatePipe,
  SearchItemPipe,
  HideActionOptionPipe,
  NumberToWordsPipe,
  FilterLocationByServicePipe,
  FilterFormsByServiceProvidedPipe,
  FilterFormsByLocationPipe,
  FilterServicesConceptPipe,
  FormatIsoStrDateForDisplayPipe,
  FilterDiagnosesPipe,
];
