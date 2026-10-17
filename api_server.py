"""
HuntYourTribe (HYT ATS) — Production Backend REST API Server
=============================================================
Terminal & Microservice REST API Server for the 10-Gate Deterministic ATS.

Endpoints Overview:
-------------------
  GET  /api/health                System health check & AI provider status
  GET  /api/status                Complete system diagnostics & stats
  GET  /api/docs                  Interactive API Documentation & Explorer
  GET  /api/jobs                  List all available Job Descriptions
  GET  /api/jobs/<job_id>         Get structured requirements for a single JD
  POST /api/jobs/create           Ingest and embed a new JD
  GET  /api/candidates            List candidate roster with scores & decisions
  GET  /api/candidate?id=<id>     Deep-dive candidate scorecard & evidence ledger
  POST /api/pipeline/run          Execute full 10-Gate ATS evaluation
  POST /api/resume/upload         Upload resume PDF & execute Gate 0 Integrity Shield
  POST /api/applications/submit   Submit job application & trigger ATS screening
  GET  /api/applications          List candidate applications & live status
  POST /api/override              Log immutable recruiter decision override
  GET  /api/evaluation            Benchmark metrics (Recall Bias, NDCG@10, etc.)
  GET  /api/logs                  Immutable audit trail
  GET  /api/config                Scoring policy weights & gate thresholds
  GET  /api/models                Available AI models & provider connectivity

Usage:
  python api_server.py
  python api_server.py 8000
  python api_server.py --port 8080 --host 0.0.0.0
"""

import sys
import os
import argparse
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Reuse the robust HTTP handler and runtime state from ui.server
from ui.server import HYTServerHandler, RUNTIME_STATE, PROJECT_ROOT, UI_DIR, run_screening_for_candidate
from http.server import HTTPServer, ThreadingHTTPServer
import urllib.parse
import json

