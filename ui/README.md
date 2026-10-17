# HuntYourTribe (HYT ATS) — Modern Frontend

Welcome to the **HuntYourTribe (HYT ATS)** complete web interface.

This frontend reproduces all 4 visual design reference specifications with zero external npm build requirements, high performance, and deep integration with the deterministic Gates 0–8 AI screening pipeline.

---

## 🌟 Architecture Overview

```
ui/
├── index.html              # Main single-page web shell with Inter typography & SVG icons
├── server.py               # Built-in lightweight API & HTTP server (Python standard library)
├── README.md               # Quickstart & documentation
├── css/
│   └── styles.css          # Full design system (indigo #4F46E5, lavender #F5F3FF, cards, tabs, badges)
└── js/
    ├── icons.js            # Lucide SVG icon engine (30+ icons, zero CDN dependency)
    ├── data.js             # Data store connecting JDs, Akshada Kale record, eval_results.json, and audit logs
    ├── landing.js          # Public Landing page, Stats, About, How It Works, Public Jobs, Role Picker, & Login
    ├── candidate.js        # Candidate Dashboard, Browse Jobs, Apply Modal, 4-step Timeline, & Profile
    ├── recruiter.js        # HR Dashboard, Post Job (Paragraph JD -> AI Preview -> Publish), Applicants, & Review
    ├── admin.js            # Admin Dashboard split panel, 8 deep-dive tabs, live terminal replay, Evaluation, & Policy
    └── app.js              # State manager, role switcher, route router, and toast notifications
```

---

## 🚀 How to Run

### Option 1: Run via Built-in Python Server (Recommended)
From the project root:
```bash
python ui/server.py
```
Or specify a custom port:
```bash
python ui/server.py 8080
```
Then open your browser at:
```
http://127.0.0.1:8000/
```

### Option 2: Open Directly in Any Browser
Double-click `ui/index.html` or open it with your favorite browser:
```
file:///c:/Users/VALMIK AWARE/OneDrive/Desktop/Placement/hyt-ats/ui/index.html
```

---

## 🎯 Supported Workflows & Roles

### 1. Public Landing Page & Auth Flow (Screenshot 1)
- **Hero & Value Proposition**: High-contrast typography, deterministic AI badge, and hero CTA buttons.
- **Stats Counter**: 10K+ Active Jobs, 5K+ Companies, 100K+ Candidates, 95% Match rate.
- **About HuntYourTribe**: Candidate, Recruiter, and Fairer Future feature cards + Mission card.
- **How It Works**: Interactive 4-step visual workflows for both Candidates and Recruiters.
- **Explore Opportunities**: Public job search bar with real-time filters (Location, Job Type, Experience).
- **Role Selection**: Direct entry as **Candidate**, **Recruiter**, or **Admin**.
- **Login Flow**: Role switcher pill toggle, pre-filled demo accounts, password toggle, and social OAuth options.

### 2. Recruiter / HR Dashboard (Screenshot 2)
- **Hiring Overview**: 5 KPI tiles (Open Jobs: 8, Total Applicants: 342, Shortlisted: 56, Human Review: 112, Rejected: 174).
- **Application Trends**: Interactive daily volume bar chart + real-time activity log.
- **Post a Job Workflow**:
  1. *Job Details*: Paste paragraph job description.
  2. *AI Extraction Preview*: View extracted Must-Have tags, Nice-to-Have tags, and Structured Summary.
  3. *Publish*: Adds job to active catalog immediately.
- **Manage Jobs**: Filter postings by *All*, *Open*, or *Closed*.
- **Job Applicants**: Filter by *Shortlisted*, *Human Review*, or *Rejected*. Sort by Fit Score.
- **Candidate Review**:
  - Overview card with Fit Score `42.6/100` and `ESCALATE` condition.
  - Score Breakdown (Gate 6): Technical Skills (55.3), Experience (8.3), Seniority (40.0), Education (100), Location (100).
  - Pipeline Execution (Gates 0-8).
  - Evidence & Gaps tables (Top Matched vs Critical Missing requirements).
  - Record HR Decision (Shortlist, Keep in Human Review, Reject) with audit log updates.

### 3. Candidate Dashboard (Screenshot 3)
- **Candidate Dashboard**: Welcome banner, 4 summary metric tiles (*Applied Jobs*, *Under Review*, *Shortlisted*, *Not Shortlisted*), and Recommended Jobs.
- **Browse Jobs**: Search by title/skill, filter by location/type/experience, view card tags, and pagination.
- **Job Details**: Full description, must-have skills, nice-to-have skills, and company background.
- **Apply for Job Modal**: Uses saved profile resume (`Akshada_Kale_Resume.pdf`, 450 KB) without requiring re-uploading, optional fit note, and single-click submit.
- **My Applications**: Filter tabs (*All*, *Under Review*, *Shortlisted*, *Not Shortlisted*) with real records.
- **Application Details & Live Timeline**:
  - Step 1: *Application Submitted*
  - Step 2: *Resume Screening (AI)*
  - Step 3: *Under Human Review*
  - Step 4: *Final Decision*
  - Real-time status banners with candidate-friendly feedback.
- **Candidate Profile**: Edit name, education, location, GitHub portfolio link, and interactive skills tag editor.

### 4. Admin Dashboard & Dynamic AI Pipeline Analysis (Screenshot 4)
- **Split Panel Interface**:
  - **Left Panel**: Candidate list for selected JD with fit score, decision badges, search, and sorting.
  - **Right Panel**: Deep-dive analysis for the selected candidate with instant dynamic switching!
- **8 Dynamic Report Tabs**:
  1. *Overview*: Status tiles, Gate 0-8 summary, Score Breakdown, Recruiter Assessment, and Evidence tables.
  2. *Pipeline Execution*: Gates 0 through 8 with execution timestamps.
  3. *Resume Analysis*: Privacy-shielded raw extraction text vs structured extraction cache.
  4. *Job Match Analysis*: Gate 5 Domain pre-filter similarity, Jaccard token match, and TF-IDF vectors.
  5. *Evidence & Gaps*: Matched requirements vs critical missing gaps with confidence ratings.
  6. *Integrity & Verification*: Gate 0 prompt injection detection, PII redaction status, and GitHub verification.
  7. *Logs*: Real-time terminal output stream viewer reflecting `python main.py run-candidate`.
  8. *Audit Trail*: Tamper-evident administrative event ledger.
- **System-Wide Pages**:
  - **Evaluation & Fairness**: Real benchmarks from `eval_results.json` (Mean NDCG@5: `0.8209`, Decision Accuracy: `57.5%`, 0 fairness flips / 1,080 permutations, 15/15 adversarial quarantined).
  - **Decision Policy**: Production weights (Tech 40%, Exp 30%, Sen 20%, Edu 5%, Loc 5%) and threshold rules.
  - **Users & Audit Log**: Active accounts and complete audit trails.

---

## ⚡ Role Switching
At any point during usage, use the **Role** pill dropdown in the top navbar to instantly switch between:
- `Candidate (Akshada)`
- `Recruiter (Rohan)`
- `Admin (System)`
