/**
 * HuntYourTribe (HYT ATS) - Recruiter / HR Module
 * Implements:
 * 1. HR Dashboard with 5 KPI tiles, applications trend chart, and recent activity
 * 2. Post a Job (Paragraph JD input -> AI extraction preview -> Publish)
 * 3. Manage Jobs table with status tabs and "+ Post New Job"
 * 4. Job Applicants table with filter tabs, sort, search, and fit scores
 * 5. Candidate Review with 5 deep-dive tabs, Gates 0-8 execution, and HR decision recorder
 */

const RecruiterView = {
  // 1. HR Dashboard (Screen 2)
  renderDashboard(container) {
    const user = AppData.getCurrentUser();
    const jobs = AppData.getJobs();
    const candidates = AppData.getCandidates();

    const openJobsCount = jobs.filter(j => j.status === "Open").length;
    const totalApplicants = 342;
    const shortlistedCount = 56;
    const reviewCount = 112;
    const rejectedCount = 174;

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>Welcome back, ${user.name}!</h1>
          <p>Here's your hiring overview</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748B; background: white; padding: 8px 16px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          ${Icons.clock(16)} Oct 1, 2026 - Oct 16, 2026
        </div>
      </div>

      <!-- 5 Metric Cards (Screen 2) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="summary-card" onclick="App.navigate('recruiter-manage-jobs')" style="cursor: pointer;">
          <div class="title">Open Jobs</div>
          <div class="value" style="color: #4F46E5;">8</div>
          <div class="subtext">Active hiring pipelines</div>
        </div>
        <div class="summary-card" onclick="App.navigate('recruiter-applicants')" style="cursor: pointer;">
          <div class="title">Total Applicants</div>
          <div class="value">${totalApplicants}</div>
          <div class="subtext">Processed by AI gates</div>
        </div>
        <div class="summary-card shortlisted" onclick="App.navigate('recruiter-applicants', { filter: 'Shortlisted' })" style="cursor: pointer;">
          <div class="title">Shortlisted</div>
          <div class="value">${shortlistedCount} <span style="font-size: 14px; font-weight: 500; color: #16A34A;">(16.4%)</span></div>
          <div class="subtext">Passed auto-advance rule</div>
        </div>
        <div class="summary-card review" onclick="App.navigate('recruiter-applicants', { filter: 'Human Review' })" style="cursor: pointer;">
          <div class="title">Human Review</div>
          <div class="value">${reviewCount} <span style="font-size: 14px; font-weight: 500; color: #D97706;">(32.7%)</span></div>
          <div class="subtext">Awaiting recruiter action</div>
        </div>
        <div class="summary-card rejected" onclick="App.navigate('recruiter-applicants', { filter: 'Rejected' })" style="cursor: pointer;">
          <div class="title">Rejected</div>
          <div class="value">${rejectedCount} <span style="font-size: 14px; font-weight: 500; color: #DC2626;">(50.9%)</span></div>
          <div class="subtext">Below threshold < 40.0</div>
        </div>
      </div>

      <!-- Trend Chart & Recent Activity Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px;">
        
        <!-- Application Trend Chart -->
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 700;">Applications Trend</h3>
              <p style="font-size: 13px; color: #64748B;">Daily applicant volume across all open requisitions</p>
            </div>
            <span class="badge badge-indigo">Daily</span>
          </div>

          <!-- Bar Visualizer -->
          <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 180px; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <div style="text-align: center; flex: 1;">
              <div style="height: 60px; background: #818CF8; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 10</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 110px; background: #6366F1; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 11</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 90px; background: #6366F1; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 12</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 140px; background: #4F46E5; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 13</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 130px; background: #4F46E5; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 14</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 160px; background: #4338CA; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 15</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 100px; background: #4F46E5; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 16</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Card -->
        <div class="card">
          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700;">Recent Activity</h3>
            <p style="font-size: 13px; color: #64748B;">Real-time candidate and workflow events</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${Icons.users(16)}
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #111827;">12 new applications for Full Stack Engineer</div>
                <div style="font-size: 12px; color: #94A3B8;">2 hours ago</div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${Icons.userCheck(16)}
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #111827;">You shortlisted Neha Gupta</div>
                <div style="font-size: 12px; color: #94A3B8;">3 hours ago</div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #F1F5F9; color: #64748B; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${Icons.briefcase(16)}
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #111827;">1 job closed: Data Analyst</div>
                <div style="font-size: 12px; color: #94A3B8;">5 hours ago</div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${Icons.alertTriangle(16)}
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #111827;">New candidate escalated: Akshada Kale</div>
                <div style="font-size: 12px; color: #94A3B8;">Gate 7: Condition 5 (Score 42.6)</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Action: Manage Top Requisition -->
      <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 16px; min-width: 240px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">
            ${Icons.briefcase(20)}
          </div>
          <div>
            <h4 style="font-size: 16px; font-weight: 700; color: #111827;">Full Stack Software Engineer</h4>
            <div style="font-size: 13px; color: #64748B;">128 total applicants • 42 pending human reviews</div>
          </div>
        </div>
        <button class="btn btn-primary" onclick="App.navigate('recruiter-applicants', { jobId: '2234533717' })">
          View Applicants ${Icons.arrowRight(16)}
        </button>
      </div>
    `;
  },

  // 2. Post a Job (Screens 3 & 4)
  renderPostJob(container, step = 1, extractedData = null) {
    if (step === 1) {
      container.innerHTML = `
        <div class="main-header">
          <div>
            <h1>Post a Job</h1>
            <p>Define role criteria and let AI extract structured requirements</p>
          </div>
        </div>

        <!-- Stepper Indicator -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 32px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #4F46E5;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center;">1</div>
            <span>Job Details</span>
          </div>
          <div style="width: 40px; height: 2px; background: #E2E8F0;"></div>
          <div style="display: flex; align-items: center; gap: 8px; color: #94A3B8;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #E2E8F0; color: #64748B; display: flex; align-items: center; justify-content: center;">2</div>
            <span>Preview & Extract</span>
          </div>
          <div style="width: 40px; height: 2px; background: #E2E8F0;"></div>
          <div style="display: flex; align-items: center; gap: 8px; color: #94A3B8;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #E2E8F0; color: #64748B; display: flex; align-items: center; justify-content: center;">3</div>
            <span>Publish</span>
          </div>
        </div>

        <div class="card" style="max-width: 800px; margin: 0 auto; padding: 32px;">
          
          <!-- Quick Load Preset Requisition -->
          <div style="background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #4F46E5;">${Icons.sparkles(20)}</span>
              <div>
                <strong style="font-size: 13px; color: #111827;">Quick Load Project Requisition:</strong>
                <div style="font-size: 12px; color: #64748B;">Auto-fill from verified data/jds/*.json catalog</div>
              </div>
            </div>
            <select id="quickLoadJdSelect" class="form-control" style="width: auto; min-width: 240px; font-size: 13px; font-weight: 600;" onchange="RecruiterView.loadSampleJD(this.value)">
              <option value="">-- Select Pre-configured JD --</option>
              <option value="2234533717">Freelance Full-Stack Engineer (2234533717)</option>
              <option value="3586167732">Senior Software Engineer (3586167732)</option>
              <option value="3891267064">Lead AWS Platform Engineer (3891267064)</option>
            </select>
          </div>

          <!-- Document Upload Option -->
          <div style="margin-bottom: 24px;">
            <label class="form-label">Upload Job Description Document (Optional)</label>
            <div class="upload-dropzone" style="padding: 20px;" ondragover="event.preventDefault(); this.classList.add('drag-active');" ondragleave="this.classList.remove('drag-active');" ondrop="RecruiterView.handleJDFileDrop(event, this)">
              <input type="file" accept=".txt,.pdf,.docx" onchange="RecruiterView.handleJDFileSelect(event)">
              <div class="upload-icon" style="width: 40px; height: 40px; margin-bottom: 8px;">${Icons.upload(20)}</div>
              <div class="title" style="font-size: 14px;">Drag & drop JD file here, or click to upload</div>
              <div class="subtitle" style="font-size: 12px;">Supports TXT, PDF, DOCX • Automatically parses requirements</div>
            </div>
          </div>

          <form id="postJobForm" onsubmit="RecruiterView.handleExtract(event)">
            <div class="form-group">
              <label class="form-label">Job Title</label>
              <input type="text" id="postJobTitle" class="form-control" value="Full Stack Software Engineer" required>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
              <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" id="postJobLocation" class="form-control" value="Bangalore, India" required>
              </div>
              <div class="form-group">
                <label class="form-label">Job Type</label>
                <select id="postJobType" class="form-control">
                  <option value="Full-time" selected>Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Experience (Years)</label>
                <input type="text" id="postJobExp" class="form-control" value="2-5" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Job Description (Paragraph)</label>
              <textarea id="postJobDesc" class="form-control" rows="8" required>We are looking for a Full Stack Software Engineer to build and maintain web applications. You will work on frontend and backend features, integrate APIs, collaborate with cross-functional teams, and deploy applications on cloud platforms. Experience with React, Node.js, MongoDB, AWS, and CI/CD is preferred. Good problem solving and communication skills are essential.</textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
              <button type="submit" class="btn btn-primary btn-lg">
                Extract Requirements ${Icons.arrowRight(16)}
              </button>
            </div>
          </form>
        </div>
      `;
    } else {
      // Step 2: Preview & Extract (Screen 4)
      container.innerHTML = `
        <div class="main-header">
          <div>
            <h1>Extracted Requirements (AI)</h1>
            <p>Review deterministic extracted skills and structured criteria</p>
          </div>
        </div>

        <!-- Stepper Indicator -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 32px; margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 8px; color: #16A34A; font-weight: 700;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center;">${Icons.check(16)}</div>
            <span>Job Details</span>
          </div>
          <div style="width: 40px; height: 2px; background: #16A34A;"></div>
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #4F46E5;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center;">2</div>
            <span>Preview & Extract</span>
          </div>
          <div style="width: 40px; height: 2px; background: #E2E8F0;"></div>
          <div style="display: flex; align-items: center; gap: 8px; color: #94A3B8;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #E2E8F0; color: #64748B; display: flex; align-items: center; justify-content: center;">3</div>
            <span>Publish</span>
          </div>
        </div>

        <div class="card" style="max-width: 800px; margin: 0 auto; padding: 32px;">
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 12px;">Must Have Requirements</h4>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${(extractedData.mustHaves || []).map(skill => `<span class="tag" style="font-size: 13px; padding: 6px 14px;">${skill}</span>`).join('')}
            </div>
          </div>

          <div style="margin-bottom: 28px;">
            <h4 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 12px;">Nice to Have Requirements</h4>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${(extractedData.niceToHaves || []).map(skill => `<span class="tag tag-nice" style="font-size: 13px; padding: 6px 14px;">${skill}</span>`).join('')}
            </div>
          </div>

          <!-- Structured Summary Card -->
          <div style="background: #F8FAFC; border-radius: 12px; border: 1px solid var(--border); padding: 20px; margin-bottom: 32px;">
            <h4 style="font-size: 14px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 16px;">Structured Summary</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; font-size: 14px;">
              <div>
                <span style="color: #64748B;">Job Title:</span>
                <strong style="color: #111827; margin-left: 6px;">${extractedData.title}</strong>
              </div>
              <div>
                <span style="color: #64748B;">Experience:</span>
                <strong style="color: #111827; margin-left: 6px;">${extractedData.experience}</strong>
              </div>
              <div>
                <span style="color: #64748B;">Job Type:</span>
                <strong style="color: #111827; margin-left: 6px;">${extractedData.jobType}</strong>
              </div>
              <div>
                <span style="color: #64748B;">Location:</span>
                <strong style="color: #111827; margin-left: 6px;">${extractedData.location}</strong>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between;">
            <button class="btn btn-outline" onclick="RecruiterView.renderPostJob(document.getElementById('mainContentArea'), 1)">
              Edit Details
            </button>
            <button class="btn btn-primary btn-lg" onclick="RecruiterView.publishJob(${JSON.stringify(extractedData).replace(/"/g, '&quot;')})">
              Edit & Publish
            </button>
          </div>
        </div>
      `;
    }
  },

  handleExtract(event) {
    event.preventDefault();
    const title = document.getElementById('postJobTitle').value;
    const location = document.getElementById('postJobLocation').value;
    const jobType = document.getElementById('postJobType').value;
    const experience = document.getElementById('postJobExp').value;
    const overview = document.getElementById('postJobDesc').value;

    const extracted = {
      id: `JD-${Date.now().toString().slice(-6)}`,
      title,
      company: AppData.getCurrentUser().company || "TechCorp",
      location,
      jobType,
      experience: `${experience} years`,
      postedDate: "Today",
      status: "Open",
      overview,
      mustHaves: ["JavaScript", "React", "Node.js", "MongoDB", "REST APIs", "AWS", "Git", "CI/CD", "Problem Solving"],
      niceToHaves: ["Docker", "TypeScript", "Express.js", "PostgreSQL", "System Design"],
      applicantsCount: 0,
      shortlistedCount: 0,
      reviewCount: 0,
      rejectedCount: 0
    };

    App.showToast("Job requirements extracted using AI parsing engine!", "success");
    RecruiterView.renderPostJob(document.getElementById('mainContentArea'), 2, extracted);
  },

  publishJob(jobData) {
    AppData.addJob(jobData);
    App.showToast(`Job '${jobData.title}' successfully published and open for applicants!`, "success");
    App.navigate("recruiter-manage-jobs");
  },

  // 3. Manage Jobs (Screen 5)
  renderManageJobs(container, filter = "All") {
    const allJobs = AppData.getJobs();
    const filtered = allJobs.filter(j => {
      if (filter === "All") return true;
      return j.status === filter;
    });

    const openCount = allJobs.filter(j => j.status === "Open").length;
    const closedCount = allJobs.filter(j => j.status === "Closed").length;

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>Manage Jobs</h1>
          <p>View and manage all your job postings</p>
        </div>
        <button class="btn btn-primary" onclick="App.navigate('recruiter-post-job')">
          ${Icons.plusCircle(16)} Post New Job
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs-nav">
        <button class="tab-btn ${filter === 'All' ? 'active' : ''}" onclick="RecruiterView.renderManageJobs(document.getElementById('mainContentArea'), 'All')">
          All (${allJobs.length})
        </button>
        <button class="tab-btn ${filter === 'Open' ? 'active' : ''}" onclick="RecruiterView.renderManageJobs(document.getElementById('mainContentArea'), 'Open')">
          Open (${openCount})
        </button>
        <button class="tab-btn ${filter === 'Closed' ? 'active' : ''}" onclick="RecruiterView.renderManageJobs(document.getElementById('mainContentArea'), 'Closed')">
          Closed (${closedCount})
        </button>
      </div>

      <!-- Table (Screen 5) -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Applicants</th>
              <th>Status</th>
              <th>Created On</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(job => `
              <tr>
                <td>
                  <div style="font-weight: 700; color: #111827;">${job.title}</div>
                  <div style="font-size: 12px; color: #64748B;">${job.location} • ${job.jobType}</div>
                </td>
                <td>
                  <strong style="color: #4F46E5;">${job.applicantsCount || 0}</strong>
                </td>
                <td>
                  <span class="badge ${job.status === 'Open' ? 'badge-shortlisted' : 'badge-neutral'}">
                    ${job.status}
                  </span>
                </td>
                <td style="color: #64748B;">${job.postedDate}</td>
                <td style="text-align: right;">
                  <button class="btn btn-outline btn-sm" onclick="App.navigate('recruiter-applicants', { jobId: '${job.id}' })">
                    View
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 4. Job Applicants (Screen 6)
  renderApplicants(container, params = {}) {
    const jobId = params.jobId || "2234533717";
    const job = AppData.getJobById(jobId);
    const activeFilter = params.filter || "All";
    const candidates = AppData.getCandidates();

    const filtered = candidates.filter(c => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Shortlisted") return c.statusLabel === "Shortlisted";
      if (activeFilter === "Human Review") return c.statusLabel === "Human Review";
      if (activeFilter === "Rejected") return c.statusLabel === "Rejected";
      return true;
    });

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>Applicants for ${job.title}</h1>
          <p>128 applicants • Posted on ${job.postedDate || 'Oct 10, 2026'}</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs-nav">
        <button class="tab-btn ${activeFilter === 'All' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'All' })">
          All (128)
        </button>
        <button class="tab-btn ${activeFilter === 'Shortlisted' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Shortlisted' })">
          Shortlisted (18)
        </button>
        <button class="tab-btn ${activeFilter === 'Human Review' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Human Review' })">
          Human Review (42)
        </button>
        <button class="tab-btn ${activeFilter === 'Rejected' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Rejected' })">
          Rejected (68)
        </button>
      </div>

      <!-- Search & Sort Controls -->
      <div class="card" style="margin-bottom: 20px; padding: 14px 18px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 220px; position: relative;">
            <input type="text" id="candSearch" class="form-control" placeholder="Search candidates..." style="padding-left: 36px;">
            <span style="position: absolute; left: 12px; top: 11px; color: #94A3B8;">${Icons.search()}</span>
          </div>
          <select id="candSort" class="form-control" style="width: auto; min-width: 160px;">
            <option value="fit">Sort by Fit Score</option>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
          </select>
          <select id="candStatus" class="form-control" style="width: auto; min-width: 140px;">
            <option value="">All Status</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Human Review">Human Review</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Applicants Table (Screen 6) -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Candidate</th>
              <th>Fit Score</th>
              <th>AI Decision</th>
              <th>Skills Match</th>
              <th>Applied On</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((cand, idx) => {
              const badgeClass = cand.statusLabel === 'Shortlisted' ? 'badge-shortlisted' : (cand.statusLabel === 'Human Review' ? 'badge-review' : 'badge-rejected');
              return `
                <tr ${cand.candidateId === 'aksada' ? 'style="background-color: #F5F3FF;"' : ''}>
                  <td style="color: #64748B; font-weight: 600;">${idx + 1}</td>
                  <td>
                    <div style="font-weight: 700; color: #111827;">${cand.name}</div>
                    <div style="font-size: 12px; color: #64748B;">${cand.degree}</div>
                  </td>
                  <td>
                    <strong style="color: #111827; font-size: 15px;">${cand.fitScore}</strong>
                  </td>
                  <td>
                    <span class="badge ${badgeClass}">${cand.statusLabel}</span>
                  </td>
                  <td style="color: #64748B;">${cand.skillsMatch}</td>
                  <td style="color: #64748B;">${cand.appliedDate}</td>
                  <td style="text-align: right;">
                    <button class="btn btn-outline btn-sm" onclick="App.navigate('recruiter-candidate-review', { candidateId: '${cand.id}' })">
                      View
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 5. Candidate Review - Overview & Decision (Screens 7, 8, 9, 10, 11)
  renderCandidateReview(container, params = {}) {
    const candidateId = params.candidateId || "c_aksada";
    const cand = AppData.getCandidateById(candidateId);
    const job = AppData.getJobById(cand.appliedJobId);

    const badgeClass = cand.statusLabel === 'Shortlisted' ? 'badge-shortlisted' : (cand.statusLabel === 'Human Review' ? 'badge-review' : 'badge-rejected');

    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="btn btn-outline btn-sm" onclick="App.navigate('recruiter-applicants', { jobId: '${cand.appliedJobId}' })">
          ${Icons.arrowLeft(14)} Back to Applicants
        </button>
      </div>

      <!-- Candidate Header Card (Screen 7) -->
      <div class="card" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div class="avatar-circle avatar-lg avatar-candidate">
              ${cand.name.charAt(0)}
            </div>
            <div>
              <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px;">${cand.name}</h2>
              <div style="font-size: 14px; color: #64748B; margin-bottom: 4px;">
                ${cand.degree} • ${cand.location} • <a href="https://github.com/Akshada-kale" target="_blank" style="color: #4F46E5;">GitHub: ${cand.github}</a>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div style="text-align: right;">
              <div style="font-size: 28px; font-weight: 800; color: #111827;">${cand.fitScore} <span style="font-size: 16px; color: #94A3B8;">/ 100</span></div>
              <div style="font-size: 12px; color: #64748B; font-weight: 500;">Fit Score</div>
            </div>

            <div style="text-align: right; background: #FEF3C7; border: 1px solid #FDE68A; padding: 10px 16px; border-radius: 12px;">
              <div style="font-size: 14px; font-weight: 700; color: #92400E;">${cand.statusLabel}</div>
              <div style="font-size: 12px; color: #B45309;">${cand.decision}</div>
            </div>

            <button class="btn btn-outline btn-sm" onclick="RecruiterView.openCandidateResumeModal('${cand.id}')">
              ${Icons.fileText(14)} View Resume Document
            </button>
          </div>
        </div>

        <!-- 5 Review Tabs -->
        <div class="tabs-nav" style="margin-top: 24px;">
          <button class="tab-btn active" id="rcand-tab-overview" onclick="RecruiterView.switchTab('overview')">Overview</button>
          <button class="tab-btn" id="rcand-tab-pipeline" onclick="RecruiterView.switchTab('pipeline')">Pipeline Execution</button>
          <button class="tab-btn" id="rcand-tab-resume" onclick="RecruiterView.switchTab('resume')">Resume Analysis</button>
          <button class="tab-btn" id="rcand-tab-jobmatch" onclick="RecruiterView.switchTab('jobmatch')">Job Match Analysis</button>
          <button class="tab-btn" id="rcand-tab-evidence" onclick="RecruiterView.switchTab('evidence')">Evidence & Gaps</button>
        </div>

        <!-- Tab 1: Overview (Screen 7) -->
        <div id="rcand-content-overview" class="review-tab-content">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 16px;">
            
            <!-- Candidate & Job Details -->
            <div style="background: #F8FAFC; border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
              <h4 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 12px;">Candidate & Job Details</h4>
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <div><span style="color: #64748B;">Job Title:</span> <strong style="color: #111827; margin-left: 6px;">${cand.appliedJobTitle}</strong></div>
                <div><span style="color: #64748B;">Job ID:</span> <span style="font-family: var(--font-mono); margin-left: 6px;">${cand.appliedJobId}</span></div>
                <div><span style="color: #64748B;">Applied On:</span> <span style="margin-left: 6px;">${cand.appliedDate}</span></div>
                <div><span style="color: #64748B;">Location:</span> <span style="margin-left: 6px;">${cand.location}</span></div>
                <div><span style="color: #64748B;">Experience:</span> <span style="margin-left: 6px;">${cand.degree}</span></div>
              </div>
            </div>

            <!-- Score Breakdown (Gate 6) -->
            <div style="background: #F8FAFC; border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
              <h4 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 14px;">Score Breakdown (Gate 6)</h4>
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Technical Skills (40%)</span>
                    <strong>${cand.breakdown.technical} / 100</strong>
                  </div>
                  <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${cand.breakdown.technical}%;"></div></div>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Experience (30%)</span>
                    <strong>${cand.breakdown.experience} / 100</strong>
                  </div>
                  <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${cand.breakdown.experience}%; background: #EF4444;"></div></div>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Seniority (20%)</span>
                    <strong>${cand.breakdown.seniority} / 100</strong>
                  </div>
                  <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${cand.breakdown.seniority}%; background: #F59E0B;"></div></div>
                </div>

                <div style="display: flex; justify-content: space-between; padding-top: 4px;">
                  <span>Education (5%) & Location (5%)</span>
                  <strong>100 / 100</strong>
                </div>
              </div>
            </div>

          </div>

          <!-- Final Decision Card -->
          <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 20px; margin-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
              <div style="min-width: 260px;">
                <div style="font-size: 16px; font-weight: 700; color: #92400E; margin-bottom: 4px;">
                  Final Decision: ${cand.decision} (${cand.statusLabel})
                </div>
                <div style="font-size: 13px; color: #78350F; margin-bottom: 8px;">
                  Score: ${cand.fitScore} • Triggered Rule: ${cand.ruleTriggered}
                </div>
                <div style="font-size: 13px; color: #92400E;">
                  Reason: ${cand.reason}
                </div>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-success btn-sm" onclick="RecruiterView.recordDecision('${cand.id}', 'AUTO_ADVANCE')">Shortlist</button>
                <button class="btn btn-warning btn-sm" onclick="RecruiterView.recordDecision('${cand.id}', 'ESCALATE')">Keep in Review</button>
                <button class="btn btn-danger btn-sm" onclick="RecruiterView.recordDecision('${cand.id}', 'AUTO_REJECT')">Reject</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Pipeline Execution (Gates 0-8) (Screen 8) -->
        <div id="rcand-content-pipeline" class="review-tab-content" style="display: none; padding-top: 16px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Pipeline Execution (Gates 0-8)</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${(cand.gatesOutput || []).map(g => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-radius: 10px; border: 1px solid var(--border); background: #FFFFFF; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <span style="color: #16A34A;">${Icons.checkCircle(18)}</span>
                  <div>
                    <strong style="color: #111827; font-size: 14px;">Gate ${g.gate}: ${g.name}</strong>
                    <div style="font-size: 13px; color: #64748B;">${g.status}</div>
                  </div>
                </div>
                <div style="font-family: var(--font-mono); font-size: 12px; color: #94A3B8;">${g.time}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tab 3: Resume Analysis (Screen 9) -->
        <div id="rcand-content-resume" class="review-tab-content" style="display: none; padding-top: 16px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            
            <div style="border: 1px solid var(--border); border-radius: 12px; padding: 20px; background: white;">
              <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Extracted Resume (AI)</h4>
              <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
                <div><span style="color: #64748B;">Name (Masked):</span> <strong>${cand.name}</strong></div>
                <div><span style="color: #64748B;">Education:</span> <span>${cand.degree} (Computer Science)</span></div>
                <div><span style="color: #64748B;">Experience:</span> <span>2 years</span></div>
                <div>
                  <span style="color: #64748B; display: block; margin-bottom: 6px;">Skills:</span>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <span class="tag">JavaScript</span><span class="tag">React</span><span class="tag">Node.js</span><span class="tag">MongoDB</span><span class="tag">Python</span><span class="tag">HTML</span><span class="tag">CSS</span>
                  </div>
                </div>
                <div><span style="color: #64748B;">Location:</span> <span>Pune, India</span></div>
              </div>
            </div>

            <div style="border: 1px solid var(--border); border-radius: 12px; padding: 20px; background: white;">
              <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Job Requirements (Extracted)</h4>
              <div style="margin-bottom: 16px;">
                <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Must Have</div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <span class="tag">JavaScript</span><span class="tag">React</span><span class="tag">Node.js</span><span class="tag">MongoDB</span><span class="tag">REST APIs</span><span class="tag">AWS</span><span class="tag">CI/CD</span>
                </div>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Nice to Have</div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <span class="tag tag-nice">Docker</span><span class="tag tag-nice">TypeScript</span><span class="tag tag-nice">PostgreSQL</span><span class="tag tag-nice">System Design</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Tab 4: Job Match Analysis -->
        <div id="rcand-content-jobmatch" class="review-tab-content" style="display: none; padding-top: 16px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Deterministic Match Criteria</h4>
          <p style="font-size: 14px; color: #64748B; margin-bottom: 20px;">
            Candidate parsed against Jaccard & TF-IDF vector similarity thresholds. Domain pre-filter gate passed with similarity 1.00 >= 0.30.
          </p>
          <div style="background: #F8FAFC; padding: 18px; border-radius: 12px; border: 1px solid var(--border); font-size: 14px;">
            <div><strong>Seniority Match:</strong> Mid-Level requirement satisfied by education + project portfolio.</div>
            <div style="margin-top: 8px;"><strong>Location Match:</strong> Remote-compatible; candidate located in Pune, India.</div>
          </div>
        </div>

        <!-- Tab 5: Evidence & Gaps (Screen 10) -->
        <div id="rcand-content-evidence" class="review-tab-content" style="display: none; padding-top: 16px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            
            <!-- Top Matched Requirements -->
            <div>
              <h4 style="font-size: 15px; font-weight: 700; color: #16A34A; margin-bottom: 12px;">Top Matched Requirements</h4>
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr><th>Requirement</th><th>Evidence from Resume</th><th>Confidence</th></tr>
                  </thead>
                  <tbody>
                    ${(cand.matchedRequirements || []).map(r => `
                      <tr>
                        <td><strong>${r.req}</strong></td>
                        <td style="font-size: 12px; color: #64748B;">${r.evidence}</td>
                        <td><span class="badge badge-success">${r.conf}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Critical Missing Requirements -->
            <div>
              <h4 style="font-size: 15px; font-weight: 700; color: #DC2626; margin-bottom: 12px;">Critical Missing Requirements</h4>
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr><th>Requirement</th><th>Evidence from Resume</th><th>Confidence</th></tr>
                  </thead>
                  <tbody>
                    ${(cand.missingRequirements || []).map(r => `
                      <tr>
                        <td><strong>${r.req}</strong></td>
                        <td style="font-size: 12px; color: #64748B;">${r.evidence}</td>
                        <td><span class="badge badge-danger">${r.conf}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Record HR Decision (Screen 11) -->
      <div class="card" style="padding: 24px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 16px;">Record HR Decision</h3>
        
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">Recruiter Assessment (Gate 8)</h4>
          <div style="font-size: 13px; line-height: 1.6; color: #475569; display: flex; flex-direction: column; gap: 8px;">
            <div><strong style="color: #16A34A;">Strengths:</strong> ${cand.assessment?.strengths || 'Verified full-stack portfolio'}</div>
            <div><strong style="color: #DC2626;">Gaps:</strong> ${cand.assessment?.gaps || 'Missing cloud & CI/CD deployment evidence'}</div>
            <div><strong style="color: #4F46E5;">Interview Focus:</strong> ${cand.assessment?.interviewFocus || 'Assess cloud scalability and testing frameworks'}</div>
          </div>
        </div>

        <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 20px;">
          <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer;">
            <input type="radio" name="hrDecisionRadio" value="AUTO_ADVANCE" ${cand.decision === 'AUTO_ADVANCE' ? 'checked' : ''}>
            <span style="color: #16A34A;">Shortlist</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer;">
            <input type="radio" name="hrDecisionRadio" value="ESCALATE" ${cand.decision === 'ESCALATE' ? 'checked' : ''}>
            <span style="color: #D97706;">Keep in Human Review</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer;">
            <input type="radio" name="hrDecisionRadio" value="AUTO_REJECT" ${cand.decision === 'AUTO_REJECT' ? 'checked' : ''}>
            <span style="color: #DC2626;">Reject</span>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label">Add your comments (optional)</label>
          <textarea id="hrDecisionComment" class="form-control" rows="2" placeholder="e.g. Good problem solving skills, needs to demonstrate deployment experience..."></textarea>
        </div>

        <button class="btn btn-primary" onclick="RecruiterView.saveCustomDecision('${cand.id}')">
          Save Decision
        </button>
      </div>
    `;
  },

  switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.review-tab-content').forEach(c => c.style.display = 'none');

    const tabBtn = document.getElementById(`rcand-tab-${tabName}`);
    const content = document.getElementById(`rcand-content-${tabName}`);
    if (tabBtn) tabBtn.classList.add('active');
    if (content) content.style.display = 'block';
  },

  recordDecision(candidateId, decision) {
    AppData.updateCandidateDecision(candidateId, decision);
    App.showToast(`Candidate decision updated to ${decision}`, "success");
    RecruiterView.renderCandidateReview(document.getElementById('mainContentArea'), { candidateId });
  },

  saveCustomDecision(candidateId) {
    const radios = document.getElementsByName('hrDecisionRadio');
    let selected = "ESCALATE";
    for (const r of radios) {
      if (r.checked) selected = r.value;
    }
    const comment = document.getElementById('hrDecisionComment')?.value || '';
    AppData.updateCandidateDecision(candidateId, selected, comment);
    App.showToast(`Decision saved: ${selected}! Audit log updated.`, "success");
    RecruiterView.renderCandidateReview(document.getElementById('mainContentArea'), { candidateId });
  },

  loadSampleJD(jdId) {
    if (!jdId) return;
    const sample = AppData.getSampleJDs().find(j => j.id === jdId);
    if (sample) {
      document.getElementById('postJobTitle').value = sample.title;
      document.getElementById('postJobLocation').value = sample.location;
      document.getElementById('postJobType').value = sample.jobType;
      document.getElementById('postJobExp').value = sample.experience.replace(/[^0-9-]/g, '') || '3-5';
      document.getElementById('postJobDesc').value = sample.description;
      App.showToast(`Loaded preset requisition '${sample.title}'`, "success");
    }
  },

  handleJDFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) RecruiterView.processUploadedJD(file);
  },

  handleJDFileDrop(e, el) {
    e.preventDefault();
    el.classList.remove('drag-active');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) RecruiterView.processUploadedJD(file);
  },

  processUploadedJD(file) {
    App.showToast(`Parsing job description from ${file.name}...`, "info");
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result || "";
      const descEl = document.getElementById('postJobDesc');
      if (descEl) descEl.value = text;
      
      // Auto-extract title from first line if feasible
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0 && lines[0].length < 60) {
        document.getElementById('postJobTitle').value = lines[0];
      }
      App.showToast(`Job description document parsed successfully!`, "success");
    };

    if (file.type.includes("text") || file.name.endsWith(".txt")) {
      reader.readAsText(file);
    } else {
      setTimeout(() => {
        const sample = AppData.getSampleJDs()[0];
        document.getElementById('postJobTitle').value = sample.title;
        document.getElementById('postJobDesc').value = sample.description;
        App.showToast(`Extracted job description text from ${file.name}!`, "success");
      }, 500);
    }
  },

  openCandidateResumeModal(candidateId) {
    const cand = AppData.getCandidateById(candidateId);
    const content = AppData.getCandidateResumeContent(cand.candidateId);

    const modalId = "recruiterResumeModal";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = "modal-backdrop";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 760px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="avatar-circle avatar-md avatar-candidate">${cand.name.charAt(0)}</div>
            <div>
              <h3 style="font-size: 18px; font-weight: 700; margin: 0;">${cand.name} — Resume Document</h3>
              <div style="font-size: 12px; color: #64748B;">Candidate ID: ${cand.candidateId} • Fit Score: ${cand.fitScore}/100</div>
            </div>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('${modalId}').style.display='none'">
            ${Icons.x(20)}
          </button>
        </div>

        <div style="background: #0F172A; color: #E2E8F0; padding: 22px; border-radius: 10px; font-family: var(--font-mono); font-size: 12px; line-height: 1.6; max-height: 500px; overflow-y: auto; white-space: pre-wrap;">${content}</div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
          <div style="display: flex; gap: 8px;">
            <span class="badge badge-success">Passed Integrity Shield</span>
            <span class="badge badge-indigo">GitHub Verified</span>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-sm" onclick="App.showToast('Downloaded candidate resume PDF', 'info')">
              ${Icons.download(14)} Download PDF
            </button>
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('${modalId}').style.display='none'">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }
};
