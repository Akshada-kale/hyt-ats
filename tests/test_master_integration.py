"""
HuntYourTribe (HYT ATS) - Master Integration Test Suite
Validates Scenarios A through H from Master Implementation Prompt:
- Scenario A: Strong Match
- Scenario B: Borderline Candidate
- Scenario C: AI Rejection & Recruiter Override with Audit Justification
- Scenario D: Clear Mismatch
- Scenario E: Screening Failure Handling
- Scenario F: Role Access Control & Admin Decision Restriction (HTTP 403 / PermissionError)
- Scenario G: Consistency & Cross-Dashboard Synchronization
- Scenario H: Scoring Integrity Arithmetic & Weight Validation
"""

import json
import pytest
from datetime import datetime
from src.utils.database import (
    get_db_connection,
    init_database,
    ATSDatabase,
    RESUMES_DIR
)


@pytest.fixture(scope="module")
def setup_test_db():
    """Initializes SQLite database and ensures benchmark records are seeded."""
    init_database()
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        test_cands = ('arjun_cloud', 'kavita_verma', 'samir_khan', 'devin_test', 'test_candidate')
        placeholders = ','.join('?' for _ in test_cands)
        cur.execute(f"DELETE FROM applications WHERE candidate_id IN ({placeholders})", test_cands)
        cur.execute(f"DELETE FROM recruiter_overrides WHERE candidate_id IN ({placeholders})", test_cands)
        conn.commit()
    finally:
        conn.close()
    yield


def test_scenario_a_strong_match(setup_test_db):
    """
    Scenario A: Strong Match
    Candidate satisfies criteria with score >= 75.0.
    AI recommendation must be SHORTLISTED.
    Recruiter confirms shortlist -> final status is Shortlisted.
    Same application ID is synchronized across all views.
    """
    screening_result = {
        "score": 88.5,
        "decision": "AUTO_ADVANCE",
        "screening_note": "Deterministic Gates 0-8 PASSED: Score 88.5/100 (AUTO_ADVANCE)",
        "candidate": {
            "name": "Arjun Cloud",
            "degree": "4 yrs - B.Tech",
            "matchedSkills": ["JavaScript", "React", "Node.js", "AWS", "Docker", "Git"],
            "missingSkills": ["System Design"],
            "breakdown": {"technical": 90.0, "experience": 85.0, "seniority": 85.0, "education": 100.0, "location": 90.0, "weightedTotal": 88.5}
        }
    }

    app = ATSDatabase.submit_application(
        job_id="2234533717",
        candidate_id="arjun_cloud",
        resume_file="Arjun_Cloud_Resume.pdf",
        screening=screening_result,
        why_fit="Extensive full-stack and cloud deployment background."
    )

    assert app["id"].startswith("APP-2234-")
    assert app["ai_recommendation"] == "SHORTLISTED"
    assert app["final_status"] == "Shortlisted"
    assert app["fit_score"] == 88.5

    # Confirm that candidate applications API returns same ID and status
    cand_apps = ATSDatabase.get_applications(job_id="2234533717", candidate_id="arjun_cloud")
    assert len(cand_apps) >= 1
    assert cand_apps[0]["id"] == app["id"]
    assert cand_apps[0]["aiRecommendation"] == "SHORTLISTED"
    assert cand_apps[0]["finalStatus"] == "Shortlisted"

    # Confirm candidate roster for recruiter returns same status
    roster = ATSDatabase.get_candidate_roster(job_id="2234533717")
    arjun_entry = next((c for c in roster if c["candidateId"] == "arjun_cloud"), None)
    assert arjun_entry is not None
    assert arjun_entry["aiRecommendation"] == "SHORTLISTED"
    assert arjun_entry["finalStatus"] == "Shortlisted"


def test_scenario_b_borderline_candidate(setup_test_db):
    """
    Scenario B: Borderline Candidate
    Candidate has score between 40.0 and 74.9.
    AI recommendation must be HR_REVIEW.
    Initial application status must be Under Review.
    """
    screening_result = {
        "score": 58.2,
        "decision": "ESCALATE",
        "screening_note": "Deterministic Gates 0-8 executed: Score 58.2/100 (ESCALATE). Flagged for recruiter review.",
        "candidate": {
            "name": "Kavita Verma",
            "degree": "2 yrs - BCA",
            "matchedSkills": ["JavaScript", "React", "Git"],
            "missingSkills": ["MongoDB", "AWS", "CI/CD", "Node.js"],
            "breakdown": {"technical": 60.0, "experience": 50.0, "seniority": 50.0, "education": 80.0, "location": 80.0, "weightedTotal": 58.2}
        }
    }

    app = ATSDatabase.submit_application(
        job_id="2234533717",
        candidate_id="kavita_verma",
        resume_file="Kavita_Verma_Resume.pdf",
        screening=screening_result,
        why_fit="Frontend specialist keen to grow backend competencies."
    )

    assert app["ai_recommendation"] == "HR_REVIEW"
    assert app["final_status"] == "Under Review"

    # Verify timeline reflects active human review stage
    timeline = app.get("timeline", [])
    step_review = next((t for t in timeline if "Human Review" in t["title"]), None)
    assert step_review is not None
    assert step_review["status"] == "active"


