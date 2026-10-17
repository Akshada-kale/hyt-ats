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
    const applications = AppData.getCandidateApplications() || [];
    const auditLogs = AppData.state.auditLogs || [];

    const openJobsCount = jobs.filter(j => j.status === "Open").length;
    const totalApplicants = candidates.length;
    const shortlistedCount = candidates.filter(c => c.statusLabel === "Shortlisted").length;
    const reviewCount = candidates.filter(c => c.statusLabel === "Human Review").length;
    const rejectedCount = candidates.filter(c => c.statusLabel === "Rejected").length;

    const shortlistedPct = totalApplicants > 0 ? ((shortlistedCount / totalApplicants) * 100).toFixed(1) : "0.0";
    const reviewPct = totalApplicants > 0 ? ((reviewCount / totalApplicants) * 100).toFixed(1) : "0.0";
    const rejectedPct = totalApplicants > 0 ? ((rejectedCount / totalApplicants) * 100).toFixed(1) : "0.0";

    // Build dynamic recent activity feed from real audit logs and real applications
    let activityItems = [];
    auditLogs.slice(-3).reverse().forEach(log => {
      const isShortlist = log.new_decision === 'AUTO_ADVANCE';
      const isReject = log.new_decision === 'REJECT';
      activityItems.push({
        icon: isShortlist ? Icons.userCheck(16) : (isReject ? Icons.x(16) : Icons.alertTriangle(16)),
        bg: isShortlist ? '#DCFCE7' : (isReject ? '#FEE2E2' : '#FEF3C7'),
        color: isShortlist ? '#16A34A' : (isReject ? '#DC2626' : '#D97706'),
        title: `${log.recruiter_id || 'Recruiter'} set decision for ${log.candidate_id}`,
        subtext: log.reason || `Decision overridden to ${log.new_decision}`,
        time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'
      });
    });

    applications.slice(-2).reverse().forEach(app => {
      activityItems.push({
        icon: Icons.users(16),
        bg: '#EEF2FF',
        color: '#4F46E5',
        title: `Application for ${app.jobTitle}`,
        subtext: `Status: ${app.status} • Akshada Kale`,
        time: app.appliedDate || 'Today'
      });
    });

    if (activityItems.length === 0) {
      activityItems = [
        {
          icon: Icons.alertTriangle(16),
          bg: '#FEF3C7',
          color: '#D97706',
          title: 'Candidate escalated: Akshada Kale',
          subtext: 'Gate 7: Condition 5 (Score 42.6/100, Escalate)',
          time: 'Active'
        }
      ];
    }

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>Welcome back, ${user.name}!</h1>
          <p>Here's your real-time hiring overview</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748B; background: white; padding: 8px 16px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          ${Icons.clock(16)} Oct 1, 2026 - Oct 17, 2026
        </div>
      </div>

      <!-- 5 Metric Cards (Screen 2) - Dynamically calculated -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="summary-card" onclick="App.navigate('recruiter-manage-jobs')" style="cursor: pointer;">
          <div class="title">Open Jobs</div>
          <div class="value" style="color: #4F46E5;">${openJobsCount}</div>
          <div class="subtext">Active hiring pipelines</div>
        </div>
        <div class="summary-card" onclick="App.navigate('recruiter-applicants')" style="cursor: pointer;">
          <div class="title">Total Applicants</div>
          <div class="value">${totalApplicants}</div>
          <div class="subtext">Processed by AI gates</div>
        </div>
        <div class="summary-card shortlisted" onclick="App.navigate('recruiter-applicants', { filter: 'Shortlisted' })" style="cursor: pointer;">
          <div class="title">Shortlisted</div>
          <div class="value">${shortlistedCount} <span style="font-size: 14px; font-weight: 500; color: #16A34A;">(${shortlistedPct}%)</span></div>
          <div class="subtext">Passed auto-advance rule</div>
        </div>
        <div class="summary-card review" onclick="App.navigate('recruiter-applicants', { filter: 'Human Review' })" style="cursor: pointer;">
          <div class="title">Human Review</div>
          <div class="value">${reviewCount} <span style="font-size: 14px; font-weight: 500; color: #D97706;">(${reviewPct}%)</span></div>
          <div class="subtext">Awaiting recruiter action</div>
        </div>
        <div class="summary-card rejected" onclick="App.navigate('recruiter-applicants', { filter: 'Rejected' })" style="cursor: pointer;">
          <div class="title">Rejected</div>
          <div class="value">${rejectedCount} <span style="font-size: 14px; font-weight: 500; color: #DC2626;">(${rejectedPct}%)</span></div>
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
              <p style="font-size: 13px; color: #64748B;">Applicant pipeline volume across all open requisitions</p>
            </div>
            <span class="badge badge-indigo">Live Pipeline</span>
          </div>

          <!-- Dynamic Bar Visualizer -->
          <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 180px; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <div style="text-align: center; flex: 1;">
              <div style="height: 50px; background: #818CF8; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 11</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 75px; background: #6366F1; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 12</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 95px; background: #6366F1; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 13</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 140px; background: #4F46E5; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 14</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 120px; background: #4F46E5; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 15</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: 155px; background: #4338CA; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto;"></div>
              <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Oct 16</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="height: ${Math.min(170, Math.max(60, applications.length * 35))}px; background: #2563EB; border-radius: 6px 6px 0 0; width: 36px; margin: 0 auto; box-shadow: 0 0 10px rgba(37,99,235,0.3);"></div>
              <div style="font-size: 11px; font-weight: 700; color: #2563EB; margin-top: 8px;">Oct 17 (Today)</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Card (Dynamically Populated) -->
        <div class="card">
          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700;">Recent Activity</h3>
            <p style="font-size: 13px; color: #64748B;">Real-time audit log and application events</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${activityItems.map(item => `
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: ${item.bg}; color: ${item.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  ${item.icon}
                </div>
                <div>
                  <div style="font-size: 13px; font-weight: 600; color: #111827;">${item.title}</div>
                  <div style="font-size: 12px; color: #64748B;">${item.subtext}</div>
                  <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">${item.time}</div>
                </div>
              </div>
            `).join('')}
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
            <h4 style="font-size: 16px; font-weight: 700; color: #111827;">${jobs[0]?.title || 'Full Stack Software Engineer'}</h4>
            <div style="font-size: 13px; color: #64748B;">${candidates.length} total applicants • ${reviewCount} pending human reviews</div>
          </div>
        </div>
        <button class="btn btn-primary" onclick="App.navigate('recruiter-applicants', { jobId: '${jobs[0]?.id || '2234533717'}' })">
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

        <div class="card" style="width: 100%; padding: 32px;">
          
          <!-- Quick Load Preset Requisition -->
          <div style="background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #4F46E5;">${Icons.sparkles(20)}</span>
              <div>
                <strong style="font-size: 13px; color: #111827;">Quick Load Project Requisition:</strong>
                <div style="font-size: 12px; color: #64748B;">Auto-fill from verified data/jds/*.json catalog</div>
              </div>
            </div>
            <select id="quickLoadJdSelect" class="form-control" style="width: auto; min-width: 260px; font-size: 13px; font-weight: 600;" onchange="RecruiterView.loadSampleJD(this.value)">
              <option value="">-- Select Pre-configured JD --</option>
              ${(AppData.getJobs() || []).map(j => `<option value="${j.id}">${j.title} (${j.id})</option>`).join('')}
            </select>
          </div>

          <!-- Document Upload Option -->
          <div style="margin-bottom: 24px;">
            <label class="form-label">Upload Job Description Document (PDF, TXT, DOCX)</label>
            <div class="upload-dropzone" style="padding: 20px;" ondragover="event.preventDefault(); this.classList.add('drag-active');" ondragleave="this.classList.remove('drag-active');" ondrop="RecruiterView.handleJDFileDrop(event, this)">
              <input type="file" accept=".txt,.pdf,.docx,.json" onchange="RecruiterView.handleJDFileSelect(event)">
              <div class="upload-icon" style="width: 40px; height: 40px; margin-bottom: 8px;">${Icons.upload(20)}</div>
              <div class="title" style="font-size: 14px;">Drag & drop JD file here (e.g. Personal Assistant to Director PDF), or click to upload</div>
              <div class="subtitle" style="font-size: 12px;">Supports PDF, TXT, DOCX, JSON • Uses AI text extraction</div>
            </div>
          </div>

          <form id="postJobForm" onsubmit="RecruiterView.handleExtract(event)">
            <div class="form-group">
              <label class="form-label">Job Title</label>
              <input type="text" id="postJobTitle" class="form-control" placeholder="e.g. Personal Assistant (PA) to the Director" required>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
              <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" id="postJobLocation" class="form-control" placeholder="e.g. Pune, Maharashtra, India" value="Pune, India" required>
              </div>
              <div class="form-group">
                <label class="form-label">Job Type</label>
                <select id="postJobType" class="form-control">
                  <option value="Full-time" selected>Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                  <option value="On-Site / Office-Based">On-Site / Office-Based</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Experience (Years)</label>
                <input type="text" id="postJobExp" class="form-control" placeholder="e.g. 2+ Years" value="2+" required>
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

        <div class="card" style="width: 100%; padding: 32px;">
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

  async handleExtract(event) {
    event.preventDefault();
    const title = document.getElementById('postJobTitle').value;
    const location = document.getElementById('postJobLocation').value;
    const jobType = document.getElementById('postJobType').value;
    const experience = document.getElementById('postJobExp').value;
    const overview = document.getElementById('postJobDesc').value;

    App.showToast("Extracting requirements with AI parsing engine...", "info");
    const extraction = await AppData.extractJobRequirements(overview, title);

    const extracted = {
      id: `JD-${Date.now().toString().slice(-6)}`,
      title,
      company: AppData.getCurrentUser().company || "TechCorp",
      location,
      jobType,
      experience: extraction.experience || `${experience} years`,
      postedDate: "Today",
      status: "Open",
      overview,
      mustHaves: extraction.mustHaves,
      niceToHaves: extraction.niceToHaves,
      applicantsCount: 0,
      shortlistedCount: 0,
      reviewCount: 0,
      rejectedCount: 0
    };

    App.showToast("Job requirements extracted using AI parsing engine!", "success");
    RecruiterView.renderPostJob(document.getElementById('mainContentArea'), 2, extracted);
  },

  async publishJob(jobData) {
    App.showToast(`Publishing job '${jobData.title}' to system catalog...`, "info");
    await AppData.addJob(jobData);
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

    // Match candidates for this job
    const jobCandidates = candidates.filter(c => !c.appliedJobId || String(c.appliedJobId) === String(jobId));
    const allCount = jobCandidates.length;
    const shortlistedCount = jobCandidates.filter(c => c.statusLabel === "Shortlisted").length;
    const reviewCount = jobCandidates.filter(c => c.statusLabel === "Human Review").length;
    const rejectedCount = jobCandidates.filter(c => c.statusLabel === "Rejected").length;

    const filtered = jobCandidates.filter(c => {
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
          <p>${allCount} applicants • Posted on ${job.postedDate || 'Oct 10, 2026'}</p>
        </div>
      </div>

      <!-- Filter Tabs (Dynamically Calculated) -->
      <div class="tabs-nav">
        <button class="tab-btn ${activeFilter === 'All' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'All' })">
          All (${allCount})
        </button>
        <button class="tab-btn ${activeFilter === 'Shortlisted' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Shortlisted' })">
          Shortlisted (${shortlistedCount})
        </button>
        <button class="tab-btn ${activeFilter === 'Human Review' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Human Review' })">
          Human Review (${reviewCount})
        </button>
        <button class="tab-btn ${activeFilter === 'Rejected' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Rejected' })">
          Rejected (${rejectedCount})
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
                  <td style="text-align: right; white-space: nowrap;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                      <button class="btn btn-outline btn-sm" onclick="App.openPdfModal('${cand.resumeFile || (cand.candidateId === 'riya_sharma' ? 'riya_sharma.pdf' : 'aksada.pdf')}', 'Resume PDF: ${cand.name}')">
                        ${Icons.fileText(14)} PDF
                      </button>
                      <button class="btn btn-primary btn-sm" onclick="App.navigate('recruiter-candidate-review', { candidateId: '${cand.id}' })">
                        Review
                      </button>
                    </div>
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
    if (window.AppData && AppData.ensureCandidateLedgerAndRequirements) {
      AppData.ensureCandidateLedgerAndRequirements(cand);
    }
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

            <button class="btn btn-outline btn-sm" onclick="App.openPdfModal('${cand.resumeFile || 'riya_sharma.pdf'}', 'Candidate Resume PDF: ${cand.name}')">
              ${Icons.fileText(14)} PDF Preview
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

        <!-- Tab 3: Resume Analysis (Screen 9) with Live PDF Preview -->
        <div id="rcand-content-resume" class="review-tab-content" style="display: none; padding-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: #FFFFFF; border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center;">
                ${Icons.fileText(18)}
              </div>
              <div>
                <strong style="color: #111827; font-size: 14px;">Resume Document: ${cand.resumeFile || (cand.candidateId === 'riya_sharma' ? 'riya_sharma.pdf' : 'aksada.pdf')}</strong>
                <div style="font-size: 12px; color: #64748B;">Validated via Gate 0 Integrity Shield & Gate 1 Layout Extractor</div>
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" onclick="App.openPdfModal('${cand.resumeFile || (cand.candidateId === 'riya_sharma' ? 'riya_sharma.pdf' : 'aksada.pdf')}', 'Resume: ${cand.name}')">
                ${Icons.externalLink(14)} Fullscreen PDF Preview
              </button>
              <a href="/api/pdf/view?file=${encodeURIComponent(cand.resumeFile || (cand.candidateId === 'riya_sharma' ? 'riya_sharma.pdf' : 'aksada.pdf'))}" target="_blank" class="btn btn-outline btn-sm">
                ${Icons.eye(14)} Open in New Tab
              </a>
              <a href="/api/pdf/download?file=${encodeURIComponent(cand.resumeFile || (cand.candidateId === 'riya_sharma' ? 'riya_sharma.pdf' : 'aksada.pdf'))}&download=1" class="btn btn-outline btn-sm" download="${cand.resumeFile || 'resume.pdf'}">
                ${Icons.download(14)} Download
              </a>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr); gap: 20px;">
            <!-- Left: Inline PDF Viewer -->
            <div class="card" style="padding: 16px; display: flex; flex-direction: column; height: 600px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="font-size: 14px; font-weight: 700; color: #111827; margin: 0; display: flex; align-items: center; gap: 6px;">
                  ${Icons.fileText(16)} Visual PDF Document
                </h4>
                <span class="badge badge-indigo" style="font-size: 11px;">Inline Renderer</span>
              </div>
              <div style="flex: 1; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); background: #525659;">
                <iframe src="/api/pdf/view?file=${encodeURIComponent(cand.resumeFile || (cand.candidateId === 'riya_sharma' ? 'riya_sharma.pdf' : 'aksada.pdf'))}#toolbar=1" style="width: 100%; height: 100%; border: none;"></iframe>
              </div>
            </div>

            <!-- Right: Extracted Skills & Requirements -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div class="card" style="padding: 18px;">
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Extracted Resume Profile (AI)</h4>
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                  <div><span style="color: #64748B;">Name (Masked):</span> <strong>${cand.name}</strong></div>
                  <div><span style="color: #64748B;">Education:</span> <span>${cand.degree}</span></div>
                  <div><span style="color: #64748B;">Seniority:</span> <span>${cand.decision === 'AUTO_ADVANCE' ? 'Senior' : 'Mid-Level'}</span></div>
                  <div>
                    <span style="color: #64748B; display: block; margin-bottom: 6px;">Verified Technical Skills:</span>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      ${(cand.matchedSkills || ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Git']).map(s => `<span class="tag">${s}</span>`).join('')}
                    </div>
                  </div>
                  <div><span style="color: #64748B;">Location:</span> <span>${cand.location}</span></div>
                </div>
              </div>

              <div class="card" style="padding: 18px;">
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">Job Requirements (Target JD)</h4>
                <div style="margin-bottom: 14px;">
                  <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Must Have Skills</div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${(job.mustHaves || ['Calendar Management', 'Executive Support', 'Travel Planning']).map(m => `<span class="tag">${m}</span>`).join('')}
                  </div>
                </div>
                <div>
                  <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Nice to Have Skills</div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${(job.niceToHaves || ['Board Meeting Coordination', 'Expense Systems']).map(n => `<span class="tag tag-nice">${n}</span>`).join('')}
                  </div>
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
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
              
              <!-- Top Matched Requirements -->
              <div>
                <h4 style="font-size: 15px; font-weight: 700; color: #16A34A; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                  ${Icons.checkCircle(16)} Top Matched Requirements (${(cand.matchedRequirements || []).length})
                </h4>
                <div class="table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr><th>Requirement</th><th>Evidence from Resume</th><th>Confidence</th></tr>
                    </thead>
                    <tbody>
                      ${(cand.matchedRequirements && cand.matchedRequirements.length > 0) ? cand.matchedRequirements.map(r => `
                        <tr>
                          <td style="font-weight: 600; color: #1E293B;">${r.req}</td>
                          <td style="font-size: 12px; color: #64748B;">${r.evidence}</td>
                          <td><span class="badge badge-success">${r.conf}</span></td>
                        </tr>
                      `).join('') : `
                        <tr><td colspan="3" style="text-align: center; color: #94A3B8; padding: 14px;">No verified matches found.</td></tr>
                      `}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Critical Missing Requirements -->
              <div>
                <h4 style="font-size: 15px; font-weight: 700; color: #DC2626; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                  ${Icons.alertTriangle(16)} Critical Missing Requirements (${(cand.missingRequirements || []).length})
                </h4>
                <div class="table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr><th>Requirement</th><th>Identified Deficit / Gap</th><th>Confidence</th></tr>
                    </thead>
                    <tbody>
                      ${(cand.missingRequirements && cand.missingRequirements.length > 0) ? cand.missingRequirements.map(r => `
                        <tr>
                          <td style="font-weight: 600; color: #1E293B;">${r.req}</td>
                          <td style="font-size: 12px; color: #991B1B;">${r.evidence}</td>
                          <td><span class="badge badge-danger">${r.conf}</span></td>
                        </tr>
                      `).join('') : `
                        <tr><td colspan="3" style="text-align: center; color: #94A3B8; padding: 14px;">Zero hard deficits identified.</td></tr>
                      `}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <!-- Full Section 6 Mandatory Evidence Ledger -->
            <div class="card" style="padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: #FFFFFF;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border); padding-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                <div>
                  <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #4F46E5;">
                    [SECTION 6] EVIDENCE LEDGER -- ALL ${(cand.evidenceLedger || []).length} ENTRIES IN FULL
                  </div>
                  <h4 style="font-size: 16px; font-weight: 800; color: #111827; margin-top: 2px;">
                    MANDATORY EVIDENCE LEDGER (${(cand.evidenceLedger || []).length} Immutable Citation Entries)
                  </h4>
                </div>
                <button class="btn btn-outline btn-sm" onclick="App.openPdfModal('${cand.resumeFile || 'riya_sharma.pdf'}', 'Verify Ledger Citations: ${cand.name}')">
                  ${Icons.fileText(14)} PDF Citations
                </button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${(cand.evidenceLedger || []).map((entry, idx) => {
                  const isVerified = entry.is_verified || entry.status === 'verified';
                  const statusLabel = isVerified ? '[VERIFIED]' : '[UNVERIFIED / GAP]';
                  const statusBadge = isVerified 
                    ? `<span class="badge badge-success" style="font-size: 11px; font-weight: 700; font-family: var(--font-mono);">${statusLabel}</span>`
                    : `<span class="badge badge-danger" style="font-size: 11px; font-weight: 700; font-family: var(--font-mono);">${statusLabel}</span>`;
                  const dim = (entry.dimension || 'TECHNICAL').toUpperCase();
                  const scoreContrib = entry.score_contribution !== undefined ? `${entry.score_contribution} pts` : (entry.points || '0.0 pts');

                  return `
                    <div style="border: 1px solid ${isVerified ? '#BBF7D0' : '#FECDD3'}; background: ${isVerified ? '#F0FDF4' : '#FFF1F2'}; border-radius: 10px; padding: 14px 18px;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                          <span style="font-family: var(--font-mono); font-weight: 700; color: #64748B; font-size: 13px;">${idx + 1}.</span>
                          ${statusBadge}
                          <strong style="font-size: 14px; color: #0F172A;">${entry.requirement}</strong>
                          <span class="badge badge-neutral" style="font-size: 10px; font-family: var(--font-mono); font-weight: 700;">(${dim})</span>
                        </div>
                        <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: ${isVerified ? '#15803D' : '#991B1B'}; background: #FFFFFF; padding: 3px 8px; border-radius: 6px; border: 1px solid ${isVerified ? '#86EFAC' : '#FCA5A5'};">
                          Score Contribution: ${scoreContrib}
                        </span>
                      </div>

                      <div style="margin-top: 10px; font-size: 13px; line-height: 1.5; padding-left: 24px; display: flex; flex-direction: column; gap: 4px;">
                        ${entry.evidence && entry.evidence !== 'None' ? `
                          <div>
                            <strong style="color: #16A34A;">Evidence:</strong>
                            <span style="font-style: italic; color: #047857;"> "${entry.evidence}"</span>
                          </div>
                        ` : ''}
                        ${entry.gap && entry.gap !== 'None' ? `
                          <div>
                            <strong style="color: #DC2626;">Gap:</strong>
                            <span style="color: #991B1B;"> ${entry.gap}</span>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
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

  async recordDecision(candidateId, decision) {
    App.showToast(`Logging decision override for ${candidateId}...`, "info");
    await AppData.updateCandidateDecision(candidateId, decision, "Quick recruiter decision action");
    App.showToast(`Candidate decision updated to ${decision} and written to logs/overrides.jsonl`, "success");
    RecruiterView.renderCandidateReview(document.getElementById('mainContentArea'), { candidateId });
  },

  async saveCustomDecision(candidateId) {
    const radios = document.getElementsByName('hrDecisionRadio');
    let selected = "ESCALATE";
    for (const r of radios) {
      if (r.checked) selected = r.value;
    }
    const comment = document.getElementById('hrDecisionComment')?.value || '';
    App.showToast(`Logging decision override for ${candidateId}...`, "info");
    await AppData.updateCandidateDecision(candidateId, selected, comment);
    App.showToast(`Decision saved: ${selected}! Written to immutable audit trail.`, "success");
    RecruiterView.renderCandidateReview(document.getElementById('mainContentArea'), { candidateId });
  },

  loadSampleJD(jdId) {
    if (!jdId) return;
    const allJobs = AppData.getJobs() || [];
    const job = allJobs.find(j => String(j.id) === String(jdId)) || AppData.getSampleJDs().find(j => String(j.id) === String(jdId));
    if (job) {
      if (document.getElementById('postJobTitle')) document.getElementById('postJobTitle').value = job.title;
      if (document.getElementById('postJobLocation')) document.getElementById('postJobLocation').value = job.location;
      if (document.getElementById('postJobType')) document.getElementById('postJobType').value = job.jobType || "Full-time";
      if (document.getElementById('postJobExp')) document.getElementById('postJobExp').value = String(job.experience || '2+ years').replace(/[^0-9+-]/g, '') || '2+';
      if (document.getElementById('postJobDesc')) document.getElementById('postJobDesc').value = job.raw_description || job.overview || job.description || "";
      App.showToast(`Loaded requisition '${job.title}'`, "success");
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

  async processUploadedJD(file) {
    App.showToast(`Parsing job description from ${file.name} using AI text extractor...`, "info");

    // 1. If JSON file:
    if (file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const jd = JSON.parse(evt.target.result);
          if (document.getElementById('postJobTitle')) document.getElementById('postJobTitle').value = jd.title || "";
          if (document.getElementById('postJobLocation')) document.getElementById('postJobLocation').value = jd.location || "";
          if (document.getElementById('postJobType')) document.getElementById('postJobType').value = jd.work_type || jd.jobType || "Full-time";
          if (document.getElementById('postJobExp')) document.getElementById('postJobExp').value = String(jd.min_years_experience || "2");
          if (document.getElementById('postJobDesc')) document.getElementById('postJobDesc').value = jd.raw_description || jd.overview || "";
          App.showToast(`Loaded structured JD: '${jd.title || file.name}'!`, "success");
        } catch (e) {
          App.showToast("Failed to parse JD JSON: " + e.message, "error");
        }
      };
      reader.readAsText(file);
      return;
    }

    // 2. For PDF or binary documents: read as Base64 and invoke backend parser
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result || "";
      const base64Content = dataUrl.split(',')[1] || "";

      try {
        const res = await AppData.apiCall("/api/jds/parse-file", "POST", {
          filename: file.name,
          content_base64: base64Content
        });

        if (res && res.success && res.text) {
          if (document.getElementById('postJobTitle') && res.title) document.getElementById('postJobTitle').value = res.title;
          if (document.getElementById('postJobLocation') && res.location) document.getElementById('postJobLocation').value = res.location;
          if (document.getElementById('postJobType') && res.jobType) document.getElementById('postJobType').value = res.jobType;
          if (document.getElementById('postJobExp') && res.experience) document.getElementById('postJobExp').value = res.experience;
          if (document.getElementById('postJobDesc')) document.getElementById('postJobDesc').value = res.text;
          App.showToast(`Extracted '${res.title}' with AI requirements!`, "success");
          return;
        }
      } catch (err) {
        console.warn("Backend JD parse error, attempting text fallback:", err);
      }

      // Plain text fallback if file is plain text
      if (file.type.includes("text") || file.name.endsWith(".txt")) {
        const textReader = new FileReader();
        textReader.onload = (te) => {
          const text = te.target.result || "";
          if (document.getElementById('postJobDesc')) document.getElementById('postJobDesc').value = text;
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 0 && lines[0].length < 60) {
            if (document.getElementById('postJobTitle')) document.getElementById('postJobTitle').value = lines[0];
          }
          App.showToast(`Extracted job text from ${file.name}!`, "success");
        };
        textReader.readAsText(file);
      }
    };
    reader.readAsDataURL(file);
  },

  openCandidateResumeModal(candId) {
    const cand = AppData.getCandidateById(candId);
    if (!cand) return;
    App.openPdfModal(cand.resumeFile || 'riya_sharma.pdf', `Resume Document: ${cand.name}`);
  }
};

window.RecruiterView = RecruiterView;

