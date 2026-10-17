/**
 * HuntYourTribe (HYT ATS) - Candidate Module
 * Implements:
 * 1. Candidate Dashboard (Home) with calculated metric cards and recommendations
 * 2. Browse Jobs with search and filters
 * 3. Job Details with Overview / Requirements / About Company tabs
 * 4. Apply for Job Modal (prefilled with stored profile resume)
 * 5. My Applications page with status tabs & table
 * 6. Application Details with real-time 4-step vertical timeline
 * 7. Candidate Profile with skills editor and resume upload
 */

const CandidateView = {
  // 1. Candidate Dashboard
  renderDashboard(container) {
    const user = AppData.getCurrentUser();
    const apps = AppData.getCandidateApplications();
    const jobs = AppData.getJobs();

    const totalApplied = apps.length;
    const underReview = apps.filter(a => a.status === "Under Review").length;
    const shortlisted = apps.filter(a => a.status === "Shortlisted").length;
    const notShortlisted = apps.filter(a => a.status === "Not Shortlisted" || a.status === "Rejected").length;

    const recommendedJobs = jobs.slice(0, 3);

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>Welcome back, ${user.name.split(' ')[0]}!</h1>
          <p>Find your next opportunity</p>
        </div>
      </div>

      <!-- 4 Summary Cards (Screen 2) -->
      <div class="summary-grid">
        <div class="summary-card" onclick="App.navigate('candidate-applications', { filter: 'All' })" style="cursor: pointer;">
          <div class="title">Applied Jobs</div>
          <div class="value">${totalApplied}</div>
          <div class="subtext">Total active applications</div>
        </div>
        <div class="summary-card review" onclick="App.navigate('candidate-applications', { filter: 'Under Review' })" style="cursor: pointer;">
          <div class="title">Under Review</div>
          <div class="value">${underReview}</div>
          <div class="subtext">Being evaluated by recruiters</div>
        </div>
        <div class="summary-card shortlisted" onclick="App.navigate('candidate-applications', { filter: 'Shortlisted' })" style="cursor: pointer;">
          <div class="title">Shortlisted</div>
          <div class="value">${shortlisted}</div>
          <div class="subtext">Ready for technical interview</div>
        </div>
        <div class="summary-card rejected" onclick="App.navigate('candidate-applications', { filter: 'Not Shortlisted' })" style="cursor: pointer;">
          <div class="title">Not Shortlisted</div>
          <div class="value">${notShortlisted}</div>
          <div class="subtext">Closed or not advanced</div>
        </div>
      </div>

      <!-- Resume Quick Upload Card (Interactive Feature) -->
      <div class="card" style="padding: 22px; margin-bottom: 24px; background: linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%); border: 1px solid var(--primary-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center;">
              ${Icons.fileText(24)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">${user.name}</h3>
                <span class="badge badge-indigo" style="font-size: 11px;">Active Resume</span>
              </div>
              <div style="font-size: 13px; color: #4F46E5; font-weight: 600; margin: 2px 0;">
                ${user.title || 'Candidate Profile'}
              </div>
              <div style="font-size: 12px; color: #64748B;">
                <strong>${user.resumeFile || 'Akshada_Kale_Resume.pdf'}</strong> (${user.resumeSize || '450 KB'}) • ${user.education || 'Graduate'} • Last updated ${user.lastUpdated}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-sm" onclick="CandidateView.openResumePreviewModal()">
              ${Icons.eye ? Icons.eye(14) : Icons.fileText(14)} Preview Parsed Resume
            </button>
            <label class="btn btn-primary btn-sm" style="margin: 0; cursor: pointer;">
              ${Icons.upload(14)} Upload New Resume
              <input type="file" accept=".pdf,.docx,.txt" style="display: none;" onchange="CandidateView.handleResumeFileSelect(event)">
            </label>
          </div>
        </div>

        <!-- Extracted Skills Showcase -->
        <div style="background: rgba(255, 255, 255, 0.7); border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 12px; font-weight: 700; color: #475569;">Extracted Resume Skills (${(user.skills || []).length}):</span>
          ${(user.skills || []).slice(0, 8).map(s => `<span class="tag" style="font-size: 11px; padding: 3px 8px;">${s}</span>`).join('')}
          ${(user.skills || []).length > 8 ? `<span style="font-size: 11px; color: #64748B;">+${(user.skills || []).length - 8} more</span>` : ''}
        </div>

        <!-- Drag & Drop Zone -->
        <div class="upload-dropzone" ondragover="event.preventDefault(); this.classList.add('drag-active');" ondragleave="this.classList.remove('drag-active');" ondrop="CandidateView.handleResumeDrop(event, this)">
          <input type="file" accept=".pdf,.docx,.txt" onchange="CandidateView.handleResumeFileSelect(event)">
          <div class="upload-icon">${Icons.upload(22)}</div>
          <div class="title">Drag & drop your new resume here to re-parse & update, or browse files</div>
          <div class="subtitle">Supports PDF, DOCX, TXT up to 10MB • Auto-extracts skills for AI Gates 0-8 in real time</div>
        </div>
      </div>

      <!-- Recommended Jobs Section -->
      <div class="card" style="padding: 24px; margin-top: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 700;">Recommended Jobs for You</h3>
            <p style="font-size: 13px; color: #64748B;">Roles matching your skills and experience profile</p>
          </div>
          <a href="#" style="font-size: 13px; font-weight: 600;" onclick="App.navigate('candidate-browse'); return false;">
            View All
          </a>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${recommendedJobs.map(job => `
            <div class="card card-hover" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border: 1px solid var(--border);">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 44px; height: 44px; border-radius: 10px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                  ${Icons.briefcase(20)}
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 2px;">${job.title}</h4>
                  <div style="font-size: 13px; color: #64748B; margin-bottom: 8px;">
                    <span style="font-weight: 500;">${job.company}</span> • <span>${job.location}</span> • <span style="color: #94A3B8;">${job.postedDate || '2 days ago'}</span>
                  </div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${(job.mustHaves || []).slice(0, 4).map(skill => `<span class="tag">${skill}</span>`).join('')}
                    <span class="tag tag-nice">${job.jobType}</span>
                  </div>
                </div>
              </div>

              <div>
                <button class="btn btn-primary btn-sm" onclick="App.navigate('candidate-job-detail', { jobId: '${job.id}' })">
                  View Details
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 2. Browse Jobs Page (Screen 3)
  renderBrowseJobs(container) {
    const jobs = AppData.getJobs();

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>Browse Jobs</h1>
          <p>Find roles that match your skills</p>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="card" style="margin-bottom: 24px; padding: 18px 20px;">
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="flex: 1; position: relative;">
            <input type="text" id="candidateJobSearch" class="form-control" placeholder="Search jobs, skills or company..." style="padding-left: 38px;">
            <span style="position: absolute; left: 12px; top: 11px; color: #94A3B8;">${Icons.search()}</span>
          </div>
          <button class="btn btn-primary" onclick="CandidateView.filterBrowseJobs()">Search</button>
        </div>

        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <select id="candidateFilterLoc" class="form-control" style="width: auto; min-width: 160px;" onchange="CandidateView.filterBrowseJobs()">
            <option value="">Location (All)</option>
            <option value="Bangalore">Bangalore, India</option>
            <option value="Pune">Pune, India</option>
            <option value="Remote">Remote</option>
            <option value="Mumbai">Mumbai, India</option>
          </select>
          <select id="candidateFilterType" class="form-control" style="width: auto; min-width: 160px;" onchange="CandidateView.filterBrowseJobs()">
            <option value="">Job Type (All)</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
          </select>
          <select id="candidateFilterExp" class="form-control" style="width: auto; min-width: 160px;" onchange="CandidateView.filterBrowseJobs()">
            <option value="">Experience (All)</option>
            <option value="0-2">0-2 years</option>
            <option value="2-5">2-5 years</option>
            <option value="3-6">3-6 years</option>
          </select>
        </div>
      </div>

      <div style="font-size: 14px; font-weight: 600; color: #64748B; margin-bottom: 16px;" id="candidateJobsCount">
        ${jobs.length}+ jobs available
      </div>

      <!-- Jobs List -->
      <div id="candidateBrowseList" style="display: flex; flex-direction: column; gap: 16px;">
        ${CandidateView.renderBrowseList(jobs)}
      </div>

      <!-- Pagination Footer -->
      <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 32px;">
        <button class="btn btn-outline btn-sm">${Icons.chevronLeft(16)}</button>
        <button class="btn btn-primary btn-sm">1</button>
        <button class="btn btn-outline btn-sm">2</button>
        <button class="btn btn-outline btn-sm">3</button>
        <button class="btn btn-outline btn-sm">${Icons.chevronRight(16)}</button>
      </div>
    `;
  },

  renderBrowseList(jobs) {
    if (!jobs || jobs.length === 0) {
      return `<div class="card" style="text-align: center; padding: 40px; color: #64748B;">No roles found matching your criteria.</div>`;
    }

    return jobs.map(job => `
      <div class="card card-hover" style="display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
            ${job.title.charAt(0)}
          </div>
          <div>
            <h3 style="font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 4px;">${job.title}</h3>
            <div style="font-size: 13px; color: #64748B; display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="font-weight: 500;">${job.company}</span>
              <span>•</span>
              <span>${job.location}</span>
              <span>•</span>
              <span style="color: #94A3B8;">${job.postedDate || "3 days ago"}</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${(job.mustHaves || []).slice(0, 5).map(skill => `<span class="tag">${skill}</span>`).join('')}
              <span class="tag tag-nice">${job.jobType}</span>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 13px; color: #64748B; margin-bottom: 12px;">
            ${job.experience}
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('candidate-job-detail', { jobId: '${job.id}' })">
            View Details
          </button>
        </div>
      </div>
    `).join('');
  },

  filterBrowseJobs() {
    const q = (document.getElementById('candidateJobSearch')?.value || '').toLowerCase();
    const loc = document.getElementById('candidateFilterLoc')?.value || '';
    const type = document.getElementById('candidateFilterType')?.value || '';
    const exp = document.getElementById('candidateFilterExp')?.value || '';

    const allJobs = AppData.getJobs();
    const filtered = allJobs.filter(j => {
      const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.mustHaves || []).some(s => s.toLowerCase().includes(q));
      const matchLoc = !loc || j.location.includes(loc);
      const matchType = !type || j.jobType === type;
      const matchExp = !exp || j.experience.includes(exp);
      return matchQ && matchLoc && matchType && matchExp;
    });

    const cont = document.getElementById('candidateBrowseList');
    const countEl = document.getElementById('candidateJobsCount');
    if (cont) cont.innerHTML = CandidateView.renderBrowseList(filtered);
    if (countEl) countEl.innerText = `${filtered.length} jobs available`;
  },

  // 3. Job Details Page (Screen 4)
  renderJobDetail(container, params = {}) {
    const jobId = params.jobId || "2234533717";
    const job = AppData.getJobById(jobId);

    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="btn btn-outline btn-sm" onclick="App.navigate('candidate-browse')">
          ${Icons.arrowLeft(14)} Back to Jobs
        </button>
      </div>

      <div class="card" style="padding: 28px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 26px; font-weight: 800; color: #111827; margin-bottom: 8px;">${job.title}</h1>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #64748B; flex-wrap: wrap;">
              <span style="font-weight: 600; color: #4F46E5;">${job.company}</span>
              <span>•</span>
              <span style="display: flex; align-items: center; gap: 4px;">${Icons.mapPin(14)} ${job.location}</span>
              <span>•</span>
              <span style="display: flex; align-items: center; gap: 4px;">${Icons.clock(14)} ${job.jobType}</span>
              <span>•</span>
              <span>${job.experience}</span>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-outline btn-lg" onclick="App.openPdfModal('${job.pdfFile || (job.id === 'pa_director' ? 'pa_director.pdf' : 'pa_director.pdf')}', 'Job Description PDF: ${job.title}')">
              ${Icons.fileText(16)} View JD PDF
            </button>
            <button class="btn btn-primary btn-lg" onclick="CandidateView.openApplyModal('${job.id}')">
              Apply Now
            </button>
          </div>
        </div>

        <!-- Detail Tabs -->
        <div class="tabs-nav">
          <button class="tab-btn active" id="tab-overview" onclick="CandidateView.switchDetailTab('overview')">Overview</button>
          <button class="tab-btn" id="tab-reqs" onclick="CandidateView.switchDetailTab('reqs')">Requirements</button>
          <button class="tab-btn" id="tab-company" onclick="CandidateView.switchDetailTab('company')">About Company</button>
        </div>

        <!-- Tab 1: Overview -->
        <div id="content-overview" class="detail-tab-content" style="padding-top: 10px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 10px;">Job Description</h4>
          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 24px;">
            ${job.overview}
          </p>

          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Must Have Skills</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
            ${(job.mustHaves || []).map(skill => `<span class="tag" style="padding: 6px 14px; font-size: 13px;">${skill}</span>`).join('')}
          </div>

          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Nice to Have Skills</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${(job.niceToHaves || []).map(skill => `<span class="tag tag-nice" style="padding: 6px 14px; font-size: 13px;">${skill}</span>`).join('')}
          </div>
        </div>

        <!-- Tab 2: Requirements -->
        <div id="content-reqs" class="detail-tab-content" style="display: none; padding-top: 10px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Core Technical Competencies</h4>
          <ul style="padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.8; margin-bottom: 20px;">
            <li>Minimum ${job.experience} of software engineering experience.</li>
            <li>Proficiency across modern JavaScript/TypeScript, React, and Node.js.</li>
            <li>Hands-on relational and NoSQL database modeling (PostgreSQL / MongoDB).</li>
            <li>Experience implementing scalable RESTful APIs with clean authentication.</li>
            <li>Understanding of modern version control (Git) and automated CI/CD workflows.</li>
          </ul>
        </div>

        <!-- Tab 3: About Company -->
        <div id="content-company" class="detail-tab-content" style="display: none; padding-top: 10px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 10px;">About ${job.company}</h4>
          <p style="font-size: 14px; color: #475569; line-height: 1.7;">
            ${job.company} is an innovative technology enterprise committed to engineering world-class digital experiences. We foster an inclusive, high-ownership engineering culture with remote flexibility and competitive compensation.
          </p>
        </div>
      </div>
    `;
  },

  switchDetailTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');

    const tabBtn = document.getElementById(`tab-${tabName}`);
    const content = document.getElementById(`content-${tabName}`);
    if (tabBtn) tabBtn.classList.add('active');
    if (content) content.style.display = 'block';
  },

  // 4. Apply for Job Modal (Screen 5)
  openApplyModal(jobId) {
    CandidateView.pendingCustomResumeFile = null;
    const job = AppData.getJobById(jobId);
    const candidate = AppData.getCurrentUser();

    const modalId = "applyModal";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = "modal-backdrop";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="font-size: 20px; font-weight: 700;">Apply for this Job</h3>
          <button class="modal-close-btn" onclick="CandidateView.closeApplyModal()">
            ${Icons.x(20)}
          </button>
        </div>

        <div style="background: #F8FAFC; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; border: 1px solid var(--border);">
          <div style="font-weight: 700; font-size: 15px; color: #111827;">${job.title}</div>
          <div style="font-size: 13px; color: #64748B;">${job.company} • ${job.location}</div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Resume for this Application</div>
          
          <div style="display: flex; gap: 16px; margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
              <input type="radio" name="applyResumeChoice" value="profile" checked onchange="CandidateView.toggleApplyResumeOption('profile')">
              <span>Use Profile Resume</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
              <input type="radio" name="applyResumeChoice" value="upload" onchange="CandidateView.toggleApplyResumeOption('upload')">
              <span>Upload Custom Resume</span>
            </label>
          </div>

          <!-- Profile Resume Display -->
          <div id="applyProfileResumeBox" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 10px; border: 1px solid #C7D2FE; background: #EEF2FF;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #4F46E5;">${Icons.fileText(24)}</span>
              <div>
                <div style="font-size: 14px; font-weight: 600; color: #111827;">${candidate.resumeFile || 'Akshada_Kale_Resume.pdf'}</div>
                <div style="font-size: 12px; color: #64748B;">${candidate.resumeSize || '450 KB'} • Verified from Profile</div>
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-sm" onclick="CandidateView.openResumePreviewModal()">
              ${Icons.eye ? Icons.eye(14) : Icons.fileText(14)} Preview
            </button>
          </div>

          <!-- Custom Resume Upload Box -->
          <div id="applyCustomResumeBox" style="display: none; margin-top: 10px;">
            <div class="upload-dropzone" style="padding: 18px;" ondragover="event.preventDefault(); this.classList.add('drag-active');" ondragleave="this.classList.remove('drag-active');" ondrop="CandidateView.handleApplyCustomDrop(event, this)">
              <input type="file" accept=".pdf,.docx,.txt" onchange="CandidateView.handleApplyCustomSelect(event)">
              <div class="upload-icon" style="width: 36px; height: 36px; margin-bottom: 6px;">${Icons.upload(18)}</div>
              <div class="title" style="font-size: 13px;">Drag & drop customized resume, or click to browse</div>
              <div class="subtitle" style="font-size: 11px;">PDF, DOCX, TXT up to 10MB</div>
            </div>
            <div id="applyCustomFilePreview" style="display: none;" class="file-preview-card">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: #4F46E5;">${Icons.fileText(20)}</span>
                <span id="applyCustomFileName" style="font-size: 13px; font-weight: 600;">resume.pdf</span>
              </div>
              <span class="badge badge-success" style="font-size: 11px;">Ready to Submit</span>
            </div>
          </div>

          <div style="font-size: 12px; color: #64748B; margin-top: 8px;">
            Your resume will be processed by our AI screening engine (Gates 0-8). Status will update in "My Applications".
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Why are you a good fit? (Optional)</label>
          <textarea id="applyWhyFit" class="form-control" placeholder="I am excited to apply for this role because..." maxlength="500"></textarea>
          <div style="text-align: right; font-size: 12px; color: #94A3B8; margin-top: 4px;">0/500</div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <button class="btn btn-outline" onclick="CandidateView.closeApplyModal()">Cancel</button>
          <button class="btn btn-primary" onclick="CandidateView.submitApplication('${job.id}')">
            Submit Application
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  },

  closeApplyModal() {
    CandidateView.pendingCustomResumeFile = null;
    const modal = document.getElementById("applyModal");
    if (modal) modal.style.display = 'none';
  },

  async submitApplication(jobId) {
    const whyFit = document.getElementById('applyWhyFit')?.value || '';
    const resumeChoice = document.querySelector('input[name="applyResumeChoice"]:checked')?.value || 'profile';
    const customFile = CandidateView.pendingCustomResumeFile;

    CandidateView.closeApplyModal();

    let uploadedFileName = null;
    if (resumeChoice === 'upload' && customFile) {
      App.showToast(`Uploading '${customFile.name}' and running Gate 0 Integrity Shield...`, "info");
      await CandidateView.processUploadedResumeFile(customFile);
      uploadedFileName = customFile.name;
    } else {
      App.showToast("Submitting application and invoking AI Screening Pipeline...", "info");
    }

    const resumeToUse = uploadedFileName || AppData.getCurrentUser().resumeFile || "aksada.pdf";
    const newApp = await AppData.submitApplication(jobId, whyFit, resumeToUse);
    if (uploadedFileName && newApp && newApp.timeline) {
      newApp.timeline[0].note = `Application registered with custom resume (${uploadedFileName}).`;
    }

    CandidateView.pendingCustomResumeFile = null;
    await AppData.syncWithBackend();
    App.showToast(`Application submitted! AI Decision: ${newApp.decision || newApp.status}`, "success");
    App.navigate("candidate-applications");
  },

  // 5. My Applications Page (Screen 6)
  renderApplications(container, params = {}) {
    const activeFilter = params.filter || "All";
    const allApps = AppData.getCandidateApplications();

    const filtered = allApps.filter(app => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Under Review") return app.status === "Under Review";
      if (activeFilter === "Shortlisted") return app.status === "Shortlisted";
      if (activeFilter === "Not Shortlisted") return app.status === "Not Shortlisted" || app.status === "Rejected";
      return true;
    });

    const counts = {
      all: allApps.length,
      review: allApps.filter(a => a.status === "Under Review").length,
      shortlisted: allApps.filter(a => a.status === "Shortlisted").length,
      rejected: allApps.filter(a => a.status === "Not Shortlisted" || a.status === "Rejected").length
    };

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>My Applications</h1>
          <p>Track the status of your job applications</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs-nav">
        <button class="tab-btn ${activeFilter === 'All' ? 'active' : ''}" onclick="App.navigate('candidate-applications', { filter: 'All' })">
          All (${counts.all})
        </button>
        <button class="tab-btn ${activeFilter === 'Under Review' ? 'active' : ''}" onclick="App.navigate('candidate-applications', { filter: 'Under Review' })">
          Under Review (${counts.review})
        </button>
        <button class="tab-btn ${activeFilter === 'Shortlisted' ? 'active' : ''}" onclick="App.navigate('candidate-applications', { filter: 'Shortlisted' })">
          Shortlisted (${counts.shortlisted})
        </button>
        <button class="tab-btn ${activeFilter === 'Not Shortlisted' ? 'active' : ''}" onclick="App.navigate('candidate-applications', { filter: 'Not Shortlisted' })">
          Not Shortlisted (${counts.rejected})
        </button>
      </div>

      <!-- Applications Table -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Status</th>
              <th>Applied On</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; padding: 32px; color: #64748B;">No applications found in this tab.</td></tr>
            ` : filtered.map(app => {
              const badgeClass = app.status === 'Shortlisted' ? 'badge-shortlisted' : (app.status === 'Under Review' ? 'badge-review' : 'badge-rejected');
              return `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: #111827;">${app.jobTitle}</div>
                  </td>
                  <td>${app.company}</td>
                  <td>
                    <span class="badge ${badgeClass}">${app.status}</span>
                  </td>
                  <td style="color: #64748B;">${app.appliedDate}</td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-outline btn-sm" style="margin-right: 6px;" onclick="App.openPdfModal('${app.resumeFile || 'riya_sharma.pdf'}', 'Resume PDF: ${app.jobTitle}')">
                      ${Icons.fileText(14)} PDF
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="App.navigate('candidate-app-detail', { appId: '${app.id}' })">
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

  // 6. Application Details & Real-Time Timeline (Screens 7 & 8)
  renderAppDetail(container, params = {}) {
    const appId = params.appId || "APP-2234-AK01";
    const app = AppData.getCandidateApplications().find(a => a.id === appId) || AppData.getCandidateApplications()[0];
    const job = AppData.getJobById(app.jobId);

    const badgeClass = app.status === 'Shortlisted' ? 'badge-shortlisted' : (app.status === 'Under Review' ? 'badge-review' : 'badge-rejected');

    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="btn btn-outline btn-sm" onclick="App.navigate('candidate-applications')">
          ${Icons.arrowLeft(14)} Back to My Applications
        </button>
      </div>

      <div class="main-header" style="margin-bottom: 20px;">
        <div>
          <h1>Application Details</h1>
        </div>
      </div>

      <!-- Application Card -->
      <div class="card" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; font-weight: 700;">
              ${Icons.briefcase(22)}
            </div>
            <div>
              <h2 style="font-size: 20px; font-weight: 700; color: #111827;">${app.jobTitle}</h2>
              <div style="font-size: 14px; color: #64748B;">
                ${app.company} • Applied on ${app.appliedDate}
              </div>
            </div>
          </div>
          <div>
            <span class="badge ${badgeClass}" style="font-size: 13px; padding: 6px 14px;">${app.status}</span>
          </div>
        </div>

        <!-- Detail Subtabs -->
        <div class="tabs-nav">
          <button class="tab-btn active" id="apptab-status" onclick="CandidateView.switchAppTab('status')">Application Status</button>
          <button class="tab-btn" id="apptab-overview" onclick="CandidateView.switchAppTab('overview')">Overview</button>
          <button class="tab-btn" id="apptab-jd" onclick="CandidateView.switchAppTab('jd')">Job Description</button>
        </div>

        <!-- Content: Application Status (Vertical Timeline) -->
        <div id="appcontent-status" class="appdetail-content">
          <div class="timeline" style="margin: 20px 0 32px 10px;">
            ${(app.timeline || []).map((step, idx) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';
              return `
                <div class="timeline-step ${isCompleted ? 'completed' : (isActive ? 'active' : 'pending')}">
                  <div class="timeline-marker">
                    ${isCompleted ? Icons.check(16) : (isActive ? Icons.clock(16) : idx + 1)}
                  </div>
                  <div class="timeline-content">
                    <h4>${step.title}</h4>
                    <div class="timestamp">${step.timestamp}</div>
                    ${step.note ? `<div style="font-size: 13px; color: #475569; margin-top: 4px;">${step.note}</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Status Banner -->
          ${app.status === 'Shortlisted' ? `
            <div style="background: #DCFCE7; border: 1px solid #86EFAC; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 12px; color: #166534;">
              <span style="color: #16A34A;">${Icons.checkCircle(22)}</span>
              <div>
                <div style="font-weight: 700; font-size: 14px;">Congratulations! You have been shortlisted for this role.</div>
                <div style="font-size: 13px;">The recruiter will contact you for next steps and interview scheduling.</div>
              </div>
            </div>
          ` : (app.status === 'Under Review' ? `
            <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 12px; color: #92400E;">
              <span style="color: #D97706;">${Icons.clock(22)}</span>
              <div>
                <div style="font-weight: 700; font-size: 14px;">Your application is currently under human review.</div>
                <div style="font-size: 13px;">The hiring team is examining your technical portfolio. You will be notified once there is an update.</div>
              </div>
            </div>
          ` : `
            <div style="background: #FEE2E2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 12px; color: #991B1B;">
              <span style="color: #DC2626;">${Icons.alertTriangle(22)}</span>
              <div>
                <div style="font-weight: 700; font-size: 14px;">Application Closed</div>
                <div style="font-size: 13px;">Thank you for your interest. We encourage you to explore other open opportunities.</div>
              </div>
            </div>
          `)}
        </div>

        <!-- Content: Overview -->
        <div id="appcontent-overview" class="appdetail-content" style="display: none; padding-top: 10px;">
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">Candidate Overview</h4>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
            Submitted application ID: <strong>${app.id}</strong>. Candidate resume <strong>${AppData.getCurrentUser().resumeFile}</strong> was attached and safely redacted before screening.
          </p>
        </div>

        <!-- Content: Job Description -->
        <div id="appcontent-jd" class="appdetail-content" style="display: none; padding-top: 10px;">
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">Role Overview</h4>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            ${job.overview}
          </p>
        </div>
      </div>
    `;
  },

  switchAppTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.appdetail-content').forEach(c => c.style.display = 'none');

    const tabBtn = document.getElementById(`apptab-${tabName}`);
    const content = document.getElementById(`appcontent-${tabName}`);
    if (tabBtn) tabBtn.classList.add('active');
    if (content) content.style.display = 'block';
  },

  // 7. Candidate Profile Page (Screen 9)
  renderProfile(container) {
    const user = AppData.getCurrentUser();

    container.innerHTML = `
      <div class="main-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your resume and skills</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="CandidateView.openEditProfileModal()">
          Edit Profile
        </button>
      </div>

      <div class="card" style="padding: 28px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 28px;">
          <div class="avatar-circle avatar-xl avatar-candidate">
            ${user.avatar || 'A'}
          </div>
          <div>
            <h2 style="font-size: 22px; font-weight: 800; color: #111827;">${user.name}</h2>
            <div style="font-size: 14px; color: #64748B;">${user.email} • ${user.phone}</div>
            <div style="font-size: 13px; color: #4F46E5; margin-top: 4px;">
              <a href="${user.github}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px;">
                ${user.github} ${Icons.externalLink(12)}
              </a>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 8px;">About</h4>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">${user.about}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h4 style="font-size: 15px; font-weight: 700; color: #111827;">Skills</h4>
            <button class="btn btn-outline btn-sm" onclick="CandidateView.promptAddSkill()">
              ${Icons.plusCircle(14)} Add Skill
            </button>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${(user.skills || []).map(skill => `
              <span class="tag" style="padding: 6px 12px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                ${skill}
                <span style="cursor: pointer; opacity: 0.6;" onclick="CandidateView.removeSkill('${skill}')">×</span>
              </span>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 6px;">Education</h4>
          <div style="font-size: 14px; color: #475569;">${user.education}</div>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 6px;">Location</h4>
          <div style="font-size: 14px; color: #475569;">${user.location}</div>
        </div>

        <div>
          <h4 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 10px;">Saved Resume</h4>
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 12px; border: 1px solid var(--border); background: #F8FAFC; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 14px; min-width: 220px;">
              <span style="color: #4F46E5;">${Icons.fileText(24)}</span>
              <div>
                <div style="font-size: 14px; font-weight: 600; color: #111827;">${user.resumeFile}</div>
                <div style="font-size: 12px; color: #64748B;">${user.resumeSize} • Uploaded on ${user.lastUpdated}</div>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" onclick="CandidateView.openResumePreviewModal()">
                ${Icons.eye ? Icons.eye(14) : Icons.fileText(14)} Preview
              </button>
              <label class="btn btn-primary btn-sm" style="margin: 0; cursor: pointer;">
                ${Icons.upload(14)} Change Resume
                <input type="file" accept=".pdf,.docx,.txt" style="display: none;" onchange="CandidateView.handleResumeFileSelect(event)">
              </label>
            </div>
          </div>

          <!-- Dropzone inside profile -->
          <div class="upload-dropzone" style="margin-top: 14px; padding: 16px;" ondragover="event.preventDefault(); this.classList.add('drag-active');" ondragleave="this.classList.remove('drag-active');" ondrop="CandidateView.handleResumeDrop(event, this)">
            <input type="file" accept=".pdf,.docx,.txt" onchange="CandidateView.handleResumeFileSelect(event)">
            <div class="upload-icon" style="width: 36px; height: 36px; margin-bottom: 6px;">${Icons.upload(18)}</div>
            <div class="title" style="font-size: 13px;">Drag & drop to replace active profile resume, or browse files</div>
            <div class="subtitle" style="font-size: 11px;">Supports PDF, DOCX, TXT up to 10MB • Auto-updates screening signals</div>
          </div>
        </div>
      </div>
    `;
  },

  promptAddSkill() {
    const skill = prompt("Enter new skill:");
    if (skill && skill.trim()) {
      const user = AppData.getCurrentUser();
      if (!user.skills.includes(skill.trim())) {
        user.skills.push(skill.trim());
        AppData.updateCandidateProfile({ skills: user.skills });
        CandidateView.renderProfile(document.getElementById('mainContentArea'));
        App.showToast(`Skill '${skill.trim()}' added!`, "success");
      }
    }
  },

  removeSkill(skillToRemove) {
    const user = AppData.getCurrentUser();
    user.skills = user.skills.filter(s => s !== skillToRemove);
    AppData.updateCandidateProfile({ skills: user.skills });
    CandidateView.renderProfile(document.getElementById('mainContentArea'));
    App.showToast(`Skill '${skillToRemove}' removed`, "info");
  },

  openEditProfileModal() {
    const user = AppData.getCurrentUser();
    const modalId = "editProfileModal";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = "modal-backdrop";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="font-size: 20px; font-weight: 700;">Edit Profile</h3>
          <button class="modal-close-btn" onclick="document.getElementById('${modalId}').style.display='none'">
            ${Icons.x(20)}
          </button>
        </div>

        <form id="editProfileForm" onsubmit="CandidateView.saveProfile(event)">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="profName" class="form-control" value="${user.name}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" id="profLocation" class="form-control" value="${user.location}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Education</label>
            <input type="text" id="profEducation" class="form-control" value="${user.education}" required>
          </div>
          <div class="form-group">
            <label class="form-label">GitHub URL</label>
            <input type="text" id="profGithub" class="form-control" value="${user.github}" required>
          </div>
          <div class="form-group">
            <label class="form-label">About Me</label>
            <textarea id="profAbout" class="form-control" rows="3">${user.about}</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('${modalId}').style.display='none'">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    modal.style.display = 'flex';
  },

  saveProfile(event) {
    event.preventDefault();
    const updated = {
      name: document.getElementById('profName').value,
      location: document.getElementById('profLocation').value,
      education: document.getElementById('profEducation').value,
      github: document.getElementById('profGithub').value,
      about: document.getElementById('profAbout').value
    };

    AppData.updateCandidateProfile(updated);
    document.getElementById('editProfileModal').style.display = 'none';
    App.showToast("Profile updated successfully!", "success");
    CandidateView.renderProfile(document.getElementById('mainContentArea'));
  },

  toggleApplyResumeOption(val) {
    const profBox = document.getElementById('applyProfileResumeBox');
    const custBox = document.getElementById('applyCustomResumeBox');
    if (val === 'profile') {
      if (profBox) profBox.style.display = 'flex';
      if (custBox) custBox.style.display = 'none';
    } else {
      if (profBox) profBox.style.display = 'none';
      if (custBox) custBox.style.display = 'block';
    }
  },

  handleApplyCustomSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      CandidateView.pendingCustomResumeFile = file;
      document.getElementById('applyCustomFilePreview').style.display = 'flex';
      document.getElementById('applyCustomFileName').innerText = file.name;
      App.showToast(`Selected custom resume: ${file.name}`, "info");
    }
  },

  handleApplyCustomDrop(e, el) {
    e.preventDefault();
    el.classList.remove('drag-active');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      CandidateView.pendingCustomResumeFile = file;
      document.getElementById('applyCustomFilePreview').style.display = 'flex';
      document.getElementById('applyCustomFileName').innerText = file.name;
      App.showToast(`Dropped custom resume: ${file.name}`, "info");
    }
  },

  handleResumeFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) CandidateView.processUploadedResumeFile(file);
  },

  handleResumeDrop(e, el) {
    e.preventDefault();
    el.classList.remove('drag-active');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) CandidateView.processUploadedResumeFile(file);
  },

  processUploadedResumeFile(file) {
    const sizeKB = Math.round(file.size / 1024) + " KB";
    App.showToast(`Uploading and analyzing ${file.name} with Gate 0 Integrity Shield...`, "info");

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        let base64Data = "";
        let rawText = "";

        if (file.name.toLowerCase().endsWith(".pdf")) {
          // Data URL format: "data:application/pdf;base64,...."
          const resultStr = evt.target.result;
          base64Data = resultStr.includes(",") ? resultStr.split(",")[1] : resultStr;
        } else {
          rawText = evt.target.result || "";
        }

        const uploadRes = await AppData.uploadCandidateResume(file.name, sizeKB, [], base64Data, rawText);
        const detected = uploadRes.detectedSkills || [];
        App.showToast(`Resume '${file.name}' verified! Extracted ${detected.length} technical skills.`, "success");

        // Sync with backend so Recruiter and Admin panels immediately receive the new candidate data
        await AppData.syncWithBackend();

        // Refresh top navigation bar to display updated candidate name
        if (window.App && typeof App.renderNavbar === "function") {
          const navbarEl = document.getElementById("mainNavbar");
          if (navbarEl) navbarEl.innerHTML = App.renderNavbar(App.currentRole);
        }

        // Refresh current view
        const route = App.currentRoute;
        if (route === "dashboard" || route === "candidate-dashboard") {
          CandidateView.renderDashboard(document.getElementById('mainContentArea'));
        } else if (route === "candidate-profile") {
          CandidateView.renderProfile(document.getElementById('mainContentArea'));
        }
        resolve(uploadRes);
      };

      if (file.name.toLowerCase().endsWith(".pdf")) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  },

  openResumePreviewModal() {
    const user = (AppData.getCurrentUser() && AppData.getCurrentUser().candidate) || AppData.getCurrentUser();
    App.openPdfModal(user.resumeFile || "riya_sharma.pdf", `Active Resume: ${user.name || 'Candidate'}`);
  }
};

window.CandidateView = CandidateView;

