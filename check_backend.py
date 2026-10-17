import urllib.request
import json
import time

tests = [
    ('Health Check', 'http://127.0.0.1:8000/api/health', 'GET', None),
    ('System Status', 'http://127.0.0.1:8000/api/status', 'GET', None),
    ('API Docs', 'http://127.0.0.1:8000/api/docs', 'GET', None),
    ('Jobs Catalog', 'http://127.0.0.1:8000/api/jobs', 'GET', None),
    ('PA to Director JD', 'http://127.0.0.1:8000/api/jobs/pa_director', 'GET', None),
    ('Candidates Roster', 'http://127.0.0.1:8000/api/candidates', 'GET', None),
    ('Applications List', 'http://127.0.0.1:8000/api/applications', 'GET', None),
    ('Evaluation Metrics', 'http://127.0.0.1:8000/api/evaluation', 'GET', None),
    ('Audit Logs', 'http://127.0.0.1:8000/api/logs', 'GET', None),
    ('Pipeline Config', 'http://127.0.0.1:8000/api/config', 'GET', None),
]

print("=" * 70)
print("       BACKEND COMPREHENSIVE DIAGNOSTIC TEST RUNNER")
print("=" * 70)

all_passed = True
for name, url, method, data in tests:
    t0 = time.time()
    try:
        req = urllib.request.Request(url, method=method)
        with urllib.request.urlopen(req, timeout=5) as res:
            elapsed_ms = (time.time() - t0) * 1000
            status_code = res.status
            content = res.read().decode('utf-8', errors='ignore')
            
            extra_info = ""
            if "json" in res.headers.get("Content-Type", ""):
                jd = json.loads(content)
                if "total" in jd:
                    extra_info = f"[Total items: {jd['total']}]"
                elif "status" in jd:
                    extra_info = f"[Status: {jd['status']}]"
                elif "job" in jd:
                    extra_info = f"[{jd['job'].get('title', '')[:30]}]"

            print(f" [PASS] {name:<22} -> HTTP {status_code} ({elapsed_ms:5.1f}ms) {extra_info}")
    except Exception as e:
        all_passed = False
        print(f" [FAIL] {name:<22} -> ERROR: {e}")

# Now test live ATS screening execution endpoint
print("-" * 70)
print(" Testing Real-Time 10-Gate ATS Pipeline Execution via POST API...")
t0 = time.time()
try:
    post_data = json.dumps({"resume": "riya_sharma.pdf", "jd": "pa_director"}).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/api/pipeline/run", data=post_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as res:
        elapsed_ms = (time.time() - t0) * 1000
        res_json = json.loads(res.read().decode("utf-8"))
        print(f" [PASS] 10-Gate Pipeline Run   -> HTTP {res.status} ({elapsed_ms:5.1f}ms)")
        print(f"        Candidate Score:       {res_json.get('final_score')}/100")
        print(f"        Decision:              {res_json.get('decision')}")
        print(f"        Decision Reason:       {res_json.get('decision_reason')[:70]}...")
except Exception as e:
    all_passed = False
    print(f" [FAIL] 10-Gate Pipeline Run   -> ERROR: {e}")

print("=" * 70)
if all_passed:
    print(" RESULT: ALL BACKEND SERVICES AND 10-GATE ATS ARE 100% OPERATIONAL!")
else:
    print(" RESULT: SOME BACKEND SERVICES ENCOUNTERED ISSUES.")
print("=" * 70)