# Extended API Docs Handler
API_DOCS_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HYT ATS — Backend REST API Documentation</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1e293b;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      padding: 32px 24px;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-get { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .badge-post { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); }
    .badge-status { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    h1 { font-size: 28px; font-weight: 700; display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    p.lead { color: var(--text-muted); font-size: 15px; }
    .nav-links { margin-top: 16px; display: flex; gap: 12px; }
    .nav-links a {
      color: #818cf8;
      text-decoration: none;
      font-size: 14px;
      padding: 6px 14px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      transition: all 0.2s;
    }
    .nav-links a:hover { background: #1f2937; color: #fff; border-color: var(--accent); }
    .section-title { font-size: 20px; font-weight: 600; margin: 28px 0 16px; color: #e5e7eb; border-left: 4px solid var(--accent); padding-left: 12px; }
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .endpoint-card:hover { border-color: #374151; }
    .endpoint-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(255, 255, 255, 0.02);
    }
    .endpoint-path { font-family: var(--font-mono); font-weight: 600; font-size: 15px; color: #f9fafb; flex-grow: 1; }
    .endpoint-desc { font-size: 14px; color: var(--text-muted); }
    .endpoint-body { padding: 16px 20px; }
    .code-block {
      background: #0d1117;
      border: 1px solid #21262d;
      border-radius: 6px;
      padding: 12px 16px;
      font-family: var(--font-mono);
      font-size: 13px;
      color: #c9d1d9;
      overflow-x: auto;
      margin-top: 8px;
    }
    .try-btn {
      display: inline-block;
      background: var(--accent);
      color: white;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .try-btn:hover { background: var(--accent-hover); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1>HuntYourTribe (HYT ATS) REST API <span class="badge badge-status">v1.0.0 Online</span></h1>
          <p class="lead">Deterministic 10-Gate AI Screening Pipeline & Talent Orchestrator REST Backend</p>
        </div>
        <div class="nav-links">
          <a href="/" target="_blank">Open Web Dashboard</a>
          <a href="/api/status" target="_blank">JSON Health Check</a>
        </div>
      </div>
    </header>

    <div class="section-title">System & Diagnostics</div>
    
    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/status</span>
        <span class="endpoint-desc">System health, LLM connectivity, loaded jobs & stats</span>
        <a class="try-btn" href="/api/status" target="_blank">Try Live</a>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">Returns multi-provider AI model status, registered candidate count, and pipeline health.</p>
        <div class="code-block">curl -X GET http://127.0.0.1:8000/api/status</div>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/health</span>
        <span class="endpoint-desc">Lightweight microservice liveness probe</span>
        <a class="try-btn" href="/api/health" target="_blank">Try Live</a>
      </div>
    </div>

    <div class="section-title">Job Descriptions (JDs)</div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/jobs</span>
        <span class="endpoint-desc">List all available Job Descriptions</span>
        <a class="try-btn" href="/api/jobs" target="_blank">Try Live</a>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">Returns normalized jobs catalog including must-haves, nice-to-haves, seniority, and applicant metrics.</p>
        <div class="code-block">curl -X GET http://127.0.0.1:8000/api/jobs</div>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/jobs/{job_id}</span>
        <span class="endpoint-desc">Get single JD by ID (e.g., pa_director, 2234533717)</span>
        <a class="try-btn" href="/api/jobs/pa_director" target="_blank">Try (pa_director)</a>
      </div>
      <div class="endpoint-body">
        <div class="code-block">curl -X GET http://127.0.0.1:8000/api/jobs/pa_director</div>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-post">POST</span>
        <span class="endpoint-path">/api/jobs/create</span>
        <span class="endpoint-desc">Ingest and extract requirements for a new JD</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">Triggers Gates A1-A3: raw description extraction, requirement taxonomy parsing, and 384-d MiniLM embedding.</p>
        <div class="code-block">curl -X POST http://127.0.0.1:8000/api/jobs/create \
  -H "Content-Type: application/json" \
  -d '{"title": "DevOps Engineer", "company": "TechCorp", "description": "Looking for AWS and Kubernetes expert..."}'</div>
      </div>
    </div>

    <div class="section-title">Candidate Evaluation & Screening</div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/candidates</span>
        <span class="endpoint-desc">List candidate roster with scores, decisions & skills match</span>
        <a class="try-btn" href="/api/candidates" target="_blank">Try Live</a>
      </div>
      <div class="endpoint-body">
        <div class="code-block">curl -X GET "http://127.0.0.1:8000/api/candidates?jd=pa_director"</div>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/candidate?id={candidate_id}</span>
        <span class="endpoint-desc">Deep-dive candidate scorecard, 5-D breakdown & evidence ledger</span>
        <a class="try-btn" href="/api/candidate?id=c_aksada" target="_blank">Try Live</a>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-post">POST</span>
        <span class="endpoint-path">/api/pipeline/run</span>
        <span class="endpoint-desc">Execute full 10-Gate ATS pipeline on a candidate resume</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">Executes Gates 0-8 synchronously and returns deterministic scorecard, evidence ledger, and ASCII report.</p>
        <div class="code-block">curl -X POST http://127.0.0.1:8000/api/pipeline/run \
  -H "Content-Type: application/json" \
  -d '{"resume": "riya_sharma.pdf", "jd": "pa_director"}'</div>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-post">POST</span>
        <span class="endpoint-path">/api/applications/submit</span>
        <span class="endpoint-desc">Submit candidate application and trigger screening</span>
      </div>
      <div class="endpoint-body">
        <div class="code-block">curl -X POST http://127.0.0.1:8000/api/applications/submit \
  -H "Content-Type: application/json" \
  -d '{"jobId": "pa_director", "candidate_id": "riya_sharma", "resume_name": "riya_sharma.pdf"}'</div>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/applications</span>
        <span class="endpoint-desc">List all candidate applications with live 4-step timelines</span>
        <a class="try-btn" href="/api/applications" target="_blank">Try Live</a>
      </div>
      <div class="endpoint-body">
        <div class="code-block">curl -X GET http://127.0.0.1:8000/api/applications</div>
      </div>
    </div>

    <div class="section-title">Audit Trail & Governance</div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-post">POST</span>
        <span class="endpoint-path">/api/override</span>
        <span class="endpoint-desc">Log human recruiter decision override with audit justification</span>
      </div>
      <div class="endpoint-body">
        <div class="code-block">curl -X POST http://127.0.0.1:8000/api/override \
  -H "Content-Type: application/json" \
  -d '{"candidate_id": "aksada", "decision": "AUTO_ADVANCE", "reason": "Exceptional practical portfolio", "recruiter_id": "HR-Admin"}'</div>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/evaluation</span>
        <span class="endpoint-desc">Benchmark evaluation metrics (NDCG@10, Recall Bias, Hallucination)</span>
        <a class="try-btn" href="/api/evaluation" target="_blank">Try Live</a>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/logs</span>
        <span class="endpoint-desc">Immutable audit logs and system decisions</span>
        <a class="try-btn" href="/api/logs" target="_blank">Try Live</a>
      </div>
    </div>
  </div>
</body>
</html>
"""


class HYTAPIServerHandler(HYTServerHandler):
    """
    Subclasses the unified server handler to provide dedicated /api and /docs
    interactive documentation and health checks.
    """
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Handle API Docs & Interactive Explorer
        if path in ("/api", "/api/", "/api/docs", "/docs", "/api-docs"):
            accept_header = self.headers.get("Accept", "")
            if "application/json" in accept_header and "text/html" not in accept_header:
                # Return JSON schema of all endpoints
                self.send_json(200, {
                    "title": "HuntYourTribe (HYT ATS) REST API",
                    "version": "1.0.0",
                    "description": "Deterministic 10-Gate AI Screening Pipeline & Talent Orchestrator REST Backend",
                    "endpoints": [
                        {"method": "GET", "path": "/api/health", "summary": "System liveness check"},
                        {"method": "GET", "path": "/api/status", "summary": "Detailed system status and AI providers"},
                        {"method": "GET", "path": "/api/jobs", "summary": "List all active Job Descriptions"},
                        {"method": "GET", "path": "/api/jobs/<job_id>", "summary": "Get specific Job Description details"},
                        {"method": "POST", "path": "/api/jobs/create", "summary": "Create/Ingest a new Job Description"},
                        {"method": "GET", "path": "/api/candidates", "summary": "List screened candidates and scores"},
                        {"method": "GET", "path": "/api/candidate?id=<id>", "summary": "Candidate deep-dive record and evidence ledger"},
                        {"method": "POST", "path": "/api/pipeline/run", "summary": "Screen resume against JD through 10-gate pipeline"},
                        {"method": "POST", "path": "/api/resume/upload", "summary": "Upload resume PDF and run Gate 0 Integrity Shield"},
                        {"method": "POST", "path": "/api/applications/submit", "summary": "Submit job application with live screening"},
                        {"method": "GET", "path": "/api/applications", "summary": "List candidate applications and 4-step timelines"},
                        {"method": "POST", "path": "/api/override", "summary": "Log immutable recruiter decision override"},
                        {"method": "GET", "path": "/api/evaluation", "summary": "Benchmark evaluation metrics"},
                        {"method": "GET", "path": "/api/logs", "summary": "Audit logs and immutable decision trails"},
                        {"method": "GET", "path": "/api/config", "summary": "Current pipeline weights and threshold configuration"},
                        {"method": "GET", "path": "/api/models", "summary": "AI model ecosystem and provider status"},
                        {"method": "GET", "path": "/api/pdf?file=<filename>", "summary": "Stream and preview candidate resume or JD PDF in browser"}
                    ]
                })
                return
            else:
                html_bytes = API_DOCS_HTML.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(html_bytes)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(html_bytes)
                return

        # Alias /api/health to /api/status
        if path == "/api/health":
            self.send_json(200, {
                "status": "healthy",
                "service": "hyt-ats-backend",
                "version": "1.0.0",
                "timestamp": sys.version
            })
            return

        super().do_GET()


def run_api_server(host: str = "127.0.0.1", port: int = 8000):
    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, HYTAPIServerHandler)
    print("\n" + "=" * 70)
    print(" [HYT ATS] Deterministic Screening Backend REST API Server")
    print("=" * 70)
    print(f" REST API Base URL:       http://{host}:{port}/api")
    print(f" Interactive API Docs:    http://{host}:{port}/api/docs (or /docs)")
    print(f" Health Check Probe:      http://{host}:{port}/api/health")
    print(f" Web Application UI:      http://{host}:{port}/")
    print("-" * 70)
    print(" Key API Endpoints:")
    print(f"   GET  /api/status               System health & LLM status")
    print(f"   GET  /api/jobs                 List all active Job Descriptions")
    print(f"   GET  /api/jobs/<job_id>        Get detailed JD requirements")
    print(f"   POST /api/jobs/create          Ingest & extract requirements for new JD")
    print(f"   GET  /api/candidates           List screened candidates roster")
    print(f"   GET  /api/candidate?id=<id>    Deep-dive scorecard & evidence ledger")
    print(f"   POST /api/pipeline/run         Run 10-Gate ATS evaluation on candidate")
    print(f"   POST /api/resume/upload        Upload PDF & run Gate 0 Integrity Shield")
    print(f"   POST /api/applications/submit  Submit application & auto-screen")
    print(f"   GET  /api/applications         List applications with live timelines")
    print(f"   POST /api/override             Log immutable recruiter decision override")
    print(f"   GET  /api/evaluation           Benchmark evaluation metrics")
    print(f"   GET  /api/logs                 Audit trail logs")
    print("=" * 70)
    print(" Server is listening. Press Ctrl+C to terminate.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[HYT ATS] API Server shutting down gracefully.")
        httpd.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HYT ATS Backend REST API Server")
    parser.add_argument("port", nargs="?", type=int, default=8000, help="Port to listen on (default: 8000)")
    parser.add_argument("--port", "-p", dest="opt_port", type=int, default=None, help="Port to listen on")
    parser.add_argument("--host", "-H", type=str, default="127.0.0.1", help="Host interface (default: 127.0.0.1)")
    args = parser.parse_args()

    active_port = args.opt_port if args.opt_port is not None else args.port
    run_api_server(host=args.host, port=active_port)
