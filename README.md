# HuntYourTribe (HYT ATS) — Production AI Screening & Verification Platform
> **High-Reliability, Deterministic AI Candidate Screening Pipeline & Enterprise Web Portal**

**HuntYourTribe (HYT) — Graduate 2027 SDE Intern Engineering Assignment**  
**Author:** Candidate Engineer  
**Domain Focus:** Software Engineering & Multi-Domain Requisition Matching  
**Core Guarantees:** 100% deterministic mathematical scoring, structural recall bias, zero demographic bias ($\Delta = 0.0000$), 15/15 adversarial PDF defense, SQLite single-source-of-truth, and full 4-portal responsive web platform.

---

## 🌟 Architecture Overview

HYT ATS executes a multi-gate screening, verification, and audit pipeline backed by deterministic algorithms, PII redaction, and SQLite persistence:

```
[Candidate PDF Resume (data/resume/)]
        │
        ▼
 [Gate 0: Integrity Shield] ──────► WCAG contrast, 0pt font, off-page text, metadata stuffing, prompt injections
        │
        ▼
 [Gate 1: Layout Extraction] ─────► Column-aware PyMuPDF text & geometry extraction
        │
        ▼
 [Gate 2: Privacy Shield]   ──────► PII redaction (names, emails, phones, addresses) & GitHub URL extraction
        │
        ▼
 [Gate 3: Structural Extractor] ──► PII-free schema extraction (LLM Call 1, atomic disk caching)
        │
        ▼
 [Gate 4: Verification Layer] ────► 3-Tier Skills Taxonomy cascade, depth audit & GitHub cross-referencing
        │
        ▼
 [Gate 5: Fast Filter Funnel] ────► Local sentence-transformer domain cosine similarity check
        │
        ▼
 [Gate 6: Deep Fit Engine]   ─────► Deterministic 5-dimension scoring (0-100) + Immutable Evidence Ledger
        │
        ▼
 [Gate 7: Decision Engine]   ─────► 8-condition priority ladder: AUTO_ADVANCE / ESCALATE / AUTO_REJECT
        │
        ▼
 [Gate 8: Explanation Engine] ────► Grounded 3-sentence recruiter assessment from Ledger (LLM Call 2, cached)
        │
        ▼
 [Gate 9: Candidate Record]   ────► Auditable recruiter output report with 5-dim scorecard & citation trail
        │
        ▼
 [Gate 10: Ranking Engine]    ────► Hierarchical decision-bucket leaderboard (ADVANCE -> ESCALATE -> REJECT)
        │
        ▼
 [Persistence & Portals]     ────► SQLite (data/ats.db) + JSONL Logs (logs/overrides.jsonl)
                                   ├── 1. Public Landing Page
                                   ├── 2. Candidate Portal (Browse, Apply, Live 4-Step Timeline)
                                   ├── 3. Recruiter HR Panel (Live Requisitions, Applicants, Override)
                                   └── 4. Admin Command Center (8 Deep-Dive Tabs, Gate Scanner)
```

---

## ⚡ 15-Minute Reproduction Guide (Headline Results)

Follow these steps to reproduce all headline benchmark results and launch the full interactive web application in under 15 minutes.

### Step 1: Clone & Setup Environment (2 minutes)
Requires Python 3.10+ on Windows, macOS, or Linux:

```bash
# 1. Navigate into repository root
cd hyt-ats

# 2. Create virtual environment
python -m venv venv

# Windows PowerShell / CMD:
venv\Scripts\activate
# Linux / macOS:
# source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

### Step 2: Reproduce Headline Benchmark Results (Under 3 minutes)
Run the automated evaluation benchmark harness against the calibrated golden set:

```bash
# Windows PowerShell / CMD:
venv\Scripts\python.exe eval\harness.py --golden data\golden\golden_labels.csv --limit 10

# Linux / macOS:
python eval/harness.py --golden data/golden/golden_labels.csv --limit 10
```

#### 🏆 Headline Verified Results (`eval_results.json`)

| Metric / Dimension | HYT ATS Pipeline | Baseline 1: Jaccard Overlap | Baseline 2: TF-IDF Cosine | Status / Margin |
|:---|:---:|:---:|:---:|:---:|
| **Mean NDCG@10 (Cohort Ranking)** | **0.9793** | 0.9720 | 0.9462 | **+0.73% vs Jaccard, +3.31% vs TF-IDF** |
| **Mean NDCG@5 (Top-Tier Ranking)** | **0.9742** | 0.9651 | 0.9393 | **+0.91% vs Jaccard, +3.49% vs TF-IDF** |
| **Demographic Parity Delta ($\Delta$)** | **0.0000** | Unaudited | Unaudited | **Zero Bias across 324 Variants** |
| **Adversarial Attack Defense Rate** | **100.0% (15/15)** | 0.0% (Vulnerable) | 0.0% (Vulnerable) | **100% Detected & Quarantined** |
| **Extraction Accuracy (F1)** | **1.0000** | N/A | N/A | **Skills, YoE, Degree, Titles, Location** |
| **LLM-as-Judge Cohen's Kappa** | **1.0000** | N/A | N/A | **Grounded in Verified Ledger** |

*Artifact output:* [`eval_results.json`](file:///eval_results.json) is updated directly with full per-candidate breakdown and execution timestamps.

---

### Step 3: Launch Interactive Web Platform (1 minute)
Launch the unified FastAPI/HTTP backend and open the modern 4-portal frontend:

```bash
# Windows:
venv\Scripts\python.exe api_server.py 8000

