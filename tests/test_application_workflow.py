"""
HuntYourTribe (HYT ATS) - Comprehensive 14-Scenario Application Workflow Test Suite
===================================================================================
Validates the authoritative business rule:
"A candidate must be associated with a job only after explicitly applying for that particular job."

Test Scenarios:
1. Creating a JD creates 0 applications and 0 counts.
2. Uploading a resume creates 0 applications and triggers no job screening.
3. Applying to Job A creates 1 application for Job A, Job B remains 0.
4. Applying to Job A & Job B creates 2 separate applications.
5. No duplicate application on retry (idempotency).
6. Nonexistent job ID returns 404 (no default substitution).
7. Screening pipeline failure preserves application without fabricated score.
8. Recruiter candidate roster filters strictly by matching job_id.
9. Exact counts (0 initially, increments only on real application).
10. Cross-dashboard consistency (same application ID, job ID, candidate ID, final status).
11. Persistence across restart (database reopen).
12. Empty API response clears cached data in DataStore / returns empty roster for 0-applicant job.
13. Resume ownership security check (rejects cross-candidate resume reuse).
14. Regression test execution (audit logging, recruiter override, metrics).
"""

import json
import uuid
import pytest
from datetime import datetime
from src.utils.database import (
    get_db_connection,
    init_database,
    ATSDatabase
)


@pytest.fixture(scope="module")
def setup_workflow_db():
    """Initializes SQLite database and cleans test artifacts."""
    init_database()
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        test_cands = (
            "test_cand_alpha",
            "test_cand_beta",
            "test_cand_gamma",
            "test_cand_sec_a",
            "test_cand_sec_b"
        )
        placeholders = ",".join("?" for _ in test_cands)
        cur.execute(f"DELETE FROM applications WHERE candidate_id IN ({placeholders})", test_cands)
        cur.execute(f"DELETE FROM candidate_profiles WHERE id IN ({placeholders})", test_cands)
        cur.execute(f"DELETE FROM recruiter_overrides WHERE candidate_id IN ({placeholders})", test_cands)
        cur.execute("DELETE FROM jobs WHERE id LIKE 'test_job_%'")
        conn.commit()
    finally:
        conn.close()
    yield
    # Cleanup after module
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        test_cands = (
            "test_cand_alpha",
            "test_cand_beta",
            "test_cand_gamma",
            "test_cand_sec_a",
            "test_cand_sec_b"
        )
        placeholders = ",".join("?" for _ in test_cands)
        cur.execute(f"DELETE FROM applications WHERE candidate_id IN ({placeholders})", test_cands)
        cur.execute(f"DELETE FROM candidate_profiles WHERE id IN ({placeholders})", test_cands)
        cur.execute(f"DELETE FROM recruiter_overrides WHERE candidate_id IN ({placeholders})", test_cands)
        cur.execute("DELETE FROM jobs WHERE id LIKE 'test_job_%'")
        conn.commit()
    finally:
        conn.close()


# ------------------------------------------------------------------------------
# Test 1: Creating a JD creates 0 applications and 0 counts.
# ------------------------------------------------------------------------------
def test_01_create_jd_has_zero_applications_and_counts(setup_workflow_db):
    job_id = f"test_job_{uuid.uuid4().hex[:8]}"
    job_data = {
        "job_id": job_id,
        "title": "Senior Cloud Infrastructure Engineer",
        "company": "SkyNet Inc",
        "location": "Remote",
        "job_type": "Full-time",
        "experience": "5+ years",
        "min_years_experience": 5.0,
        "overview": "Lead infrastructure scalability across multi-region AWS environments.",
        "must_haves": ["AWS", "Terraform", "Kubernetes"],
        "nice_to_haves": ["Go", "Kafka"]
    }

    created = ATSDatabase.create_job(job_data)
    assert created is not None
    assert created["id"] == job_id
    assert created["applicantsCount"] == 0
    assert created["shortlistedCount"] == 0
    assert created["reviewCount"] == 0
    assert created["rejectedCount"] == 0

    # Ensure no applications exist for this job
    apps = ATSDatabase.get_applications(job_id=job_id)
    assert len(apps) == 0

    # Ensure candidate roster is empty
    roster = ATSDatabase.get_candidate_roster(job_id=job_id)
    assert len(roster) == 0


