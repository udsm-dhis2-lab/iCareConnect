import { createAction, props } from "@ngrx/store";

export const loadLabSamplesByCollectionDates = createAction(
  "[Lab samples] load lab samples",
  props<{
    datesParameters: any;
    patients: any[];
    sampleTypes: any;
    departments: any;
    containers: any;
    configs: any;
    codedSampleRejectionReasons: any;
    hasStatus?: string;
    category?: string;
  }>()
);

export const loadLabSamplesByVisit = createAction(
  "[Lab samples] load lab samples for visit",
  props<{
    visit: string;
    sampleTypes: any;
    departments: any;
    containers: any;
    configs: any;
    codedSampleRejectionReasons: any;
  }>()
);

export const addFormattedLabSamples = createAction(
  "[Lab samples] add loaded and formatted lab samples",
  props<{ samples: any[] }>()
);

export const setLoadedSamples = createAction(
  "[Lab samples] set loaded lab samples",
  props<{ labSamples: any[] }>()
);

export const updateLabSample = createAction(
  "[Lab Sample] update sample",
  props<{ sample: any }>()
);

export const updateLabSamples = createAction(
  "[Lab Sample] update lab samples",
  props<{ samples: any[] }>()
);

export const collectSample = createAction(
  "[Sample] collect sample",
  props<{ sampleData: any; details: any; priorityDetails: any }>()
);

export const creatingSampleFails = createAction(
  "[Sample] creating samples works",
  props<{ error: any }>()
);

export const setSampleStatus = createAction(
  "[Sample] set sample status",
  props<{ status: any; details: any }>()
);

export const acceptSample = createAction(
  "[Sample] accept sample",
  props<{ status: any; details: any }>()
);

export const setSampleStatusFails = createAction(
  "[Sample] setting sample status fails",
  props<{ error: any }>()
);

// export const getCollectedSamples = createAction(
//   '[Samples] get collected samples'
// );

// export const addCollectedSamples = createAction(
//   '[Samples] add collected samples',
//   props<{ samples: any }>()
// );

export const saveTestsContainerAllocation = createAction(
  "[Sample] save test container details",
  props<{ orders: any; sampleDetails: any }>()
);

export const saveLabTestResults = createAction(
  "[Sample] save lab results",
  props<{
    results: any;
    comments: any;
    sampleDetails: any;
    concept: any;
    allocation: any;
  }>()
);

export const saveLabTestResultsStatus = createAction(
  "[Sample] save lab results status",
  props<{
    resultsStatus: any;
    sampleDetails: any;
    concept: any;
    allocation: any;
  }>()
);

export const markSampleAsToRecollect = createAction(
  "[Sample] save lab results status",
  props<{ reCollectStatus: any; sampleDetails: any }>()
);

export const clearLoadedLabSamples = createAction(
  "[Samples] clear loaded lab samples"
);

export const addReloadedLabSamples = createAction(
  "[Samples] add new loaded samples",
  props<{ newSamples: any }>()
);
