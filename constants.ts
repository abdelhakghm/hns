
import { Subject, FileResource } from './types';

export const DOMAIN_RESTRICTION = '@hns-re2sd.dz';
export const PRIMARY_ADMIN_EMAIL = `abdelhak${DOMAIN_RESTRICTION}`;

// Centralized App Logo
export const APP_LOGO_URL = "https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/hns_logo.png";

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 's1',
    name: 'Photovoltaic Systems',
    category: 'Solar Energy',
    items: [
      { 
        id: 'i1', 
        title: 'Introduction to Semiconductor Physics', 
        type: 'Chapter',
        status: 'completed',
        exercisesSolved: 10,
        totalExercises: 10,
        progressPercent: 100,
        logs: [{ id: 'l1', timestamp: '2024-03-01', note: 'Completed all basic theory.' }]
      },
      { 
        id: 'i2', 
        title: 'P-N Junctions TD', 
        type: 'TD',
        status: 'in-progress',
        exercisesSolved: 4,
        totalExercises: 12,
        progressPercent: 33,
        logs: [{ id: 'l2', timestamp: '2024-03-05', note: 'Solved first 4 problems.' }]
      },
    ]
  },
  {
    id: 's2',
    name: 'Wind Turbine Technology',
    category: 'Wind Energy',
    items: [
      { 
        id: 'i3', 
        title: 'Aerodynamics of Wind Turbines', 
        type: 'Chapter',
        status: 'completed',
        exercisesSolved: 5,
        totalExercises: 5,
        progressPercent: 100,
        logs: []
      }
    ]
  }
];

export const INITIAL_FILES: FileResource[] = [
  {
    id: 'f1',
    title: 'Solar Cell Efficiency Fundamentals',
    description: 'Comprehensive guide on PV cell efficiency limits and semiconductor physics.',
    category: 'Course',
    tags: ['PV', 'Semiconductors', 'Solar'],
    url: '#',
    dateAdded: '2024-03-01',
    fileName: 'pv_fundamentals.pdf'
  },
  {
    id: 'f2',
    title: 'Wind Farm Integration Exam 2023',
    description: 'Final exam questions regarding grid integration and turbine control.',
    category: 'Exam',
    tags: ['Wind', 'Grid', 'Control'],
    url: '#',
    dateAdded: '2023-12-15',
    fileName: 'wind_exam_2023.pdf'
  }
];