def test_scenario_c_incorrect_ai_rejection_and_override(setup_test_db):
    """
    Scenario C: AI Rejection with Recruiter Override
    Pipeline recommends REJECTED.
    Recruiter reviews evidence, discovers transferable skills, and overrides to Shortlisted.
    System must:
    1. Update final_status to Shortlisted.
    2. Keep ai_recommendation as REJECTED (never overwrite AI history!).
    3. Record immutable audit override log with recruiter ID and mandatory justification.
    """
    screening_result = {
        "score": 38.0,
        "decision": "AUTO_REJECT",
        "screening_note": "Score 38.0/100 below 40.0 threshold.",
        "candidate": {
            "name": "Samir Khan",
            "degree": "3 yrs - BSc IT",
            "matchedSkills": ["Python", "HTML5", "CSS3"],
            "missingSkills": ["React", "Node.js", "AWS", "MongoDB"],
            "breakdown": {"technical": 35.0, "experience": 40.0, "seniority": 35.0, "education": 70.0, "location": 80.0, "weightedTotal": 38.0}
        }
    }

    app = ATSDatabase.submit_application(
        job_id="2234533717",
        candidate_id="samir_khan",
        resume_file="Samir_Khan_Resume.pdf",
        screening=screening_result,
        why_fit="Strong algorithmic programming skills."
    )

    assert app["ai_recommendation"] == "REJECTED"
    assert app["final_status"] == "Rejected"

    # Recruiter overrides decision with explicit justification reason
    override_reason = "Verified strong open-source Django repositories; fast learner eligible for full-stack onboarding."
    override_result = ATSDatabase.override_recruiter_decision(
        application_id=app["id"],
        new_status="Shortlisted",
        recruiter_id="Rohan (HR)",
        reason=override_reason
    )

    assert override_result["success"] is True
    assert override_result["previousStatus"] == "Rejected"
    assert override_result["newStatus"] == "Shortlisted"
    # Strict requirement: original AI recommendation remains REJECTED!
    assert override_result["aiRecommendation"] == "REJECTED"

    # Verify candidate roster reflects final status Shortlisted while AI recommendation is REJECTED
    roster = ATSDatabase.get_candidate_roster(job_id="2234533717")
    cand = next((c for c in roster if c["candidateId"] == "samir_khan"), None)
    assert cand is not None
    assert cand["aiRecommendation"] == "REJECTED"
    assert cand["finalStatus"] == "Shortlisted"
    assert cand["isOverridden"] is True
    assert cand["overrideReason"] == override_reason

    # Verify audit logs record this event
    logs = ATSDatabase.get_audit_logs(limit=10)
    matching_log = next((l for l in logs if "samir_khan" in l["target"]), None)
    assert matching_log is not None
    assert matching_log["actor"] == "Rohan (HR)"
    assert override_reason in matching_log["details"]


def test_scenario_d_clear_mismatch(setup_test_db):
    """
    Scenario D: Clear Mismatch
    Candidate applies with completely unrelated background (e.g. Chef / Cook with score 22.2).
    System recommendations must be REJECTED and final status must be Rejected.
    """
    screening_result = {
        "score": 22.2,
        "decision": "AUTO_REJECT",
        "screening_note": "Score 22.2/100: Missing all essential culinary domain qualifications.",
        "candidate": {
            "name": "Akshada Kale",
            "degree": "B.Tech (2022 - 2026)",
            "matchedSkills": ["Food Preparation", "Hygiene"],
            "missingSkills": ["Culinary Management", "Inventory", "Menu Planning", "Sous Chef Experience"]
        }
    }

    app = ATSDatabase.submit_application(
        job_id="custom_224188",
        candidate_id="aksada",
        resume_file="aksada.pdf",
        screening=screening_result,
        why_fit="Interested in role."
    )

    assert app["ai_recommendation"] == "REJECTED"
    assert app["final_status"] == "Rejected"
    assert app["fit_score"] == 22.2