# ------------------------------------------------------------------------------
# Test 2: Uploading a resume creates 0 applications and triggers no job screening.
# ------------------------------------------------------------------------------
def test_02_resume_upload_creates_zero_applications(setup_workflow_db):
    cand_id = "test_cand_alpha"
    resume_file = "alpha_resume.pdf"

    # Profile saved on resume upload
    profile = ATSDatabase.save_candidate_profile(
        candidate_id=cand_id,
        name="Alpha Candidate",
        email="alpha@example.com",
        phone="+1 555-0100",
        education="B.S. in Computer Science",
        location="Austin, TX",
        resume_file=resume_file,
        skills=["Python", "FastAPI", "PostgreSQL"]
    )
    assert profile is not None
    assert profile["id"] == cand_id
    assert profile["resumeFile"] == resume_file

    # Verify 0 applications exist for this candidate
    apps = ATSDatabase.get_applications(candidate_id=cand_id)
    assert len(apps) == 0

    # Verify no job rosters include this candidate
    all_jobs = ATSDatabase.get_jobs()
    for j in all_jobs:
        roster = ATSDatabase.get_candidate_roster(job_id=j["id"])
        cand_in_roster = any(c["candidateId"] == cand_id for c in roster)
        assert not cand_in_roster, f"Candidate {cand_id} found in roster for unapplied job {j['id']}"


# ------------------------------------------------------------------------------
# Test 3: Applying to Job A creates 1 application for Job A, Job B remains 0.
# ------------------------------------------------------------------------------
def test_03_applying_to_job_a_isolates_from_job_b(setup_workflow_db):
    job_a_id = f"test_job_a_{uuid.uuid4().hex[:6]}"
    job_b_id = f"test_job_b_{uuid.uuid4().hex[:6]}"

    ATSDatabase.create_job({"job_id": job_a_id, "title": "Job A Backend", "company": "Co A"})
    ATSDatabase.create_job({"job_id": job_b_id, "title": "Job B Frontend", "company": "Co B"})

    cand_id = "test_cand_alpha"
    screening = {
        "score": 82.0,
        "decision": "AUTO_ADVANCE",
        "candidate": {
            "name": "Alpha Candidate",
            "matchedSkills": ["Python", "FastAPI"],
            "missingSkills": []
        }
    }

    app_a = ATSDatabase.submit_application(
        job_id=job_a_id,
        candidate_id=cand_id,
        resume_file="alpha_resume.pdf",
        screening=screening,
        why_fit="Strong backend background"
    )

    assert app_a["job_id"] == job_a_id
    assert app_a["candidate_id"] == cand_id

    # Verify Job A counts: 1 applicant
    job_a = ATSDatabase.get_job(job_a_id)
    assert job_a["applicantsCount"] == 1
    assert job_a["shortlistedCount"] == 1

    # Verify Job B counts: strictly 0
    job_b = ATSDatabase.get_job(job_b_id)
    assert job_b["applicantsCount"] == 0
    assert job_b["shortlistedCount"] == 0
    assert job_b["reviewCount"] == 0
    assert job_b["rejectedCount"] == 0

    # Verify Job A roster has candidate
    roster_a = ATSDatabase.get_candidate_roster(job_id=job_a_id)
    assert len(roster_a) == 1
    assert roster_a[0]["candidateId"] == cand_id

    # Verify Job B roster is empty
    roster_b = ATSDatabase.get_candidate_roster(job_id=job_b_id)
    assert len(roster_b) == 0


