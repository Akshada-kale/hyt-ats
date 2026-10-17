# HYT ATS - Multi-Domain Golden Dataset Recruiter Metric & Scoring Specification

**Specification Version:** 2.0.0 (Multi-Domain Cross-Industry Benchmark)  
**Domains Covered:** Accounting, Culinary Arts, Legal Practice, Healthcare, Human Resources, Commercial Sales, Mechanical Engineering, Software Engineering, Avionics/Aerospace, Motion Design.  
**Benchmark Target:** `data/golden/golden_labels.csv` (200 Calibrated Pairs, 10 JDs)  

---

## 1. Multi-Domain Recruitment Architecture & Philosophy
Automated screening across enterprise recruitment requires domain-adaptive evaluation. A rigid single-discipline keyword filter creates unacceptable false negatives for non-traditional candidates and transferable talent.

As codified in HYT ATS Core Architecture:
1. **Recall Bias is Structural:** Ambiguous or adjacent talent is steered toward `escalate` rather than mechanical rejection.
2. **Multi-Domain Calibration:** Skill taxonomies and seniority expectations dynamically adjust to the role domain (e.g., ServSafe/HACCP for culinary, GAAP for accounting, SolidWorks/FEA for mechanical engineering, Bar admission for legal).
3. **Four-Pillar Recruiter Rubric:**
   - **P1: Domain & Core Skill Alignment (0 - 40 pts):** Direct evidence of essential domain competencies.
   - **P2: Seniority & YoE Calibration (0 - 25 pts):** Match between demonstrated experience and JD seniority requirements.
   - **P3: System Complexity & Functional Scope (0 - 25 pts):** Project scale, client/patient/code base complexity.
   - **P4: Verifiable Artifacts & Evidence Depth (0 - 10 pts):** Portfolios, certifications, licensing, degrees, repositories.

---

## 2. Evaluation Metrics & Benchmarks
The Golden Dataset serves as ground truth for:
- **Ranking Quality:** NDCG@5 and NDCG@10 computed per Job Description against human relevance scores.
- **Classification Performance:** Precision, Recall, Macro-F1, and Weighted-F1 across `advance`, `escalate`, and `reject`.
- **Inter-Annotator Agreement:** Cohen's Kappa between automated LLM-as-Judge explanations and calibrated human recruiter ratings across Citation Quality, Gap Specificity, and Actionability.
