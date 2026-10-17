# HYT ATS - Multi-Domain Golden Set Labelling Guide

## Benchmark Overview
The HYT ATS Golden Benchmark is a multi-domain evaluation dataset comprising 200 hand-calibrated candidate-job pairs spanning 10 diverse professional disciplines:
1. **Accounting & Finance:** Corporate GAAP, General Ledger, AP/AR, Tax Compliance (Staff Accountant).
2. **Culinary Arts & Food Service:** High-volume scratch kitchens, ServSafe, station prep, line execution (Line Cook / Chef).
3. **Legal Practice:** Trusts & Estates, elder law, probate litigation, statutory counsel (Senior Associate Attorney).
4. **Healthcare & Therapy:** Outpatient clinical psychotherapy, DSM-5, treatment planning, HIPAA compliance (Mental Health Therapist).
5. **Human Resources:** Full-lifecycle recruiting, employee relations, HRIS, labor law compliance (HR Manager).
6. **Commercial & Technical Sales:** B2B territory growth, CRM pipeline management, industrial hydraulics (Industrial Sales Rep).
7. **Mechanical Engineering:** Robotics hardware design, SolidWorks CAD, FEA structural analysis (Senior Mechanical Engineer).
8. **Information Technology:** Web architecture, React, Node.js, REST APIs, cloud databases (Full Stack Software Engineer).
9. **Aviation & Aerospace:** Avionics embedded software, DO-178C certification, flight control telemetry (Flight Software Engineer).
10. **Creative & Motion Design:** Adobe After Effects, Premiere, typography, visual storytelling (Motion Graphic Designer).

---

## Labelling Protocol & Required Fields
In `golden_labels.csv`, every candidate-job pair is evaluated across:
- `human_fit_score`: Integer 1-5 (see scale below).
- `human_decision`: One of `advance`, `escalate`, or `reject`.
- `human_rationale`: 1-2 sentence evidence-grounded justification citing demonstrated qualifications or deficits.
- `is_career_switcher`: `yes` if transitioning across adjacent or non-traditional disciplines with transferable skills.
- `is_overqualified`: `yes` if YoE or executive seniority significantly exceeds the position scope.
- `has_relevant_github`: `yes` if a portfolio or code repository is present.

---

## 5-Point Recruiter Fit Scale

| Score | Rating | Recruiter Standard |
|:---:|:---|:---|
| **5** | Excellent Fit | Demonstrates mastery across all core must-haves with direct verified domain evidence. |
| **4** | Solid Fit | Meets primary requirements with minor gaps in secondary tooling. Clear shortlist. |
| **3** | Borderline / Transferable | Partial fit or career switcher with transferable capabilities. Requires recruiter phone screen. |
| **2** | Weak Fit | Minimal overlapping competencies; significant deficits in required hard skills. |
| **1** | Direct Mismatch | Unrelated domain, wrong technical discipline, or failure to meet baseline thresholds. |

---

## Decision Routing Matrix
- `advance`: Fit Score 4-5 AND no critical red flags.
- `escalate`: Fit Score 2-4 with ambiguity, career switchers, or overqualified executive profiles.
- `reject`: Fit Score 1-2 with irreconcilable domain disparity.
