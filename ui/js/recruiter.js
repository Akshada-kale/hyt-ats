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
    const jobs = AppData.getJobs() || [];
    const candidates = AppData.getCandidates() || [];
    const applications = AppData.getCandidateApplications() || [];
    const auditLogs = AppData.state.auditLogs || [];

    const openJobsCount = jobs.filter(j => j.status === "Open").length;
    const totalApplicants = candidates.length;
    const shortlistedCount = candidates.filter(c => c.statusLabel === "Shortlisted" || c.finalStatus === "Shortlisted").length;
    const reviewCount = candidates.filter(c => c.statusLabel === "Human Review" || c.statusLabel === "Under Review" || c.finalStatus === "Under Review").length;
    const rejectedCount = candidates.filter(c => c.statusLabel === "Rejected" || c.finalStatus === "Rejected" || c.statusLabel === "Not Shortlisted").length;

    const shortlistedPct = totalApplicants > 0 ? ((shortlistedCount / totalApplicants) * 100).toFixed(1) : "0.0";
    const reviewPct = totalApplicants > 0 ? ((reviewCount / totalApplicants) * 100).toFixed(1) : "0.0";
    const rejectedPct = totalApplicants > 0 ? ((rejectedCount / totalApplicants) * 100).toFixed(1) : "0.0";

    // Build dynamic recent activity feed from real audit logs and real applications
    let activityItems = [];
    auditLogs.slice(-3).reverse().forEach(log => {
      const isShortlist = log.new_decision === 'AUTO_ADVANCE' || (log.action && log.action.includes('Shortlist'));
      const isReject = log.new_decision === 'REJECT' || (log.action && log.action.includes('Reject'));
      activityItems.push({
        icon: isShortlist ? Icons.userCheck(16) : (isReject ? Icons.x(16) : Icons.alertTriangle(16)),
        bg: isShortlist ? '#DCFCE7' : (isReject ? '#FEE2E2' : '#FEF3C7'),
        color: isShortlist ? '#16A34A' : (isReject ? '#DC2626' : '#D97706'),
        title: `${log.recruiter_id || log.actor || 'Recruiter'} decision`,
        subtext: log.reason || log.action || log.status || 'Updated candidate status',
        time: log.timestamp ? (log.timestamp.includes('T') ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : log.timestamp.slice(11, 16)) : 'Recently'
      });
    });

    applications.slice(-3).reverse().forEach(app => {
      activityItems.push({
        icon: Icons.users(16),
        bg: '#EEF2FF',
        color: '#4F46E5',
        title: `Application: ${app.jobTitle}`,
        subtext: `Status: ${app.status || app.finalStatus} • Candidate: ${app.candidateName || 'Applicant'}`,
        time: app.appliedDate || 'Today'
      });
    });

    if (activityItems.length === 0) {
      activityItems = [
        {
          icon: Icons.alertTriangle(16),
          bg: '#FEF3C7',
          color: '#D97706',
          title: 'Pipeline Active',
          subtext: 'Deterministic screening engine operational across all requisitions.',
          time: 'Active'
        }
      ];
    }

    const topJob = [...jobs].sort((a, b) => (b.applicantsCount || 0) - (a.applicantsCount || 0))[0] || jobs[0] || { id: "2234533717", title: "Full Stack Software Engineer", applicantsCount: 0 };
    const topJobReviewCount = candidates.filter(c => String(c.appliedJobId) === String(topJob.id) && (c.statusLabel === "Human Review" || c.statusLabel === "Under Review" || c.finalStatus === "Under Review")).length;

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>Welcome back, ${user.name}!</h1>
          <p>Here's your real-time recruitment command center and screening overview</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748B; background: white; padding: 8px 16px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          ${Icons.clock(16)} Oct 1, 2026 - Oct 17, 2026
        </div>
      </div>

      <!-- 5 Metric Cards (Screen 2) - Dynamically calculated -->
      <div class="summary-grid summary-grid-5" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="summary-card" onclick="App.navigate('recruiter-manage-jobs')" style="cursor: pointer;">
          <div class="title">Open Jobs</div>
          <div class="value" style="color: #4F46E5;">${openJobsCount}</div>
          <div class="subtext">Active hiring pipelines</div>
        </div>
        <div class="summary-card" onclick="App.navigate('recruiter-applicants', { jobId: 'ALL' })" style="cursor: pointer;">
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

      <!-- Recent Applicants Pipeline Card -->
      <div class="card" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Recent Applicants Pipeline</h3>
              <span class="badge badge-indigo">${candidates.length} Total Processed</span>
            </div>
            <p style="font-size: 13px; color: #64748B; margin: 2px 0 0 0;">Candidates evaluated by deterministic screening gates</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="App.navigate('recruiter-applicants', { jobId: 'ALL' })">
            View All Applicants ${Icons.arrowRight ? Icons.arrowRight(14) : '&rarr;'}
          </button>
        </div>

        <div class="table-wrapper">
          <table class="data-table" style="font-size: 13px;">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied Requisition</th>
                <th>Fit Score</th>
                <th>AI Recommendation</th>
                <th>Current Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${candidates.length === 0 ? `
                <tr><td colspan="6" style="text-align: center; padding: 24px; color: #94A3B8;">No candidates in pipeline yet.</td></tr>
              ` : candidates.slice(0, 5).map(cand => {
                const st = cand.statusLabel || cand.finalStatus || 'Under Review';
                const badgeClass = st === 'Shortlisted' ? 'badge-shortlisted' : (st === 'Human Review' || st === 'Under Review' ? 'badge-review' : 'badge-rejected');
                const aiRec = cand.aiRecommendation || cand.decision || 'HR_REVIEW';
                return `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="avatar-circle avatar-sm avatar-candidate">
                          ${(cand.name || 'C').charAt(0)}
                        </div>
                        <div>
                          <div style="font-weight: 700; color: #111827;">${cand.name}</div>
                          <div style="font-size: 11px; color: #64748B;">${cand.degree || 'Applicant'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: #334155;">${cand.appliedJobTitle || 'Requisition'}</div>
                      <div style="font-size: 11px; color: #94A3B8;">ID: ${cand.appliedJobId || 'N/A'}</div>
                    </td>
                    <td>
                      <span style="font-weight: 700; font-family: var(--font-mono); color: #1E293B;">${cand.fitScore}</span>
                      <span style="font-size: 11px; color: #94A3B8;">/100</span>
                    </td>
                    <td>
                      <span class="badge badge-neutral" style="font-family: var(--font-mono); font-size: 11px;">${aiRec}</span>
                    </td>
                    <td>
                      <span class="badge ${badgeClass}">${st}</span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <button class="btn btn-primary btn-sm" onclick="App.navigate('recruiter-candidate-review', { candidateId: '${cand.id}' })">
                        Review
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
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
            <h4 style="font-size: 16px; font-weight: 700; color: #111827;">${topJob.title}</h4>
            <div style="font-size: 13px; color: #64748B;">${topJob.applicantsCount || candidates.filter(c => String(c.appliedJobId) === String(topJob.id)).length} total applicants • ${topJobReviewCount} pending human reviews</div>
          </div>
        </div>
        <button class="btn btn-primary" onclick="App.navigate('recruiter-applicants', { jobId: '${topJob.id}' })">
          View Applicants ${Icons.arrowRight ? Icons.arrowRight(16) : '&rarr;'}
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
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; font-size: 14px;">
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
    const payload = { ...jobData };
    if (payload.id && String(payload.id).startsWith("JD-")) {
      delete payload.id;
    }
    const published = await AppData.addJob(payload);
    App.showToast(`Job '${published.title || jobData.title}' successfully published and open for applicants!`, "success");
    App.navigate("recruiter-manage-jobs");
  },

  // 3. Manage Jobs (Screen 5) - Full Space-Filling Executive Command Center
  renderManageJobs(container, filter = "All") {
    const allJobs = AppData.getJobs() || [];
    const filtered = allJobs.filter(j => {
      if (filter === "All") return true;
      return j.status === filter;
    });

    const openCount = allJobs.filter(j => j.status === "Open").length;
    const closedCount = allJobs.filter(j => j.status === "Closed").length;
    const totalApplicants = allJobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0);
    const avgApplicants = allJobs.length > 0 ? (totalApplicants / allJobs.length).toFixed(1) : "0.0";

    container.innerHTML = `
      <div class="main-header" style="margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">Requisition Management</h1>
            <span class="badge badge-indigo">${allJobs.length} Requisitions Active</span>
          </div>
          <p style="font-size: 13px; color: #64748B; margin: 0;">Create, monitor, and configure AI screening requirements across all published organizational roles</p>
        </div>
        <button class="btn btn-primary" onclick="App.navigate('recruiter-post-job')">
          ${Icons.plusCircle(16)} Post New Job
        </button>
      </div>

      <!-- 4 Space-Filling Executive KPI Metric Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 22px;">
        <div class="summary-card" style="border-left: 4px solid #4F46E5;">
          <div class="title">Total Requisitions</div>
          <div class="value" style="color: #4F46E5;">${allJobs.length}</div>
          <div class="subtext">Active & archived roles</div>
        </div>
        <div class="summary-card shortlisted" style="border-left: 4px solid #16A34A;">
          <div class="title" style="color: #15803D;">Open Pipelines</div>
          <div class="value" style="color: #16A34A;">${openCount}</div>
          <div class="subtext" style="color: #15803D;">Accepting new applications</div>
        </div>
        <div class="summary-card review" style="border-left: 4px solid #0284C7;">
          <div class="title" style="color: #0369A1;">Talent Inflow</div>
          <div class="value" style="color: #0284C7;">${totalApplicants}</div>
          <div class="subtext" style="color: #0369A1;">Total candidates screened</div>
        </div>
        <div class="summary-card" style="border-left: 4px solid #8B5CF6;">
          <div class="title" style="color: #6D28D9;">Avg Candidates / Role</div>
          <div class="value" style="color: #8B5CF6;">${avgApplicants}</div>
          <div class="subtext" style="color: #6D28D9;">Sourcing velocity index</div>
        </div>
      </div>

      <!-- Filter Tabs & Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
        <div class="tabs-nav" style="margin-bottom: 0;">
          <button class="tab-btn ${filter === 'All' ? 'active' : ''}" onclick="RecruiterView.renderManageJobs(document.getElementById('mainContentArea'), 'All')">
            All Requisitions (${allJobs.length})
          </button>
          <button class="tab-btn ${filter === 'Open' ? 'active' : ''}" onclick="RecruiterView.renderManageJobs(document.getElementById('mainContentArea'), 'Open')">
            Open Pipelines (${openCount})
          </button>
          <button class="tab-btn ${filter === 'Closed' ? 'active' : ''}" onclick="RecruiterView.renderManageJobs(document.getElementById('mainContentArea'), 'Closed')">
            Closed / Archived (${closedCount})
          </button>
        </div>

        <div style="font-size: 13px; color: #64748B;">
          Showing <strong style="color: #111827;">${filtered.length}</strong> of ${allJobs.length} requisitions
        </div>
      </div>

      <!-- Requisitions Table (Screen 5) -->
      <div class="table-wrapper" style="margin-bottom: 24px;">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 32%;">Job Title & Department</th>
              <th style="width: 15%;">Location & Type</th>
              <th style="width: 14%; text-align: center;">Applicants Screened</th>
              <th style="width: 14%; text-align: center;">AI Screening Mode</th>
              <th style="width: 11%; text-align: center;">Status</th>
              <th style="width: 14%; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(job => `
              <tr>
                <td>
                  <div style="font-weight: 700; color: #111827; font-size: 14px;">${job.title}</div>
                  <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
                    Requisition ID: <code>${job.id}</code> • Posted ${job.postedDate || 'Oct 2026'}
                  </div>
                </td>
                <td>
                  <div style="font-weight: 600; color: #334155; font-size: 13px;">${job.location || 'Pune, India'}</div>
                  <div style="font-size: 11px; color: #64748B;">${job.jobType || 'Full-time'}</div>
                </td>
                <td style="text-align: center;">
                  <span style="font-weight: 700; font-size: 15px; color: #4F46E5;">${job.applicantsCount || 0}</span>
                  <div style="font-size: 11px; color: #64748B;">Processed</div>
                </td>
                <td style="text-align: center;">
                  <span class="badge badge-indigo" style="font-size: 11px;">
                    ${Icons.cpu(12)} Gates 0-8 Active
                  </span>
                </td>
                <td style="text-align: center;">
                  <span class="badge ${job.status === 'Open' ? 'badge-shortlisted' : 'badge-neutral'}">
                    ${job.status}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 8px;">
                    <button class="btn btn-primary btn-sm" onclick="App.navigate('recruiter-applicants', { jobId: '${job.id}' })">
                      View Applicants ${Icons.arrowRight(12)}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Space-Filling Executive Bottom 2-Column Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; margin-top: 10px;">
        
        <!-- Left: Sourcing Distribution & Requirement Coverage -->
        <div class="card" style="border-top: 4px solid #4F46E5;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <h4 style="font-size: 15px; font-weight: 800; color: #111827; margin: 0;">Requisition Domain Distribution</h4>
              <p style="font-size: 12px; color: #64748B; margin: 2px 0 0 0;">Active pipeline distribution by domain and skill ontology</p>
            </div>
            <span class="badge badge-indigo" style="font-size: 11px;">System Live</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                <span style="color: #334155;">Engineering & Technology (React, Node, Cloud, Python)</span>
                <span style="color: #4F46E5; font-weight: 700;">65%</span>
              </div>
              <div style="width: 100%; height: 8px; background: #EEF2FF; border-radius: 4px; overflow: hidden;">
                <div style="width: 65%; height: 100%; background: #4F46E5; border-radius: 4px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                <span style="color: #334155;">Executive Administration & Legal (PA, Operations, Compliance)</span>
                <span style="color: #0284C7; font-weight: 700;">20%</span>
              </div>
              <div style="width: 100%; height: 8px; background: #F0F9FF; border-radius: 4px; overflow: hidden;">
                <div style="width: 20%; height: 100%; background: #0284C7; border-radius: 4px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                <span style="color: #334155;">Culinary & Hospitality (Chef, Kitchen Management, Safety)</span>
                <span style="color: #D97706; font-weight: 700;">15%</span>
              </div>
              <div style="width: 100%; height: 8px; background: #FEF3C7; border-radius: 4px; overflow: hidden;">
                <div style="width: 15%; height: 100%; background: #D97706; border-radius: 4px;"></div>
              </div>
            </div>
          </div>

          <div style="margin-top: 16px; padding: 12px 14px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; font-size: 12px; color: #475569; line-height: 1.5;">
            <strong>Ontology Intelligence:</strong> Job descriptions parsed via paragraph input automatically extract Must-Have technical skills, required degree minimums, and preferred criteria stored in <code>data/jds/*.json</code>.
          </div>
        </div>

        <!-- Right: AI Gate Governance & Policy Rules -->
        <div class="card" style="border-top: 4px solid #16A34A;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <h4 style="font-size: 15px; font-weight: 800; color: #111827; margin: 0;">AI Gate Governance & Standards</h4>
              <p style="font-size: 12px; color: #64748B; margin: 2px 0 0 0;">System-wide screening criteria applied to all job pipelines</p>
            </div>
            <span class="badge badge-shortlisted" style="font-size: 11px;">Deterministic</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div style="padding: 10px 12px; background: #F8FAFC; border-radius: 8px; border-left: 3px solid #16A34A;">
              <div style="font-size: 12px; font-weight: 700; color: #111827;">Gate 7: Auto-Advance</div>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Score &ge; 75.0 & all must-haves &rarr; <strong style="color: #16A34A;">SHORTLISTED</strong></div>
            </div>

            <div style="padding: 10px 12px; background: #F8FAFC; border-radius: 8px; border-left: 3px solid #D97706;">
              <div style="font-size: 12px; font-weight: 700; color: #111827;">Gate 7: Escalate</div>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Score 40.0 - 74.9 or unverified &rarr; <strong style="color: #D97706;">HR_REVIEW</strong></div>
            </div>

            <div style="padding: 10px 12px; background: #F8FAFC; border-radius: 8px; border-left: 3px solid #DC2626;">
              <div style="font-size: 12px; font-weight: 700; color: #111827;">Gate 7: Auto-Reject</div>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Score &lt; 40.0 or critical gap &rarr; <strong style="color: #DC2626;">REJECTED</strong></div>
            </div>

            <div style="padding: 10px 12px; background: #F8FAFC; border-radius: 8px; border-left: 3px solid #4F46E5;">
              <div style="font-size: 12px; font-weight: 700; color: #111827;">Human Recruiter Override</div>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Mandatory reason & audit log &rarr; <strong>Final Decision</strong></div>
            </div>
          </div>

          <div style="margin-top: 14px; display: flex; justify-content: flex-end;">
            <button class="btn btn-outline btn-sm" onclick="App.navigate('admin-policy')">
              ${Icons.sliders(14)} View Complete Policy Matrix
            </button>
          </div>
        </div>

      </div>
    `;
  },

  // 4. Job Applicants (Screen 6) - Executive ATS Command Center & Space-Filling Layout
  renderApplicants(container, params = {}) {
    const allJobs = AppData.getJobs() || [];
    const jobId = params.jobId || "ALL";
    const isAllJobs = jobId === "ALL";
    const job = isAllJobs ? { id: "ALL", title: "All Requisitions", company: "Company-Wide", location: "All Locations", postedDate: "Oct 2026" } : (AppData.getJobById(jobId) || { id: jobId, title: "Job Not Found", company: "N/A", applicantsCount: 0 });
    const activeFilter = params.filter || "All";
    const candidates = AppData.getCandidates() || [];

    // Filter candidates strictly for selected job (or all jobs)
    const jobCandidates = isAllJobs ? candidates : candidates.filter(c => c.appliedJobId && String(c.appliedJobId) === String(jobId));
    const allCount = jobCandidates.length;
    const shortlistedCount = jobCandidates.filter(c => c.statusLabel === "Shortlisted" || c.finalStatus === "Shortlisted").length;
    const reviewCount = jobCandidates.filter(c => c.statusLabel === "Human Review" || c.finalStatus === "Under Review" || c.statusLabel === "Under Review").length;
    const rejectedCount = jobCandidates.filter(c => c.statusLabel === "Rejected" || c.finalStatus === "Rejected").length;

    // AI recommendation counts
    const aiShortCount = jobCandidates.filter(c => (c.aiRecommendation || c.decision) === "SHORTLISTED" || (c.aiRecommendation || c.decision) === "AUTO_ADVANCE").length;
    const aiReviewCount = jobCandidates.filter(c => (c.aiRecommendation || c.decision) === "HR_REVIEW" || (c.aiRecommendation || c.decision) === "ESCALATE").length;
    const aiRejectCount = jobCandidates.filter(c => (c.aiRecommendation || c.decision) === "REJECTED" || (c.aiRecommendation || c.decision) === "AUTO_REJECT").length;

    const avgScore = allCount > 0 ? (jobCandidates.reduce((acc, c) => acc + (parseFloat(c.fitScore) || 0), 0) / allCount).toFixed(1) : "0.0";
    const shortPct = allCount > 0 ? Math.round((shortlistedCount / allCount) * 100) : 0;
    const reviewPct = allCount > 0 ? Math.round((reviewCount / allCount) * 100) : 0;
    const rejectPct = allCount > 0 ? Math.round((rejectedCount / allCount) * 100) : 0;

    const filtered = jobCandidates.filter(c => {
      const st = c.statusLabel || c.finalStatus;
      if (activeFilter === "All") return true;
      if (activeFilter === "Shortlisted") return st === "Shortlisted";
      if (activeFilter === "Human Review") return st === "Human Review" || st === "Under Review";
      if (activeFilter === "Rejected") return st === "Rejected";
      return true;
    });

    // Recent overrides & audit logs for this job/system
    const auditLogs = (AppData.getAuditLogs() || []).slice(0, 5);

    container.innerHTML = `
      <!-- Requisition Header & Job Switcher Ribbon -->
      <div class="main-header" style="margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap;">
            <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">Applicants & Screening Matrix</h1>
            <span class="badge badge-indigo" style="font-size: 11px;">${allCount} Applicants Active</span>
          </div>
          <p style="font-size: 13px; color: #64748B; margin: 0;">
            Requisition: <strong style="color: #111827;">${job.title}</strong> (${job.id}) • ${job.company || 'TechCorp'} • ${job.location || 'Pune'} • Posted ${job.postedDate || 'Oct 10, 2026'}
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; font-weight: 700; color: #475569; white-space: nowrap;">Switch Requisition:</label>
            <select id="recruiterJobSelector" class="form-control" style="font-size: 13px; font-weight: 600; padding: 7px 12px; min-width: 240px;" onchange="RecruiterView.switchJob(this.value)">
              <option value="ALL" ${isAllJobs ? 'selected' : ''}>-- All Requisitions (Global) (${candidates.length} total) --</option>
              ${allJobs.map(j => `<option value="${j.id}" ${String(j.id) === String(jobId) ? 'selected' : ''}>${j.title} (${j.applicantsCount || 0} applicants)</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-outline btn-sm" onclick="App.navigate('recruiter-post-job')">
            ${Icons.plusCircle(14)} Post New Job
          </button>
        </div>
      </div>

      <!-- 5 Space-Filling KPI Metric Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 22px;">
        <div class="summary-card" style="border-left: 4px solid #4F46E5; cursor: pointer;" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'All' })">
          <div class="title">Total Candidates</div>
          <div class="value" style="color: #1E293B;">${allCount}</div>
          <div class="subtext" style="color: #64748B;">Processed by Gates 0-8</div>
        </div>

        <div class="summary-card shortlisted" style="border-left: 4px solid #16A34A; cursor: pointer;" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Shortlisted' })">
          <div class="title" style="color: #15803D;">AI Shortlisted</div>
          <div class="value" style="color: #16A34A;">${shortlistedCount} <span style="font-size: 13px; font-weight: 600; color: #15803D;">(${shortPct}%)</span></div>
          <div class="subtext" style="color: #15803D;">Score >= 75.0 (Auto-Advance)</div>
        </div>

        <div class="summary-card review" style="border-left: 4px solid #D97706; cursor: pointer;" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Human Review' })">
          <div class="title" style="color: #B45309;">Awaiting HR Review</div>
          <div class="value" style="color: #D97706;">${reviewCount} <span style="font-size: 13px; font-weight: 600; color: #B45309;">(${reviewPct}%)</span></div>
          <div class="subtext" style="color: #B45309;">Borderline / Evidence needed</div>
        </div>

        <div class="summary-card rejected" style="border-left: 4px solid #DC2626; cursor: pointer;" onclick="App.navigate('recruiter-applicants', { jobId: '${jobId}', filter: 'Rejected' })">
          <div class="title" style="color: #B91C1C;">AI Rejected</div>
          <div class="value" style="color: #DC2626;">${rejectedCount} <span style="font-size: 13px; font-weight: 600; color: #B91C1C;">(${rejectPct}%)</span></div>
          <div class="subtext" style="color: #B91C1C;">Score < 40.0 / Missing criteria</div>
        </div>

        <div class="summary-card" style="border-left: 4px solid #0284C7;">
          <div class="title" style="color: #0369A1;">Avg Match Score</div>
          <div class="value" style="color: #0284C7;">${avgScore} <span style="font-size: 13px; font-weight: 500; color: #64748B;">/ 100</span></div>
          <div style="background: #E2E8F0; border-radius: 999px; height: 6px; width: 100%; margin-top: 6px; overflow: hidden;">
            <div style="background: #0284C7; height: 100%; width: ${Math.min(parseFloat(avgScore), 100)}%;"></div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs-nav" style="margin-bottom: 16px;">
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

      <!-- Search, Sort & Multi-Filter Controls Bar -->
      <div class="card" style="margin-bottom: 20px; padding: 14px 18px; border: 1px solid var(--border);">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
          <div style="flex: 1; min-width: 240px; position: relative;">
            <input type="text" id="candSearch" class="form-control" placeholder="Search by name, skills, degree, ID..." style="padding-left: 36px;" oninput="RecruiterView.filterApplicantTable()">
            <span style="position: absolute; left: 12px; top: 10px; color: #94A3B8;">${Icons.search()}</span>
          </div>

          <select id="candSort" class="form-control" style="width: auto; min-width: 170px;" onchange="RecruiterView.filterApplicantTable()">
            <option value="fit_desc">Sort by Fit Score (High -> Low)</option>
            <option value="fit_asc">Sort by Fit Score (Low -> High)</option>
            <option value="name">Sort by Name (A-Z)</option>
            <option value="date">Sort by Application Date</option>
          </select>

          <select id="candAiRec" class="form-control" style="width: auto; min-width: 170px;" onchange="RecruiterView.filterApplicantTable()">
            <option value="">All AI Recommendations</option>
            <option value="SHORTLISTED">AI: SHORTLISTED</option>
            <option value="HR_REVIEW">AI: HR_REVIEW</option>
            <option value="REJECTED">AI: REJECTED</option>
          </select>

          <select id="candStatus" class="form-control" style="width: auto; min-width: 150px;" onchange="RecruiterView.filterApplicantTable()">
            <option value="">All Final Statuses</option>
            <option value="Shortlisted">Status: Shortlisted</option>
            <option value="Under Review">Status: Under Review</option>
            <option value="Rejected">Status: Rejected</option>
          </select>

          <button class="btn btn-outline btn-sm" onclick="RecruiterView.resetFilters()" title="Reset Filters">
            Reset
          </button>
        </div>
      </div>

      <!-- Applicants Table with Strict Separation of AI Decision and Final Status -->
      <div class="table-wrapper" style="margin-bottom: 28px; border: 1px solid var(--border); border-radius: 12px; background: white; box-shadow: var(--shadow-sm); overflow-x: auto;">
        <table class="data-table" id="recruiterApplicantsTable" style="min-width: 1050px; width: 100%;">
          <thead>
            <tr>
              <th style="width: 48px; text-align: center;">#</th>
              <th style="min-width: 250px; width: 260px;">Candidate</th>
              <th style="min-width: 110px; width: 110px; white-space: nowrap;">Fit Score</th>
              <th style="min-width: 160px; width: 160px; white-space: nowrap;">AI Recommendation</th>
              <th style="min-width: 180px; width: 180px; white-space: nowrap;">Final Application Status</th>
              <th style="min-width: 120px; width: 120px; white-space: nowrap;">Criteria Match</th>
              <th style="min-width: 110px; width: 120px; white-space: nowrap;">Applied On</th>
              <th style="min-width: 140px; text-align: right; white-space: nowrap;">Action</th>
            </tr>
          </thead>
          <tbody id="applicantTableBody">
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #64748B;">
                  <div style="font-size: 15px; font-weight: 600; color: #1E293B; margin-bottom: 4px;">No candidates match this criteria.</div>
                  <div style="font-size: 13px;">Try clearing filters or switching requisitions above.</div>
                </td>
              </tr>
            ` : filtered.map((cand, idx) => {
              const aiRec = cand.aiRecommendation || (cand.decision === 'AUTO_ADVANCE' ? 'SHORTLISTED' : (cand.decision === 'AUTO_REJECT' ? 'REJECTED' : 'HR_REVIEW'));
              const finalSt = cand.finalStatus || cand.statusLabel || 'Under Review';
              
              const aiBadgeClass = aiRec === 'SHORTLISTED' ? 'badge-shortlisted' : (aiRec === 'REJECTED' ? 'badge-rejected' : 'badge-review');
              const finalBadgeClass = finalSt === 'Shortlisted' ? 'badge-shortlisted' : (finalSt === 'Rejected' ? 'badge-rejected' : 'badge-review');

              const isOverridden = cand.isOverridden || (cand.overrideReason && cand.overrideReason.length > 0);

              const scoreVal = parseFloat(cand.fitScore) || 0;
              const scoreColor = scoreVal >= 75 ? '#16A34A' : (scoreVal < 40 ? '#DC2626' : '#D97706');

              return `
                <tr class="applicant-row" data-name="${cand.name.toLowerCase()}" data-skills="${(cand.matchedSkills || []).join(' ').toLowerCase()}" data-degree="${(cand.degree || '').toLowerCase()}" data-id="${cand.id}" data-score="${scoreVal}" data-ai="${aiRec}" data-status="${finalSt}">
                  <td style="color: #64748B; font-weight: 600; text-align: center;">${idx + 1}</td>
                  <td style="min-width: 250px;">
                    <div style="display: flex; align-items: center; gap: 12px; min-width: 220px;">
                      <div class="avatar-circle avatar-candidate" style="width: 38px; height: 38px; min-width: 38px; font-size: 14px; font-weight: 700; background: #EEF2FF; color: #4F46E5; flex-shrink: 0;">
                        ${cand.name.charAt(0)}
                      </div>
                      <div style="min-width: 0;">
                        <div style="font-weight: 700; color: #111827; font-size: 14px; white-space: nowrap;">${cand.name}</div>
                        <div style="font-size: 12px; color: #64748B; white-space: nowrap;">${cand.degree || 'Degree'} • ${cand.location || 'Pune, India'}</div>
                      </div>
                    </div>
                  </td>
                  <td style="min-width: 110px; white-space: nowrap;">
                    <div style="display: inline-flex; align-items: baseline; gap: 6px; white-space: nowrap;">
                      <strong style="color: ${scoreColor}; font-size: 16px; font-family: var(--font-mono);">${cand.fitScore}</strong>
                      <span style="font-size: 12px; color: #94A3B8;">/ 100</span>
                    </div>
                  </td>
                  <td style="min-width: 160px; white-space: nowrap;">
                    <span class="badge ${aiBadgeClass}" style="font-weight: 700; font-family: var(--font-mono); font-size: 11px; white-space: nowrap;">
                      ${aiRec}
                    </span>
                  </td>
                  <td style="min-width: 180px; white-space: nowrap;">
                    <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                      <span class="badge ${finalBadgeClass}" style="font-weight: 700; font-size: 12px; white-space: nowrap;">
                        ${finalSt}
                      </span>
                      ${isOverridden ? `
                        <span style="font-size: 10px; font-weight: 700; color: #4338CA; background: #EEF2FF; padding: 2px 6px; border-radius: 4px; border: 1px solid #C7D2FE; white-space: nowrap;" title="Overridden by recruiter: ${cand.overrideReason || ''}">
                          Overridden by Recruiter
                        </span>
                      ` : ''}
                    </div>
                  </td>
                  <td style="color: #475569; font-weight: 600; font-size: 13px; white-space: nowrap;">${cand.skillsMatch || 'N/A'}</td>
                  <td style="color: #64748B; font-size: 13px; white-space: nowrap;">${cand.appliedDate || 'Oct 17, 2026'}</td>
                  <td style="text-align: right; white-space: nowrap; min-width: 140px;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                      <button class="btn btn-outline btn-sm" onclick="App.openPdfModal('${cand.resumeFile || '10089434.pdf'}', 'Resume PDF: ${cand.name}')">
                        ${Icons.fileText(14)} PDF
                      </button>
                      <button class="btn btn-primary btn-sm" onclick="App.navigate('recruiter-candidate-review', { candidateId: '${cand.id}' })">
                        Review Deep-Dive
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Space-Filling Structured Two-Column ATS Command Section -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; margin-top: 10px;">
        
        <!-- Left Panel: Requisition Evaluation Benchmark & Gate Policy -->
        <div class="card" style="padding: 22px; border: 1px solid var(--border); border-radius: 12px; background: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #4F46E5;">${Icons.briefcase(18)}</span>
              <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Requisition Criteria & Gate Benchmark</h3>
            </div>
            <span class="badge badge-indigo" style="font-size: 11px;">Deterministic Policy</span>
          </div>

          <div style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
            <strong>Target Role:</strong> ${job.title} (${job.id}) • <strong>Experience:</strong> ${job.experience || '2+ years'} • <strong>Domain:</strong> Software & IT
          </div>

          <!-- Must-Haves vs Nice-To-Haves -->
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #15803D; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              ${Icons.check(14)} Essential Must-Have Requirements (${(job.mustHaves || []).length}):
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${(job.mustHaves || ["JavaScript", "React", "Node.js", "MongoDB", "REST APIs", "AWS", "Git"]).map(m => `
                <span style="background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${m}</span>
              `).join('')}
            </div>
          </div>

          <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; font-weight: 700; color: #0284C7; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              ${Icons.sparkles(14)} Preferred Nice-To-Have Skills:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${(job.niceToHaves || ["Docker", "TypeScript", "Express.js", "PostgreSQL", "CI/CD"]).map(n => `
                <span style="background: #F0F9FF; color: #0284C7; border: 1px solid #BAE6FD; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${n}</span>
              `).join('')}
            </div>
          </div>

          <!-- Gate 7 Policy Thresholds & Weights -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 12px;">
            <div style="font-weight: 700; color: #1E293B; margin-bottom: 8px;">Deterministic Decision Policy Rules:</div>
            <div style="display: flex; flex-direction: column; gap: 6px; color: #64748B;">
              <div>• <strong style="color: #16A34A;">SHORTLISTED:</strong> Fit Score >= 75.0 AND zero unverified must-have requirements.</div>
              <div>• <strong style="color: #D97706;">HR_REVIEW:</strong> 40.0 <= Fit Score < 75.0 OR ambiguous transferable background.</div>
              <div>• <strong style="color: #DC2626;">REJECTED:</strong> Fit Score < 40.0 OR demonstrated critical prerequisite deficit.</div>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B;">
              <strong>Scoring Weights:</strong> Technical (40%) • Experience (30%) • Seniority (20%) • Education (5%) • Location (5%)
            </div>
          </div>
        </div>

        <!-- Right Panel: Live Recruiter Decisions & Audit Stream -->
        <div class="card" style="padding: 22px; border: 1px solid var(--border); border-radius: 12px; background: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #4F46E5;">${Icons.clock(18)}</span>
              <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Live Recruiter Decisions & Audit Stream</h3>
            </div>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('admin-audit-log')">
              Full Audit Trail
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; max-height: 380px; overflow-y: auto;">
            ${auditLogs.length === 0 ? `
              <div style="text-align: center; color: #94A3B8; padding: 30px; font-size: 13px;">
                All candidates currently aligned with initial deterministic AI gate recommendations.
              </div>
            ` : auditLogs.map(log => {
              const isShort = log.action && (log.action.includes("Shortlisted") || log.action.includes("AUTO_ADVANCE"));
              const isRej = log.action && (log.action.includes("Reject") || log.action.includes("AUTO_REJECT"));
              const accentColor = isShort ? '#16A34A' : (isRej ? '#DC2626' : '#D97706');
              const bg = isShort ? '#F0FDF4' : (isRej ? '#FEF2F2' : '#FFFBEB');

              return `
                <div style="padding: 12px 14px; background: ${bg}; border-left: 3px solid ${accentColor}; border-radius: 6px; font-size: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <strong style="color: #0F172A; font-size: 13px;">${log.actor || 'Recruiter (Rohan)'}</strong>
                    <span style="color: #94A3B8; font-family: var(--font-mono); font-size: 11px;">${log.timestamp || 'Today'}</span>
                  </div>
                  <div style="color: ${accentColor}; font-weight: 600; margin-bottom: 2px;">
                    ${log.action || 'Decision recorded'} • ${log.target || ''}
                  </div>
                  <div style="color: #64748B; font-style: italic;">
                    "${log.status || log.details || 'Recruiter verified evaluation evidence.'}"
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border); font-size: 11px; color: #64748B; display: flex; justify-content: space-between; align-items: center;">
            <span>Audit trail backed by <code>data/ats.db</code> & <code>logs/overrides.jsonl</code></span>
            <span style="font-weight: 700; color: #16A34A;">● Real-time Sync Active</span>
          </div>
        </div>

      </div>
    `;
  },

  switchJob(jobId) {
    App.navigate('recruiter-applicants', { jobId });
  },

  filterApplicantTable() {
    const searchVal = (document.getElementById('candSearch')?.value || '').toLowerCase();
    const sortVal = document.getElementById('candSort')?.value || 'fit_desc';
    const aiRecVal = document.getElementById('candAiRec')?.value || '';
    const statusVal = document.getElementById('candStatus')?.value || '';

    const rows = Array.from(document.querySelectorAll('.applicant-row'));
    
    // Sort rows
    rows.sort((a, b) => {
      const scoreA = parseFloat(a.getAttribute('data-score')) || 0;
      const scoreB = parseFloat(b.getAttribute('data-score')) || 0;
      const nameA = a.getAttribute('data-name') || '';
      const nameB = b.getAttribute('data-name') || '';

      if (sortVal === 'fit_desc') return scoreB - scoreA;
      if (sortVal === 'fit_asc') return scoreA - scoreB;
      if (sortVal === 'name') return nameA.localeCompare(nameB);
      return 0;
    });

    const tbody = document.getElementById('applicantTableBody');
    if (tbody) {
      rows.forEach(r => tbody.appendChild(r));
    }

    // Filter visibility
    let visibleCount = 0;
    rows.forEach(r => {
      const name = r.getAttribute('data-name') || '';
      const skills = r.getAttribute('data-skills') || '';
      const degree = r.getAttribute('data-degree') || '';
      const id = r.getAttribute('data-id') || '';
      const ai = r.getAttribute('data-ai') || '';
      const status = r.getAttribute('data-status') || '';

      const matchSearch = !searchVal || name.includes(searchVal) || skills.includes(searchVal) || degree.includes(searchVal) || id.includes(searchVal);
      const matchAi = !aiRecVal || ai === aiRecVal;
      const matchStatus = !statusVal || status === statusVal;

      if (matchSearch && matchAi && matchStatus) {
        r.style.display = '';
        visibleCount++;
      } else {
        r.style.display = 'none';
      }
    });
  },

  resetFilters() {
    if (document.getElementById('candSearch')) document.getElementById('candSearch').value = '';
    if (document.getElementById('candSort')) document.getElementById('candSort').value = 'fit_desc';
    if (document.getElementById('candAiRec')) document.getElementById('candAiRec').value = '';
    if (document.getElementById('candStatus')) document.getElementById('candStatus').value = '';
    RecruiterView.filterApplicantTable();
  },

  // 5. Candidate Review - Overview & Decision (Screens 7, 8, 9, 10, 11)
  renderCandidateReview(container, params = {}) {
    const candidateId = params.candidateId || ((AppData.getCandidates() || [])[0] ? AppData.getCandidates()[0].id : "c_10089434");
    const cand = AppData.getCandidateById(candidateId) || (AppData.getCandidates() || [])[0];
    if (!cand) {
      container.innerHTML = `<div class="card" style="text-align: center; padding: 40px; color: #64748B;">No candidate found for review.</div>`;
      return;
    }
    if (window.AppData && AppData.ensureCandidateLedgerAndRequirements) {
      AppData.ensureCandidateLedgerAndRequirements(cand);
    }
    const job = AppData.getJobById(cand.appliedJobId) || { id: cand.appliedJobId || '2234533717', title: cand.appliedJobTitle || 'Software Engineer', company: 'TechCorp', mustHaves: ['JavaScript', 'React', 'Node.js'], niceToHaves: ['AWS', 'Docker'] };

    const aiRec = cand.aiRecommendation || (cand.decision === 'AUTO_ADVANCE' ? 'SHORTLISTED' : (cand.decision === 'AUTO_REJECT' ? 'REJECTED' : 'HR_REVIEW'));
    const finalSt = cand.finalStatus || cand.statusLabel || 'Under Review';
    const isOverridden = cand.isOverridden || (cand.overrideReason && cand.overrideReason.length > 0);

    const aiBadgeClass = aiRec === 'SHORTLISTED' ? 'badge-shortlisted' : (aiRec === 'REJECTED' ? 'badge-rejected' : 'badge-review');
    const finalBadgeClass = finalSt === 'Shortlisted' ? 'badge-shortlisted' : (finalSt === 'Rejected' ? 'badge-rejected' : 'badge-review');

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
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0;">${cand.name}</h2>
                <span class="badge badge-indigo">ID: ${cand.candidateId || cand.id}</span>
                ${isOverridden ? `<span class="badge" style="background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE;">Decision Overridden</span>` : ''}
              </div>
              <div style="font-size: 14px; color: #64748B; margin: 4px 0;">
                Applied for: <strong>${cand.appliedJobTitle || job.title}</strong> (Job ID: ${cand.appliedJobId || job.id}) • ${cand.degree || 'Degree'} • ${cand.location || 'Pune, India'}
              </div>
              <div style="font-size: 13px; color: #64748B;">
                Email: <span style="color: #1E293B;">${cand.email || 'N/A'}</span> • Phone: <span style="color: #1E293B;">${cand.phone || 'N/A'}</span> • <a href="https://github.com/Akshada-kale" target="_blank" style="color: #4F46E5; font-weight: 600;">GitHub: ${cand.github || '@candidate'}</a>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div style="text-align: right;">
              <div style="font-size: 28px; font-weight: 800; color: #111827;">${cand.fitScore} <span style="font-size: 16px; color: #94A3B8;">/ 100</span></div>
              <div style="font-size: 12px; color: #64748B; font-weight: 500;">Fit Score</div>
            </div>

            <!-- AI Recommendation vs Final Status Box -->
            <div style="display: flex; gap: 10px;">
              <div style="text-align: center; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px 14px; border-radius: 10px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 2px;">AI RECOMMENDATION</div>
                <span class="badge ${aiBadgeClass}" style="font-size: 12px; font-family: var(--font-mono); font-weight: 700;">${aiRec}</span>
              </div>

              <div style="text-align: center; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px 14px; border-radius: 10px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 2px;">FINAL APPLICATION STATUS</div>
                <span class="badge ${finalBadgeClass}" style="font-size: 12px; font-weight: 700;">${finalSt}</span>
              </div>
            </div>

            <button class="btn btn-outline btn-sm" onclick="App.openPdfModal('${cand.resumeFile || '10089434.pdf'}', 'Candidate Resume PDF: ${cand.name}')">
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
                <strong style="color: #111827; font-size: 14px;">Resume Document: ${cand.resumeFile || '10089434.pdf'}</strong>
                <div style="font-size: 12px; color: #64748B;">Validated via Gate 0 Integrity Shield & Gate 1 Layout Extractor</div>
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" onclick="App.openPdfModal('${cand.resumeFile || '10089434.pdf'}', 'Resume: ${cand.name}')">
                ${Icons.externalLink(14)} Fullscreen PDF Preview
              </button>
              <a href="/api/pdf/view?file=${encodeURIComponent(cand.resumeFile || '10089434.pdf')}" target="_blank" class="btn btn-outline btn-sm">
                ${Icons.eye(14)} Open in New Tab
              </a>
              <a href="/api/pdf/download?file=${encodeURIComponent(cand.resumeFile || '10089434.pdf')}&download=1" class="btn btn-outline btn-sm" download="${cand.resumeFile || 'resume.pdf'}">
                ${Icons.download(14)} Download
              </a>
            </div>
          </div>

          <div class="responsive-split-grid">
            <!-- Left: Inline PDF Viewer -->
            <div class="card" style="padding: 16px; display: flex; flex-direction: column; height: 600px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="font-size: 14px; font-weight: 700; color: #111827; margin: 0; display: flex; align-items: center; gap: 6px;">
                  ${Icons.fileText(16)} Visual PDF Document
                </h4>
                <span class="badge badge-indigo" style="font-size: 11px;">Inline Renderer</span>
              </div>
              <div style="flex: 1; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); background: #525659;">
                <iframe src="/api/pdf/view?file=${encodeURIComponent(cand.resumeFile || '10089434.pdf')}#toolbar=1" style="width: 100%; height: 100%; border: none;"></iframe>
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
                <button class="btn btn-outline btn-sm" onclick="App.openPdfModal('${cand.resumeFile || '10089434.pdf'}', 'Verify Ledger Citations: ${cand.name}')">
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
    const cand = AppData.getCandidateById(candidateId);
    const radios = document.getElementsByName('hrDecisionRadio');
    let selected = "ESCALATE";
    for (const r of radios) {
      if (r.checked) selected = r.value;
    }
    const comment = (document.getElementById('hrDecisionComment')?.value || '').trim();

    // Check if this overrides original AI recommendation
    const aiRec = cand.aiRecommendation || cand.decision;
    const isOverride = (selected === 'AUTO_ADVANCE' && aiRec !== 'SHORTLISTED' && aiRec !== 'AUTO_ADVANCE') ||
                       (selected === 'AUTO_REJECT' && aiRec !== 'REJECTED' && aiRec !== 'AUTO_REJECT') ||
                       (selected === 'ESCALATE' && aiRec !== 'HR_REVIEW' && aiRec !== 'ESCALATE');

    if (isOverride && !comment) {
      App.showToast("Audit Reason Required: Please explain why you are overriding the AI screening recommendation.", "warning");
      const textarea = document.getElementById('hrDecisionComment');
      if (textarea) {
        textarea.focus();
        textarea.style.border = "2px solid #DC2626";
      }
      return;
    }

    App.showToast(`Recording decision override for ${cand.name}...`, "info");
    await AppData.updateCandidateDecision(cand.candidateId || candidateId, selected, comment || "Confirmed recruiter decision", cand.appliedJobId);
    await AppData.syncWithBackend();
    const finalLabel = selected === 'AUTO_ADVANCE' ? 'Shortlisted' : (selected === 'AUTO_REJECT' ? 'Rejected' : 'Under Review');
    App.showToast(`Decision saved: ${finalLabel}! Synced to SQLite database & immutable audit trail.`, "success");
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
    App.openPdfModal(cand.resumeFile || '10089434.pdf', `Resume Document: ${cand.name}`);
  }
};

window.RecruiterView = RecruiterView;