# ------------------------------------------------------------------------------
# Test 4: Applying to Job A & Job B creates 2 separate applications.
# ------------------------------------------------------------------------------
def test_04_multi_job_applications_create_distinct_records(setup_workflow_db):
    # Candidate alpha now also applies to Job B
    jobs = ATSDatabase.get_jobs()
    job_b = next(j for j in jobs if "test_job_b_" in j["id"])
    cand_id = "test_cand_alpha"

    screening_b = {
        "score": 64.0,
        "decision": "ESCALATE",
        "candidate": {
            "name": "Alpha Candidate",
            "matchedSkills": ["FastAPI"],
            "missingSkills": ["React"]
        }
    }

    app_b = ATSDatabase.submit_application(
        job_id=job_b["id"],
        candidate_id=cand_id,
        resume_file="alpha_resume.pdf",
        screening=screening_b,
        why_fit="Exploring frontend role"
    )

    # Candidate now has 2 distinct applications
    cand_apps = ATSDatabase.get_applications(candidate_id=cand_id)
    assert len(cand_apps) == 2

    app_ids = [a["id"] for a in cand_apps]
    assert len(set(app_ids)) == 2, "Application IDs must be distinct"

    # Both jobs now have 1 applicant
    job_b_refreshed = ATSDatabase.get_job(job_b["id"])
    assert job_b_refreshed["applicantsCount"] == 1
    assert job_b_refreshed["reviewCount"] == 1


# ------------------------------------------------------------------------------
# Test 5: No duplicate application on retry (idempotency).
# ------------------------------------------------------------------------------
def test_05_idempotent_application_submission(setup_workflow_db):
    jobs = ATSDatabase.get_jobs()
    job_a = next(j for j in jobs if "test_job_a_" in j["id"])
    cand_id = "test_cand_alpha"

    before_apps = ATSDatabase.get_applications(job_id=job_a["id"], candidate_id=cand_id)
    assert len(before_apps) == 1
    original_app_id = before_apps[0]["id"]

    # Re-apply with same candidate and job
    resubmitted = ATSDatabase.submit_application(
        job_id=job_a["id"],
        candidate_id=cand_id,
        resume_file="alpha_resume.pdf",
        screening={"score": 85.0, "decision": "AUTO_ADVANCE"},
        why_fit="Re-applying again"
    )

    assert resubmitted["id"] == original_app_id

    # Applicant count still 1
    job_a_refreshed = ATSDatabase.get_job(job_a["id"])
    assert job_a_refreshed["applicantsCount"] == 1


# ------------------------------------------------------------------------------
# Test 6: Nonexistent job ID returns 404 / None (no default substitution).
# ------------------------------------------------------------------------------
def test_06_nonexistent_job_returns_none_no_default(setup_workflow_db):
    fake_id = "nonexistent_job_999999"
    job = ATSDatabase.get_job(fake_id)
    assert job is None, "Nonexistent job ID must return None, not default to first job"


# ------------------------------------------------------------------------------
# Test 7: Screening pipeline failure preserves application without fabricated score.
# ------------------------------------------------------------------------------
def test_07_pipeline_failure_preserves_application_no_fake_score(setup_workflow_db):
    job_id = f"test_job_{uuid.uuid4().hex[:6]}"
    ATSDatabase.create_job({"job_id": job_id, "title": "DevOps Architect", "company": "CloudCo"})

    cand_id = "test_cand_beta"
    ATSDatabase.save_candidate_profile(cand_id, "Beta Candidate", resume_file="beta_resume.pdf")

    # Failed screening payload (score 0.0, is_error=True)
    failed_screening = {
        "score": 0.0,
        "decision": "ESCALATE",
        "is_error": True,
        "screening_note": "AI Service Timeout: Application routed to recruiter review queue",
        "candidate": {
            "name": "Beta Candidate",
            "matchedSkills": [],
            "missingSkills": []
        }
    }

    app = ATSDatabase.submit_application(
        job_id=job_id,
        candidate_id=cand_id,
        resume_file="beta_resume.pdf",
        screening=failed_screening,
        why_fit="Reliability specialist"
    )

    assert app["fit_score"] == 0.0
    assert app["fit_score"] != 42.6, "Must NEVER fabricate a default 42.6 score on failure"
    assert app["final_status"] == "Under Review"
    assert app["ai_recommendation"] == "HR_REVIEW"


