/**
 * HuntYourTribe (HYT ATS) - Lucide SVG Icons Library
 * Clean, modern SVG icons for UI components.
 */

const Icons = {
  logo: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#4F46E5"/>
      <path d="M16 7C14.3431 7 13 8.34315 13 10C13 11.6569 14.3431 13 16 13C17.6569 13 19 11.6569 19 10C19 8.34315 17.6569 7 16 7Z" fill="white"/>
      <path d="M9.5 13C8.11929 13 7 14.1193 7 15.5C7 16.8807 8.11929 18 9.5 18C10.8807 18 12 16.8807 12 15.5C12 14.1193 10.8807 13 9.5 13Z" fill="#C7D2FE"/>
      <path d="M22.5 13C21.1193 13 20 14.1193 20 15.5C20 16.8807 21.1193 18 22.5 18C23.8807 18 25 16.8807 25 15.5C25 14.1193 23.8807 13 22.5 13Z" fill="#C7D2FE"/>
      <path d="M16 14.5C13.2386 14.5 11 16.7386 11 19.5V23H21V19.5C21 16.7386 18.7614 14.5 16 14.5Z" fill="white"/>
      <path d="M7 23V20.5C7 18.567 8.567 17 10.5 17H11.5V20H8.5V23H7Z" fill="#C7D2FE"/>
      <path d="M25 23V20.5C25 18.567 23.433 17 21.5 17H20.5V20H23.5V23H25Z" fill="#C7D2FE"/>
    </svg>`,

  dashboard: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>`,

  briefcase: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>
    </svg>`,

  plusCircle: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
    </svg>`,

  users: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,

  user: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>`,

  userCheck: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>`,

  userX: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/>
    </svg>`,

  fileText: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
    </svg>`,

  search: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>`,

  bell: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>`,

  checkCircle: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,

  clock: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>`,

  shield: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>`,

  terminal: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>
    </svg>`,

  sliders: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/>
      <line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/>
      <line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/>
      <line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/>
      <line x1="17" x2="23" y1="16" y2="16"/>
    </svg>`,

  barChart: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>
    </svg>`,

  gitBranch: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <path d="M18 9a9 9 0 0 1-9 9"/>
    </svg>`,

  alertTriangle: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>`,

  mapPin: (cls = "icon") => `
    <svg class="${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>`,

  chevronRight: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>`,

  chevronLeft: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>`,

  arrowRight: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>`,

  arrowLeft: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>`,

  logOut: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>`,

  sparkles: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
    </svg>`,

  check: (cls = "icon") => `
    <svg class="${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,

  x: (cls = "icon") => `
    <svg class="${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
    </svg>`,

  externalLink: (cls = "icon") => `
    <svg class="${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    </svg>`,

  upload: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>`,

  download: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
    </svg>`,

  refresh: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
    </svg>`,

  menu: (cls = "icon") => `
    <svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>`,

  eye: (cls = "icon") => `
    <svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>`,

  code: (cls = "icon") => `
    <svg class="${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>`
};
