export interface ICAREApp {
  id?: string;
  icon?: string;
  image?: string;
  name: string;
  path?: string;
  modules?: Array<{ path: string; hidePatientSearch?: boolean }>;
  hidden?: boolean;
  considerLocationRoute?: boolean;
}

export const ICARE_APPS: ICAREApp[] = [
  {
    name: 'Home',
    modules: [{ path: '/', hidePatientSearch: true }],
    hidden: true,
  },
  {
    name: 'Registration',
    id: 'registration',
    icon: 'person_add',
    image: 'assets/material/register.png',
    path: '/registration',
    modules: [
      {
        path: '/registration/home',
        hidePatientSearch: true,
      },
      { path: '/registration/add', hidePatientSearch: true },
    ],
  },
  {
    name: 'Clinic',
    id: 'clinic',
    image: 'assets/material/clinic.png',
    icon: 'pregnant_woman',
    path: '/clinic',
  },
  {
    name: 'Nursing',
    id: 'nursing',
    icon: 'pregnant_woman',
    image: 'assets/material/triage.png',
    path: '/nursing',
  },
  {
    name: 'Diagnostic',
    id: 'diagnostic',
    image: 'assets/material/stethoscope.png',
    icon: 'pregnant_woman',
    path: '/diagnostic',
  },
  {
    name: 'Counselor',
    id: 'counselor',
    image: 'assets/material/counselor.png',
    icon: 'pregnant_woman',
    path: '/counselor',
  },
  {
    name: 'Therapy Clinic',
    id: 'therapy_clinic',
    image: 'assets/material/therapy.png',
    icon: 'pregnant_woman',
    path: '/clinic',
  },
  {
    name: 'Programs',
    id: 'vertical_programs',
    image: 'assets/material/programs.png',
    icon: 'pregnant_woman',
    path: '/vertical-programs',
  },
  {
    name: 'Radiology',
    id: 'radiology',
    image: 'assets/material/radiology.png',
    icon: 'pregnant_woman',
    path: '/radiology',
  },
  {
    name: 'VCT',
    id: 'vct',
    image: 'assets/material/vct.png',
    icon: 'pregnant_woman',
    path: '/nursing',
  },
  {
    name: 'Theatre',
    id: 'theatre',
    image: 'assets/material/theater.png',
    icon: 'pregnant_woman',
    path: '/theatre',
  },
  {
    name: 'Motuary',
    id: 'mortuary',
    image: 'assets/material/stethoscope.png',
    icon: 'pregnant_woman',
    path: '/mortuary',
  },
  {
    name: 'Dispensing',
    id: 'dispensing',
    image: 'assets/material/dispensing.png',
    icon: 'store',
    path: './dispensing',
  },
  {
    name: 'Store',
    id: 'store',
    image: 'assets/material/store.png',
    icon: 'store',
    path: './store',
  },
  {
    name: 'IPD/Observation',
    id: 'inpatient',
    image: 'assets/material/inpatient.png',
    icon: 'bed',
    path: '/inpatient',
    considerLocationRoute: true,
  },
  {
    name: 'Laboratory',
    id: 'laboratory',
    image: 'assets/material/laboratory.png',
    icon: 'local_hospital',
    path: '/laboratory',
  },
  {
    name: 'Cashier',
    id: 'billing',
    image: 'assets/material/cashier.png',
    icon: 'credit_card',
    path: '/billing',
  },
  {
    name: 'E-claim',
    id: 'e-claim',
    image: 'assets/material/cashier.png',
    icon: 'credit_card',
    path: '/e-claim',
  },
  {
    name: 'Social Welfare',
    id: 'billing_exemption',
    image: 'assets/material/welfare.png',
    icon: 'credit_card',
    path: '/billing/exemption',
  },
  {
    name: 'Reports',
    id: 'reports',
    image: 'assets/material/report.png',
    icon: 'bar_chart',
    path: '/reports',
  },
  {
    name: 'Settings',
    id: 'maintenance',
    icon: 'settings',
    image: 'assets/material/settings.png',
    path: '/maintenance',
    modules: [
      {
        path: '/maintenance/price-list',
        hidePatientSearch: true,
      },
    ],
  },
];
