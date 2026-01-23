
import { Subject, FileResource } from './types';

export const DOMAIN_RESTRICTION = '@hns-re2sd.dz';
export const PRIMARY_ADMIN_EMAIL = `abdelhak${DOMAIN_RESTRICTION}`;

/**
 * OFFICIAL HNS INSTITUTIONAL LOGO (Custom SVG)
 * Designed for HNS: Higher School of Renewable Energies.
 * Features a stylized 'H' with Solar and Wind energy motifs.
 */
export const APP_LOGO_URL = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <defs>
    <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' style='stop-color:%2310b981;stop-opacity:1' />
      <stop offset='100%' style='stop-color:%23059669;stop-opacity:1' />
    </linearGradient>
  </defs>
  <circle cx='50' cy='50' r='48' fill='none' stroke='%23f1f5f9' stroke-width='1'/>
  <!-- Stylized H formed by Energy Pillars -->
  <path d='M30 25 V75 M70 25 V75 M30 50 H70' stroke='url(%23grad)' stroke-width='12' stroke-linecap='round'/>
  <!-- Solar Motif -->
  <circle cx='50' cy='35' r='8' fill='%2310b981' opacity='0.8'/>
  <path d='M50 20 V25 M65 35 H60 M50 50 V45 M35 35 H40' stroke='%2310b981' stroke-width='3' stroke-linecap='round'/>
  <!-- Wind Blade Accent -->
  <path d='M70 75 Q85 60 70 45' fill='none' stroke='%2310b981' stroke-width='4' stroke-linecap='round' opacity='0.5'/>
</svg>`.replace(/#/g, '%23');

export const INITIAL_SUBJECTS: Subject[] = [];
export const INITIAL_FILES: FileResource[] = [];