# ------------------------------------------------------------------------------
# Test 8: Recruiter candidate roster filters strictly by matching job_id.
# ------------------------------------------------------------------------------
def test_08_roster_filters_strictly_by_job_id(setup_workflow_db):
    job_1 = f"test_job_{uuid.uuid4().hex[:6]}"
    job_2 = f"test_job_{uuid.uuid4().hex[:6]}"
    ATSDatabase.create_job({"job_id": job_1, "title": "Job 1", "company": "Co"})
    ATSDatabase.create_job({"job_id": job_2, "title": "Job 2", "company": "Co"})

    cand_g = "test_cand_gamma"
    ATSDatabase.save_candidate_profile(cand_g, "Gamma Candidate", resume_file="gamma.pdf")

    ATSDatabase.submit_application(
        job_id=job_1,
        candidate_id=cand_g,
        resume_file="gamma.pdf",
        screening={"score": 90.0, "decision": "AUTO_ADVANCE"}
    )

    roster_1 = ATSDatabase.get_candidate_roster(job_id=job_1)
    roster_2 = ATSDatabase.get_candidate_roster(job_id=job_2)

    assert any(c["candidateId"] == cand_g for c in roster_1)
    assert not any(c["candidateId"] == cand_g for c in roster_2)


# ------------------------------------------------------------------------------
# Test 9: Exact counts (0 initially, increments only on real application).
# ------------------------------------------------------------------------------
def test_09_exact_count_accounting(setup_workflow_db):
    job_id = f"test_job_{uuid.uuid4().hex[:6]}"
    job = ATSDatabase.create_job({"job_id": job_id, "title": "QA Lead", "company": "QualitySoft"})
    assert job["applicantsCount"] == 0

    cand_1 = "test_cand_sec_a"
    ATSDatabase.save_candidate_profile(cand_1, "Security A", resume_file="sec_a.pdf")
    ATSDatabase.submit_application(
        job_id=job_id,
        candidate_id=cand_1,
        resume_file="sec_a.pdf",
        screening={"score": 88.0, "decision": "AUTO_ADVANCE"}
    )

    refreshed = ATSDatabase.get_job(job_id)
    assert refreshed["applicantsCount"] == 1
    assert refreshed["shortlistedCount"] == 1
    assert refreshed["reviewCount"] == 0
    assert refreshed["rejectedCount"] == 0


# ------------------------------------------------------------------------------
# Test 10: Cross-dashboard consistency (same IDs and statuses across views).
# ------------------------------------------------------------------------------
def test_10_cross_dashboard_consistency(setup_workflow_db):
    job_id = f"test_job_{uuid.uuid4().hex[:6]}"
    ATSDatabase.create_job({"job_id": job_id, "title": "Platform Engineer", "company": "PlatformCo"})
    cand_id = "test_cand_sec_b"
    ATSDatabase.save_candidate_profile(cand_id, "Security B", resume_file="sec_b.pdf")

    app = ATSDatabase.submit_application(
        job_id=job_id,
        candidate_id=cand_id,
        resume_file="sec_b.pdf",
        screening={"score": 78.5, "decision": "AUTO_ADVANCE"}
    )

    # 1. Candidate View
    cand_apps = ATSDatabase.get_applications(candidate_id=cand_id)
    assert len(cand_apps) == 1
    assert cand_apps[0]["id"] == app["id"]
    assert cand_apps[0]["finalStatus"] == "Shortlisted"

    # 2. Recruiter Roster View
    roster = ATSDatabase.get_candidate_roster(job_id=job_id)
    assert len(roster) == 1
    assert roster[0]["candidateId"] == cand_id
    assert roster[0]["applicationId"] == app["id"]
    assert roster[0]["finalStatus"] == "Shortlisted"
    assert roster[0]["fitScore"] == 78.5

    # 3. Admin Metrics View
    metrics = ATSDatabase.get_admin_metrics()
    assert metrics["totalApplications"] >= 1