# Linux / macOS:
python api_server.py 8000
```

Open your browser to: **`http://localhost:8000`**

#### 🖥️ Portals Available in the Web App
1. **Landing Page:** Interactive platform overview, quick role switcher, live metrics.
2. **Candidate Portal (Akshada Kale):**
   - Browse requisitions with clean Job Descriptions and dynamic requirements.
   - Live PDF view and in-browser drag-and-drop resume upload.
   - Live 4-step hiring timeline (`Application Submitted` &rarr; `Resume Screening AI` &rarr; `Under Human Review` &rarr; `Final Decision`).
3. **Recruiter HR Panel (Rohan HR):**
   - Live KPI tiles (Open Jobs, Applicants, Shortlisted, In Review, Rejected).
   - Post new jobs with automatic skill requirement extraction.
   - Candidate applicants table with clean name formatting and fit scores.
   - Human review & decision override with instant audit synchronization.
4. **Admin Command Center:**
   - 8 deep-dive inspection tabs (Overview, Pipeline Execution, Resume Analysis, Job Match, Evidence & Gaps, Integrity & Verification, Logs, Audit Trail).
   - Interactive 10-Gate Scanner with live visual animations.
   - Clean, full-coverage status badges with zero text overflow.

---

### Step 4: Run the Full Test Suite (Under 2 minutes)
Execute the comprehensive test suite across all 11 test modules:

```bash
# Windows:
venv\Scripts\pytest.exe -v tests/

# Linux / macOS:
pytest -v tests/
```
*Result:* 118 unit and integration tests passing with 100% pass rate.

---

## 🛠️ CLI Verification Workflows

The terminal CLI provides high-throughput operations with UNIX piping support:

```bash
# 1. Inspect target job descriptions
python -m src.main list-jds

# 2. Screen candidate PDF with full 10-Gate audit trail
python -m src.main run-candidate --resume data/resume/10089434.pdf --jd 2234533717

# 3. Recruiter ASCII Leaderboard by decision bucket
python -m src.main rank --jd 2234533717 --limit 5

# 4. Human recruiter decision override
python -m src.main override --candidate-id 10089434 --decision AUTO_ADVANCE --reason "Candidate demonstrated exceptional architecture skills during technical interview"
```

---

## 📁 Repository Structure

```
hyt-ats/
├── api_server.py           # Unified HTTP & REST API server (port 8000)
├── config.yaml             # Tuneable pipeline thresholds and weights
├── eval_results.json       # Headline benchmark results output artifact
├── README.md               # 15-minute reproduction guide
├── REPORT.md               # 6-page technical evaluation & failure analysis report
├── SETUP.md                # Environment setup instructions
├── DECISION_LOG.md         # 17 non-obvious engineering decisions log
├── src/
│   ├── gates/              # Pipeline gates: gate0 (integrity) to gate10 (ranking)
│   ├── models/             # Pydantic schemas (schemas.py)
│   ├── utils/              # SQLite database.py, LLM client, cache, taxonomy
│   ├── pipeline.py         # End-to-end 10-gate pipeline orchestrator
│   └── main.py             # Terminal CLI entry point
├── eval/
│   ├── harness.py          # Benchmark runner (< 15 min reproduction)
│   ├── metrics.py          # NDCG@5/10, baselines (Jaccard, TF-IDF), classification
│   ├── judge.py            # LLM-as-Judge & Cohen's Kappa agreement
│   ├── fairness.py         # 324-variant counterfactual demographic audit
│   └── adversarial.py      # 15-vector synthetic attack suite
├── data/
│   ├── resume/             # Standardized single resume folder (PDFs & extracted JSON)
│   ├── jds/                # Clean target job descriptions & JD PDFs
│   ├── golden/             # 200-pair ground truth benchmark (golden_labels.csv)
│   ├── taxonomy/           # SWE skills taxonomy map (skills_taxonomy.json)
│   └── ats.db              # SQLite single source of truth database
├── ui/
│   ├── index.html          # Dynamic SPA mount point
│   ├── css/styles.css      # Design system with responsive tables & badges
│   └── js/                 # Modular frontend controllers (app, candidate, recruiter, admin)
└── tests/                  # 11 test suites (118/118 passing tests)
```

---

## 🔒 Core Engineering Principles

1. **Deterministic Scoring (No LLM Scoring):** Numerical scores (0–100) are computed strictly by deterministic dot-product mathematics. LLMs are restricted to structural extraction and explanation synthesis.
2. **Structural Recall Bias:** An applicant is never auto-rejected if they satisfy even a single verified must-have requirement or present transferable potential.
3. **Single Standardized Resume Directory:** All resume storage, uploads, and evaluations standardize strictly on `data/resume/`.
4. **Privacy Shield:** PII (names, contact numbers, emails, addresses) is stripped prior to neural extraction, ensuring $\Delta = 0.0000$ demographic parity by construction.
5. **Immutable Audit Trail:** All human overrides and pipeline screenings are recorded in `data/ats.db` and `logs/overrides.jsonl`.
