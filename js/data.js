/* Data for the Selected Work panels. Edit values here; the charts read from this file. */
window.PORTFOLIO_DATA = {

  /* MUF / PRISM replica: every value below is FICTIONAL demo data.
     Nothing here comes from Jira, eazyBI, PRISM or any MUF system. */
  muf: {
    reportDate: '2026-11-14',
    reportingYear: 2026,
    mdPerPersonMonth: 18,            // working days minus leave and sick allowance
    months: ['2026-11', '2026-12', '2027-01'],
    // name, IT section, role
    people: [
      ['Arif D.', 'Application Dev', 'DEV'], ['Bima S.', 'Application Dev', 'DEV'],
      ['Dewi K.', 'Application Dev', 'DEV'], ['Eko P.', 'Application Dev', 'DEV'],
      ['Citra L.', 'Data & Integration', 'DEV'], ['Fani R.', 'Data & Integration', 'DEV'],
      ['Gita M.', 'Quality Assurance', 'UAT'], ['Hadi N.', 'Quality Assurance', 'UAT'],
      ['Indah S.', 'Quality Assurance', 'UAT'], ['Joko W.', 'Quality Assurance', 'UAT'],
      ['Kirana A.', 'Quality Assurance', 'UAT'], ['Lukas T.', 'Quality Assurance', 'UAT']
    ],
    pms: ['Dimas R.', 'Sari W.', 'Bayu K.', 'Nadia P.'],
    phases: ['Not Started', 'Requirement', 'Development', 'SIT', 'UAT', 'Deployment', 'Done'],
    bugTypes: ['Functional', 'UI / UX', 'Data', 'Performance'],
    // code, name, cycle, business unit, PM, phase, plan start, plan end, plan %, actual %,
    // MD plan, MD used, DEV PICs, UAT PICs, DEV subtasks [to do, in progress, done],
    // UAT subtasks [to do, in progress, done], bugs by type (same order as bugTypes)
    projects: [
      ['PRJ-2601', 'Mobile Onboarding Revamp', 'Oncycle', 'Digital Channels', 'Dimas R.', 'Development', '2026-08-03', '2026-12-18', 62, 55, 180, 104, ['Arif D.', 'Bima S.'], ['Gita M.'], [6, 5, 13], [10, 0, 0], [3, 4, 1, 0]],
      ['PRJ-2602', 'Customer Portal SSO', 'Oncycle', 'Digital Channels', 'Sari W.', 'UAT', '2026-06-01', '2026-11-27', 88, 76, 140, 121, ['Bima S.'], ['Gita M.', 'Hadi N.'], [0, 1, 17], [4, 5, 9], [6, 2, 1, 1]],
      ['PRJ-2603', 'Promo Engine', 'Offcycle', 'Digital Channels', 'Dimas R.', 'Requirement', '2026-10-12', '2027-02-26', 18, 15, 120, 14, ['Citra L.'], ['Hadi N.'], [14, 0, 0], [8, 0, 0], [0, 0, 0, 0]],
      ['PRJ-2604', 'Chatbot FAQ', 'Offcycle', 'Digital Channels', 'Nadia P.', 'Deployment', '2026-07-06', '2026-11-20', 95, 93, 70, 66, ['Arif D.'], ['Gita M.'], [0, 0, 11], [0, 1, 8], [2, 1, 0, 0]],
      ['PRJ-2605', 'Loan Origination Workflow', 'Oncycle', 'Core Lending', 'Bayu K.', 'Development', '2026-07-13', '2026-12-31', 66, 48, 220, 120, ['Citra L.', 'Dewi K.'], ['Indah S.'], [12, 6, 10], [12, 0, 0], [4, 1, 3, 0]],
      ['PRJ-2606', 'Credit Scoring API', 'Oncycle', 'Core Lending', 'Bayu K.', 'UAT', '2026-06-15', '2026-11-30', 84, 80, 160, 128, ['Dewi K.'], ['Indah S.', 'Joko W.'], [0, 2, 16], [3, 4, 8], [5, 0, 2, 1]],
      ['PRJ-2607', 'Collection Dashboard', 'Offcycle', 'Core Lending', 'Sari W.', 'Done', '2026-04-06', '2026-10-16', 100, 100, 90, 92, ['Eko P.'], ['Joko W.'], [0, 0, 12], [0, 0, 9], [3, 2, 1, 0]],
      ['PRJ-2608', 'Payment Gateway Upgrade', 'Oncycle', 'Core Lending', 'Nadia P.', 'Development', '2026-08-17', '2027-01-15', 52, 41, 150, 70, ['Eko P.', 'Dewi K.'], ['Joko W.'], [9, 4, 9], [9, 0, 0], [1, 0, 1, 1]],
      ['PRJ-2609', 'Data Warehouse Migration', 'Oncycle', 'Data & Analytics', 'Dimas R.', 'SIT', '2026-05-04', '2026-12-11', 74, 60, 240, 170, ['Fani R.', 'Citra L.'], ['Kirana A.'], [2, 4, 20], [11, 0, 0], [2, 0, 6, 2]],
      ['PRJ-2610', 'Regulatory Report Automation', 'Oncycle', 'Data & Analytics', 'Sari W.', 'UAT', '2026-06-08', '2026-11-25', 90, 87, 110, 98, ['Fani R.'], ['Kirana A.', 'Lukas T.'], [0, 0, 14], [2, 3, 10], [3, 1, 2, 0]],
      ['PRJ-2611', 'Data Quality Monitor', 'Offcycle', 'Data & Analytics', 'Bayu K.', 'Development', '2026-09-07', '2027-01-29', 38, 36, 100, 36, ['Fani R.'], ['Lukas T.'], [8, 3, 5], [7, 0, 0], [0, 1, 0, 0]],
      ['PRJ-2612', 'Customer Segmentation Model', 'Offcycle', 'Data & Analytics', 'Nadia P.', 'Not Started', '2026-12-01', '2027-04-30', 0, 0, 130, 0, [], [], [0, 0, 0], [0, 0, 0], [0, 0, 0, 0]],
      ['PRJ-2613', 'Network Refresh Phase 2', 'Oncycle', 'Infrastructure', 'Sari W.', 'Deployment', '2026-05-18', '2026-11-13', 96, 88, 120, 118, ['Bima S.'], ['Hadi N.'], [0, 1, 15], [0, 2, 10], [1, 0, 0, 3]],
      ['PRJ-2614', 'Backup & DR Drill', 'Offcycle', 'Infrastructure', 'Dimas R.', 'UAT', '2026-08-10', '2026-12-04', 72, 70, 60, 43, ['Arif D.'], ['Lukas T.'], [0, 0, 8], [3, 2, 4], [0, 0, 1, 1]],
      ['PRJ-2615', 'Server OS Upgrade', 'Oncycle', 'Infrastructure', 'Bayu K.', 'Development', '2026-09-01', '2027-01-08', 55, 47, 80, 38, ['Eko P.'], ['Indah S.'], [5, 2, 7], [6, 0, 0], [1, 0, 0, 2]],
      ['PRJ-2616', 'API Gateway Hardening', 'Offcycle', 'Infrastructure', 'Nadia P.', 'Requirement', '2026-11-02', '2027-03-12', 10, 10, 90, 6, ['Bima S.'], ['Hadi N.'], [10, 0, 0], [6, 0, 0], [0, 0, 0, 0]]
    ],
    // project code, issue, type, start, end, duration in hours
    issues: [
      ['PRJ-2601', 'SIT environment unavailable', 'General', '2026-11-03', '2026-11-04', 16],
      ['PRJ-2602', 'Login failure on UAT build', 'Critical', '2026-11-09', '2026-11-10', 9],
      ['PRJ-2605', 'Requirement change on approval flow', 'Critical', '2026-10-26', '2026-11-06', 72],
      ['PRJ-2608', 'Vendor sandbox access delayed', 'General', '2026-11-02', '2026-11-05', 24],
      ['PRJ-2609', 'Source data mismatch in reconciliation', 'Critical', '2026-11-05', '2026-11-12', 40],
      ['PRJ-2613', 'Cutover window rescheduled', 'General', '2026-11-10', '2026-11-11', 8],
      ['PRJ-2615', 'Patch dependency conflict', 'General', '2026-11-11', '2026-11-12', 6]
    ]
  },

  /* Magnus: SIMULATED metrics, 12 weekly points, for visualization only. */
  magnus: [
    { key: 'Website traffic', unit: 'sessions', fmt: 'k', good: 'up', values: [18.2, 18.9, 19.4, 18.7, 21.3, 24.8, 26.1, 25.4, 23.9, 24.6, 25.8, 27.2],
      q: 'Did campaign weeks actually move visits to the site?' },
    { key: 'Conversion rate', unit: '%', fmt: '%', good: 'up', values: [1.9, 2.0, 1.8, 2.1, 2.3, 2.6, 2.5, 2.4, 2.6, 2.7, 2.6, 2.8],
      q: 'The KPI most client reports were ultimately judged against.' },
    { key: 'Bounce rate', unit: '%', fmt: '%', good: 'down', values: [58, 57, 59, 56, 54, 52, 53, 51, 52, 50, 49, 48],
      q: 'Do landing pages deliver what the ad or article promised?' },
    { key: 'User engagement', unit: 'avg. engaged time', fmt: 's', good: 'up', values: [41, 43, 42, 45, 47, 52, 55, 54, 56, 58, 57, 61],
      q: 'Are visitors reading the content, or just arriving?' },
    { key: 'Page load speed', unit: 'seconds to load', fmt: 'sec', good: 'down', values: [3.9, 3.8, 3.9, 3.7, 3.6, 3.4, 3.3, 3.3, 3.1, 3.0, 2.9, 2.8],
      q: 'Slow pages quietly waste paid clicks.' },
    { key: 'SEO performance', unit: 'organic clicks', fmt: 'k', good: 'up', values: [4.1, 4.3, 4.2, 4.6, 4.8, 5.1, 5.0, 5.4, 5.7, 5.9, 6.2, 6.4],
      q: 'Is organic visibility growing as articles are published?' }
  ],

  /* BERT's: REPORTED figures provided by Afrina. Do not mix with simulated numbers. */
  bert: {
    platforms: [
      { name: 'Instagram', audience: 1456661, plays: 2908165, interactions: 141877, kol: 36 },
      { name: 'TikTok', audience: 307981, plays: 533739, interactions: 28770, kol: 11 }
    ],
    overall: { audience: 1764642, plays: 3441904, interactions: 170647, kol: 47 }
  }
};