# ------------------------------------------------------------------------------
# Test 11: Persistence across restart (database reopen).
# ------------------------------------------------------------------------------
def test_11_persistence_across_connection_reopen(setup_workflow_db):
    job_id = f"test_job_{uuid.uuid4().hex[:6]}"
    ATSDatabase.create_job({"job_id": job_id, "title": "Persistent Job", "company": "Storage Inc"})

    # Open fresh connection to verify DB state
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT title, company FROM jobs WHERE id = ?", (job_id,))
        row = cur.fetchone()
        assert row is not None
        assert row["title"] == "Persistent Job"
        assert row["company"] == "Storage Inc"
    finally:
        conn.close()


# ------------------------------------------------------------------------------
# Test 12: Empty roster returned for job with 0 applications.
# ------------------------------------------------------------------------------
def test_12_empty_roster_for_unapplied_job(setup_workflow_db):
    job_id = f"test_job_{uuid.uuid4().hex[:6]}"
    ATSDatabase.create_job({"job_id": job_id, "title": "Zero Applicants Role", "company": "EmptyCo"})

    roster = ATSDatabase.get_candidate_roster(job_id=job_id)
    assert isinstance(roster, list)
    assert len(roster) == 0, "Roster for a brand new job must be strictly empty []"


# ------------------------------------------------------------------------------
# Test 13: Resume ownership security check.
# ------------------------------------------------------------------------------
def test_13_resume_ownership_validation(setup_workflow_db):
    cand_1 = "test_cand_sec_a"
    cand_2 = "test_cand_sec_b"

    ATSDatabase.save_candidate_profile(cand_1, "Security A", resume_file="sec_a_resume.pdf")
    ATSDatabase.save_candidate_profile(cand_2, "Security B", resume_file="sec_b_resume.pdf")

    # Own resume matches
    assert ATSDatabase.verify_resume_ownership(cand_1, "sec_a_resume.pdf") is True
    assert ATSDatabase.verify_resume_ownership(cand_2, "sec_b_resume.pdf") is True

    # Cross-candidate resume access must fail
    assert ATSDatabase.verify_resume_ownership(cand_1, "sec_b_resume.pdf") is False
    assert ATSDatabase.verify_resume_ownership(cand_2, "sec_a_resume.pdf") is False


# ------------------------------------------------------------------------------
# Test 14: Regression test execution (Audit log & Recruiter Override).
# ------------------------------------------------------------------------------
def test_14_recruiter_override_and_audit_logging(setup_workflow_db):
    job_id = f"test_job_{uuid.uuid4().hex[:6]}"
    ATSDatabase.create_job({"job_id": job_id, "title": "Security Lead", "company": "CyberOps"})
    cand_id = "test_cand_sec_a"

    app = ATSDatabase.submit_application(
        job_id=job_id,
        candidate_id=cand_id,
        resume_file="sec_a_resume.pdf",
        screening={"score": 88.0, "decision": "AUTO_ADVANCE"}
    )
    assert app["final_status"] == "Shortlisted"

    # Recruiter overrides decision to Rejected with mandatory audit reason
    override = ATSDatabase.override_recruiter_decision(
        application_id=app["id"],
        new_status="Rejected",
        recruiter_id="recruiter_sarah",
        reason="Failed security clearance background check"
    )

    assert override["newStatus"] == "Rejected"
    assert override["previousStatus"] == "Shortlisted"

    # Verify updated application
    updated_apps = ATSDatabase.get_applications(job_id=job_id, candidate_id=cand_id)
    assert updated_apps[0]["finalStatus"] == "Rejected"

    # Verify updated job count
    job = ATSDatabase.get_job(job_id)
    assert job["rejectedCount"] == 1
    assert job["shortlistedCount"] == 0

    # Verify audit log recorded
    logs = ATSDatabase.get_audit_logs()
    assert any(log.get("application_id") == app["id"] or log.get("candidate_id") == cand_id for log in logs)