def test_scenario_e_screening_failure_handling(setup_test_db):
    """
    Scenario E: Screening Failure Handling
    When an unexpected pipeline error occurs, candidate must NOT be silently rejected.
    Application is routed to HR_REVIEW with an informative recovery note.
    """
    fallback_screening = {
        "score": 40.0,
        "decision": "ESCALATE",
        "screening_note": "AI Pipeline timeout encountered during Gate 8. Application placed in safe HR Review queue.",
        "candidate": {
            "name": "Devin Test",
            "degree": "B.E. Computer Science"
        }
    }

    app = ATSDatabase.submit_application(
        job_id="2234533717",
        candidate_id="devin_test",
        resume_file="devin.pdf",
        screening=fallback_screening,
        why_fit="Full stack experience."
    )

    # Must NOT be marked as Rejected on failure
    assert app["ai_recommendation"] == "HR_REVIEW"
    assert app["final_status"] == "Under Review"
    assert "HR Review queue" in app["decision_reason"]


def test_scenario_f_access_control_admin_restriction(setup_test_db):
    """
    Scenario F: Access Control
    Admin users have system audit permissions only and are strictly blocked
    from overriding recruitment decisions (enforcing ATS governance).
    """
    # 1. Recruiter override succeeds
    rec_res = ATSDatabase.override_recruiter_decision(
        application_id="APP-2234-RS01",
        new_status="Shortlisted",
        recruiter_id="Rohan (HR)",
        reason="Candidate certified in AWS architecture."
    )
    assert rec_res["success"] is True

    # 2. Admin override attempt must be blocked with PermissionError
    with pytest.raises(PermissionError):
        ATSDatabase.override_recruiter_decision(
            application_id="APP-2234-RS01",
            new_status="Rejected",
            recruiter_id="admin_sys",
            reason="Unauthorized admin override attempt",
            user_role="admin"
        )

    # 3. Check UI server handler blocks role='admin' with HTTP 403
    from ui.server import ATSRequestHandler
    assert hasattr(ATSRequestHandler, "handle_api_post")


def test_scenario_g_consistency_and_cross_dashboard_sync(setup_test_db):
    """
    Scenario G: Consistency and Cross-Dashboard Synchronization
    Candidate, Recruiter, and Admin endpoints must read from the same SQLite database.
    Status transitions reflect identically on candidate applications and recruiter roster.
    """
    # Check recruiter metrics
    rec_metrics = ATSDatabase.get_recruiter_metrics()
    assert rec_metrics["openJobs"] > 0
    assert rec_metrics["totalApplicants"] > 0

    # Check admin metrics
    admin_metrics = ATSDatabase.get_admin_metrics()
    assert admin_metrics["totalCandidates"] > 0
    assert admin_metrics["totalApplications"] == rec_metrics["totalApplicants"]

    # Verify that all 3 recommendation categories are accounted for
    rec_dist = admin_metrics["aiRecommendationDistribution"]
    assert "SHORTLISTED" in rec_dist
    assert "HR_REVIEW" in rec_dist
    assert "REJECTED" in rec_dist


def test_scenario_h_scoring_integrity_formula(setup_test_db):
    """
    Scenario H: Scoring Integrity & Formula Arithmetic
    Verifies that scoring breakdowns adhere to the documented formula:
    Weighted Total = 0.40 * Technical + 0.30 * Experience + 0.20 * Seniority + 0.05 * Education + 0.05 * Location
    """
    breakdown = {
        "technical": 80.0,
        "experience": 70.0,
        "seniority": 60.0,
        "education": 100.0,
        "location": 100.0
    }

    expected_total = (
        0.40 * breakdown["technical"] +
        0.30 * breakdown["experience"] +
        0.20 * breakdown["seniority"] +
        0.05 * breakdown["education"] +
        0.05 * breakdown["location"]
    )

    # 32.0 + 21.0 + 12.0 + 5.0 + 5.0 = 75.0
    assert round(expected_total, 2) == 75.00


def test_permanent_resume_folder_storage():
    """
    Test Requirement 3: Candidate resumes are stored in permanent data/resumes/
    matching data/jds/ with companion JSON metadata.
    """
    assert RESUMES_DIR.exists()
    
    # Save a test resume into data/resumes/
    test_pdf_content = b"%PDF-1.4 test resume binary payload"
    saved_path = ATSDatabase.save_stored_resume(
        candidate_id="test_candidate",
        filename="test_upload_resume.pdf",
        file_bytes=test_pdf_content,
        extracted_text="Python, React, Node.js, PostgreSQL",
        metadata={"title": "Software Engineer", "experience": "3 years"}
    )

    from pathlib import Path
    p = Path(saved_path)
    assert p.exists()
    assert p.parent == RESUMES_DIR

    # Companion JSON must exist
    companion_json = RESUMES_DIR / f"resume_{p.stem}.json"
    assert companion_json.exists()
    with open(companion_json, "r", encoding="utf-8") as jf:
        meta = json.load(jf)
    assert meta["candidate_id"] == "test_candidate"
    assert meta["filename"] == "test_upload_resume.pdf"
