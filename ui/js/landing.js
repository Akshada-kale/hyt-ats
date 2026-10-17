/**
 * HuntYourTribe (HYT ATS) - Landing & Public Flow Module
 * Implements:
 * 1. Landing Page (Home, Stats, About, How It Works)
 * 2. Explore Opportunities (Public Jobs Search & Filtering)
 * 3. Role Selection Page (Candidate, Recruiter, Admin)
 * 4. Dedicated Authentication / Login with Role Toggle
 */

const LandingView = {
  render(container) {
    container.innerHTML = `
      <!-- Public Header Navbar -->
      <header class="top-navbar">
        <div class="navbar-brand" onclick="App.navigate('landing')">
          ${Icons.logo(32)}
          <span>HuntYourTribe</span>
        </div>
        <div class="landing-nav-links">
          <a href="#home" class="sidebar-link" style="padding: 6px 12px;" onclick="LandingView.scrollTo('home')">Home</a>
          <a href="#about" class="sidebar-link" style="padding: 6px 12px;" onclick="LandingView.scrollTo('about')">About</a>
          <a href="#jobs" class="sidebar-link" style="padding: 6px 12px;" onclick="LandingView.scrollTo('jobs')">Jobs</a>
          <a href="#how-it-works" class="sidebar-link" style="padding: 6px 12px;" onclick="LandingView.scrollTo('how-it-works')">How It Works</a>
        </div>
        <div class="navbar-actions">
          <div class="backend-status-badge ${AppData.isBackendConnected ? 'online' : 'offline'}" onclick="App.reconnectBackend()" title="${AppData.isBackendConnected ? 'Connected to HYT AI ATS Backend (Click to refresh)' : 'Operating in Offline Mode (Click to retry connection)'}">
            <span class="status-pulse-dot"></span>
            <span class="status-badge-text">${AppData.isBackendConnected ? 'Backend Online' : 'Offline Mode'}</span>
          </div>
          <button class="btn btn-primary" onclick="App.navigate('role-select')">
            Login
          </button>
        </div>
      </header>

      <!-- Main Landing Body -->
      <div style="max-width: 1200px; margin: 0 auto; padding: 40px 24px;">
        
        <!-- 1. Home / Hero Section -->
        <section id="home" style="display: flex; align-items: center; justify-content: space-between; gap: 40px; padding: 40px 0 60px; flex-wrap: wrap;">
          <div style="flex: 1.2; min-width: 280px;">
            <div class="badge badge-info" style="margin-bottom: 16px;">
              ${Icons.sparkles()} AI-Powered Recruitment Platform
            </div>
            <h1 style="font-size: clamp(32px, 5vw, 52px); font-weight: 800; line-height: 1.15; color: #111827; margin-bottom: 20px;">
              Find the Right<br>People. <span style="color: #4F46E5;">Belong<br>Together.</span>
            </h1>
            <p style="font-size: 18px; color: #64748B; margin-bottom: 32px; max-width: 480px;">
              Smarter job matching for candidates. Faster, fairer screening for recruiters.
            </p>
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              <button class="btn btn-primary btn-lg" onclick="LandingView.scrollTo('jobs')">
                Explore Jobs
              </button>
              <button class="btn btn-outline btn-lg" onclick="LandingView.scrollTo('about')">
                Learn More
              </button>
            </div>
          </div>

          <div style="flex: 1; min-width: 280px; display: flex; justify-content: center; position: relative;">
            <div style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-radius: 28px; padding: clamp(20px, 4vw, 40px); border: 1px solid #C7D2FE; width: 100%; max-width: 460px; text-align: center; box-shadow: var(--shadow-lg);">
              <div style="display: flex; justify-content: center; margin-bottom: 24px;">
                <div style="display: flex; justify-content: center;">
                  <div class="avatar-circle avatar-lg avatar-candidate" style="border: 3px solid white; z-index: 3;" title="Candidate: Akshada">A</div>
                  <div class="avatar-circle avatar-lg avatar-recruiter" style="border: 3px solid white; margin-left: -14px; z-index: 2;" title="Recruiter: Rohan">HR</div>
                  <div class="avatar-circle avatar-lg avatar-admin" style="border: 3px solid white; margin-left: -14px; z-index: 1;" title="Admin: System">AD</div>
                </div>
              </div>
              <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Deterministic Gates 0-8</h3>
              <p style="font-size: 14px; color: #64748B;">
                Zero-bias resume extraction, verified GitHub signals, and transparent scoring ledgers.
              </p>
              <div style="margin-top: 20px; display: inline-flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; color: #16A34A; border: 1px solid #86EFAC;">
                ${Icons.check(14)} 100% Deterministic Policy
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Counter Bar (Responsive) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); margin-bottom: 80px;">
          <div style="text-align: center; padding: 8px;">
            <div style="font-size: clamp(28px, 4vw, 36px); font-weight: 800; color: #4F46E5;">10K+</div>
            <div style="font-size: 14px; color: #64748B; font-weight: 500;">Active Jobs</div>
          </div>
          <div style="text-align: center; padding: 8px;">
            <div style="font-size: clamp(28px, 4vw, 36px); font-weight: 800; color: #4F46E5;">5K+</div>
            <div style="font-size: 14px; color: #64748B; font-weight: 500;">Companies</div>
          </div>
          <div style="text-align: center; padding: 8px;">
            <div style="font-size: clamp(28px, 4vw, 36px); font-weight: 800; color: #4F46E5;">100K+</div>
            <div style="font-size: 14px; color: #64748B; font-weight: 500;">Candidates</div>
          </div>
          <div style="text-align: center; padding: 8px;">
            <div style="font-size: clamp(28px, 4vw, 36px); font-weight: 800; color: #16A34A;">95%</div>
            <div style="font-size: 14px; color: #64748B; font-weight: 500;">Better Match</div>
          </div>
        </div>

        <!-- 2. About Section (Responsive) -->
        <section id="about" style="margin-bottom: 90px; text-align: center;">
          <h2 style="font-size: clamp(28px, 4vw, 36px); font-weight: 800; color: #111827; margin-bottom: 12px;">
            About <span style="color: #4F46E5;">HuntYourTribe</span>
          </h2>
          <p style="font-size: 16px; color: #64748B; max-width: 680px; margin: 0 auto 40px;">
            HuntYourTribe is a recruitment platform that connects talented candidates with the right opportunities using AI-powered resume screening and skill-based matching.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; text-align: left; margin-bottom: 32px;">
            <div class="card card-hover" style="padding: 28px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                ${Icons.users()}
              </div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">For Candidates</h3>
              <p style="font-size: 14px; color: #64748B;">
                Find jobs that match your skills and grow your career with clear, unclouded visibility into application status.
              </p>
            </div>

            <div class="card card-hover" style="padding: 28px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                ${Icons.briefcase()}
              </div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">For Recruiters</h3>
              <p style="font-size: 14px; color: #64748B;">
                Get high-quality candidates faster with AI screening, deterministic scoring weights, and clear requirement ledgers.
              </p>
            </div>

            <div class="card card-hover" style="padding: 28px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                ${Icons.barChart()}
              </div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">For a Fairer Future</h3>
              <p style="font-size: 14px; color: #64748B;">
                Skill-based, unbiased and transparent hiring verified by 0 fairness flips across 1,080 demographic permutations.
              </p>
            </div>
          </div>

          <!-- Mission Box -->
          <div style="background: white; border-radius: 16px; border: 1px solid var(--border); padding: 28px; display: flex; align-items: center; justify-content: space-between; text-align: left; gap: 24px; flex-wrap: wrap;">
            <div>
              <h4 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Our Mission</h4>
              <p style="font-size: 15px; color: #64748B; max-width: 600px;">
                To make hiring more meaningful, fair and efficient by combining human judgment with the precision and transparency of AI.
              </p>
            </div>
            <button class="btn btn-primary" onclick="App.navigate('role-select')">
              Get Started Now ${Icons.arrowRight()}
            </button>
          </div>
        </section>

        <!-- 3. How It Works Section (Responsive) -->
        <section id="how-it-works" style="margin-bottom: 90px;">
          <div style="text-align: center; margin-bottom: 48px;">
            <h2 style="font-size: clamp(28px, 4vw, 36px); font-weight: 800; color: #111827; margin-bottom: 12px;">How It Works</h2>
            <p style="font-size: 16px; color: #64748B;">A simple, streamlined process for candidates and recruiters</p>
          </div>

          <!-- Candidate Steps -->
          <div style="background: white; border-radius: 16px; border: 1px solid var(--border); padding: 28px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
              <span class="badge badge-info">${Icons.user()} For Candidates</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; position: relative;">
              <div style="text-align: center;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700;">1</div>
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">Explore Jobs</h4>
                <p style="font-size: 13px; color: #64748B;">Browse jobs that match your skills</p>
              </div>
              <div style="text-align: center;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700;">2</div>
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">Apply</h4>
                <p style="font-size: 13px; color: #64748B;">Submit your application in 1 click</p>
              </div>
              <div style="text-align: center;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700;">3</div>
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">AI Screening</h4>
                <p style="font-size: 13px; color: #64748B;">Your resume is analyzed with zero-bias gates</p>
              </div>
              <div style="text-align: center;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #16A34A; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700;">4</div>
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">Track Status</h4>
                <p style="font-size: 13px; color: #64748B;">See real-time progress on vertical timeline</p>
              </div>
            </div>
          </div>

          <!-- Recruiter Steps -->
          <div style="background: white; border-radius: 16px; border: 1px solid var(--border); padding: 32px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
              <span class="badge badge-indigo">${Icons.briefcase()} For Recruiters</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
              <div style="text-align: center;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700;">1</div>
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">Post a Job</h4>
                <p style="font-size: 13px; color: #64748B;">Add job description in a simple paragraph</p>
              </div>
              <div style="text-align: center;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700;">2</div>
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">AI Extracts Requirements</h4>
                <p style="font-size: 13px; color: #64748B;">We extract must-haves, nice-to-haves and years</p>
              </div>
              <div style="text-align: center;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700;">3</div>
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">Get Ranked Applicants</h4>
                <p style="font-size: 13px; color: #64748B;">View matching candidates ranked by fit score</p>
              </div>
              <div style="text-align: center;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #16A34A; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700;">4</div>
                <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">Make Decisions</h4>
                <p style="font-size: 13px; color: #64748B;">Shortlist, review or reject with clear evidence</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Public Jobs Section -->
        <section id="jobs" style="margin-bottom: 60px;">
          <div style="text-align: center; margin-bottom: 36px;">
            <h2 style="font-size: 36px; font-weight: 800; color: #111827; margin-bottom: 8px;">Explore Opportunities</h2>
            <p style="font-size: 16px; color: #64748B;">Find your next role from top companies</p>
          </div>

          <!-- Search & Filter Controls -->
          <div class="card" style="margin-bottom: 28px; padding: 18px 24px;">
            <div style="display: flex; gap: 12px; margin-bottom: 16px;">
              <div style="flex: 1; position: relative;">
                <input type="text" id="publicJobSearch" class="form-control" placeholder="Search for jobs, skills or companies..." style="padding-left: 38px;">
                <span style="position: absolute; left: 12px; top: 12px; color: #94A3B8;">${Icons.search()}</span>
              </div>
              <button class="btn btn-primary" onclick="LandingView.filterJobs()">Search</button>
            </div>

            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              <select id="publicFilterLocation" class="form-control" style="width: auto; min-width: 160px;" onchange="LandingView.filterJobs()">
                <option value="">Location (All)</option>
                <option value="Bangalore">Bangalore, India</option>
                <option value="Pune">Pune, India</option>
                <option value="Remote">Remote</option>
                <option value="Mumbai">Mumbai, India</option>
              </select>
              <select id="publicFilterType" class="form-control" style="width: auto; min-width: 160px;" onchange="LandingView.filterJobs()">
                <option value="">Job Type (All)</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <select id="publicFilterExp" class="form-control" style="width: auto; min-width: 160px;" onchange="LandingView.filterJobs()">
                <option value="">Experience (All)</option>
                <option value="0-2">0-2 years</option>
                <option value="2-5">2-5 years</option>
                <option value="3-6">3-6 years</option>
              </select>
            </div>
          </div>

          <!-- Jobs Grid -->
          <div id="publicJobsContainer" style="display: flex; flex-direction: column; gap: 16px;">
            ${LandingView.renderJobsList(AppData.getJobs())}
          </div>
        </section>

      </div>
    `;
  },

  renderJobsList(jobs) {
    if (!jobs || jobs.length === 0) {
      return `<div class="card" style="text-align: center; padding: 40px; color: #64748B;">No matching job postings found.</div>`;
    }

    return jobs.map(job => `
      <div class="card card-hover" style="display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; gap: 20px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 18px; min-width: 260px; flex: 1;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
            ${job.title.charAt(0)}
          </div>
          <div>
            <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px; color: #111827;">${job.title}</h3>
            <div style="font-size: 14px; color: #64748B; display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <span style="font-weight: 500;">${job.company}</span>
              <span>•</span>
              <span style="display: flex; align-items: center; gap: 4px;">${Icons.mapPin(14)} ${job.location}</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${(job.mustHaves || []).slice(0, 4).map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
          </div>
        </div>

        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
          <div style="font-size: 13px; color: #64748B;">
            <div style="display: flex; align-items: center; gap: 6px; justify-content: flex-end;">${Icons.clock(14)} ${job.jobType}</div>
            <div style="margin-top: 2px;">${job.experience}</div>
          </div>
          <div style="font-size: 12px; color: #94A3B8;">${job.postedDate || "Recently posted"}</div>
          <button class="btn btn-outline btn-sm" onclick="App.loginAsAndGo('candidate', 'jobs', '${job.id}')">
            View Details
          </button>
        </div>
      </div>
    `).join('');
  },

  filterJobs() {
    const q = (document.getElementById('publicJobSearch')?.value || '').toLowerCase();
    const loc = document.getElementById('publicFilterLocation')?.value || '';
    const type = document.getElementById('publicFilterType')?.value || '';
    const exp = document.getElementById('publicFilterExp')?.value || '';

    const allJobs = AppData.getJobs();
    const filtered = allJobs.filter(j => {
      const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.mustHaves || []).some(s => s.toLowerCase().includes(q));
      const matchLoc = !loc || j.location.includes(loc);
      const matchType = !type || j.jobType === type;
      const matchExp = !exp || j.experience.includes(exp);
      return matchQ && matchLoc && matchType && matchExp;
    });

    const cont = document.getElementById('publicJobsContainer');
    if (cont) {
      cont.innerHTML = LandingView.renderJobsList(filtered);
    }
  },

  scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  },

  // 5. Role Selection Page
  renderRoleSelect(container) {
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px;">
        <div style="margin-bottom: 32px; text-align: center; cursor: pointer;" onclick="App.navigate('landing')">
          <div style="display: inline-flex; align-items: center; gap: 12px;">
            ${Icons.logo(38)}
            <span style="font-size: 26px; font-weight: 800; color: #111827;">HuntYourTribe</span>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 8px;">Select Your Role</h1>
          <p style="font-size: 15px; color: #64748B;">Login to continue as</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; max-width: 900px; width: 100%; margin-bottom: 40px;">
          <!-- Candidate Role -->
          <div class="card card-hover" style="padding: 36px 28px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer;" onclick="App.openLogin('candidate')">
            <div>
              <div class="avatar-circle avatar-lg avatar-candidate" style="margin: 0 auto 20px;">
                ${Icons.user(28)}
              </div>
              <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Candidate</h3>
              <p style="font-size: 14px; color: #64748B; margin-bottom: 24px;">
                I want to explore jobs, apply, and monitor my screening status.
              </p>
            </div>
            <div>
              <div class="avatar-circle avatar-candidate" style="width: 40px; height: 40px; min-width: 40px; min-height: 40px; margin: 0 auto; background: #EEF2FF !important; color: #4F46E5 !important;">
                ${Icons.arrowRight(20)}
              </div>
            </div>
          </div>

          <!-- Recruiter Role (Featured) -->
          <div class="card card-hover" style="padding: 36px 28px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #059669; box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.18); cursor: pointer;" onclick="App.openLogin('recruiter')">
            <div>
              <div class="avatar-circle avatar-lg avatar-recruiter" style="margin: 0 auto 20px;">
                ${Icons.briefcase(28)}
              </div>
              <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Recruiter (HR)</h3>
              <p style="font-size: 14px; color: #64748B; margin-bottom: 24px;">
                I want to post jobs, review AI candidate extractions, and make hiring decisions.
              </p>
            </div>
            <div>
              <div class="avatar-circle avatar-recruiter" style="width: 40px; height: 40px; min-width: 40px; min-height: 40px; margin: 0 auto;">
                ${Icons.arrowRight(20)}
              </div>
            </div>
          </div>

          <!-- Admin Role -->
          <div class="card card-hover" style="padding: 36px 28px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #7C3AED; box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.15); cursor: pointer;" onclick="App.openLogin('admin')">
            <div>
              <div class="avatar-circle avatar-lg avatar-admin" style="margin: 0 auto 20px;">
                ${Icons.shield(28)}
              </div>
              <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Admin</h3>
              <p style="font-size: 14px; color: #64748B; margin-bottom: 24px;">
                I want to inspect live terminal pipeline gates, evaluation metrics, and fairness audits.
              </p>
            </div>
            <div>
              <div class="avatar-circle avatar-admin" style="width: 40px; height: 40px; min-width: 40px; min-height: 40px; margin: 0 auto;">
                ${Icons.arrowRight(20)}
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-outline" onclick="App.navigate('landing')">
          ${Icons.arrowLeft(16)} Back to Home
        </button>
      </div>
    `;
  },

  // 6. Login View with Role Selection
  renderLogin(container, defaultRole = "candidate") {
    let activeRole = defaultRole;

    const updateView = () => {
      const emailMap = {
        candidate: "akshada@example.com",
        recruiter: "hr@example.com",
        admin: "admin@huntyourtribe.com"
      };

      const titleMap = {
        candidate: "Login as Candidate",
        recruiter: "Login as Recruiter",
        admin: "Login as Admin"
      };

      const subheadMap = {
        candidate: "Login to your candidate account to track applications and apply to top roles.",
        recruiter: "Login to your recruiter account and continue hiring smarter with AI screening.",
        admin: "Login to your admin portal to monitor pipeline execution and model performance."
      };

      container.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F3FF; padding: 24px;">
          <div class="auth-card-container">
            
            <!-- Left Info Panel -->
            <div class="auth-card-left" style="flex: 1; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); padding: 48px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid var(--primary-border);">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 36px; cursor: pointer;" onclick="App.navigate('landing')">
                  ${Icons.logo(30)}
                  <span style="font-size: 20px; font-weight: 800; color: #111827;">HuntYourTribe</span>
                </div>
                <h2 style="font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 14px;">Welcome Back!</h2>
                <p style="font-size: 15px; color: #64748B; line-height: 1.6;">
                  ${subheadMap[activeRole]}
                </p>
              </div>

              <div style="background: white; border-radius: 14px; padding: 18px; border: 1px solid #C7D2FE;">
                <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #4F46E5; margin-bottom: 4px;">
                  ${Icons.shield(16)} Protected Zero-Bias Authentication
                </div>
                <div style="font-size: 12px; color: #64748B;">
                  Deterministic candidate masking and role-enforced API routes.
                </div>
              </div>
            </div>

            <!-- Right Form Panel -->
            <div class="auth-card-right" style="flex: 1.2; padding: 48px; display: flex; flex-direction: column; justify-content: center;">
              <h3 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 20px;">
                ${titleMap[activeRole]}
              </h3>

              <!-- Role Selector Pills -->
              <div style="display: flex; background: #F1F5F9; border-radius: 10px; padding: 4px; margin-bottom: 24px;">
                <button type="button" style="flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; ${activeRole === 'candidate' ? 'background: #4F46E5; color: white;' : 'color: #64748B;'}" onclick="LandingView.switchLoginRole('candidate')">
                  Candidate
                </button>
                <button type="button" style="flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; ${activeRole === 'recruiter' ? 'background: #4F46E5; color: white;' : 'color: #64748B;'}" onclick="LandingView.switchLoginRole('recruiter')">
                  Recruiter
                </button>
                <button type="button" style="flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; ${activeRole === 'admin' ? 'background: #4F46E5; color: white;' : 'color: #64748B;'}" onclick="LandingView.switchLoginRole('admin')">
                  Admin
                </button>
              </div>

              <!-- Form -->
              <form id="loginForm" onsubmit="LandingView.handleLogin(event, '${activeRole}')">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" id="loginEmail" class="form-control" value="${emailMap[activeRole]}" required>
                </div>

                <div class="form-group">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label class="form-label" style="margin-bottom: 0;">Password</label>
                    <a href="#" style="font-size: 12px;" onclick="App.showToast('Password reset link sent to registered email', 'warning'); return false;">Forgot password?</a>
                  </div>
                  <input type="password" id="loginPassword" class="form-control" value="••••••••" required>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 8px;">
                  Login
                </button>
              </form>

              <div style="text-align: center; margin: 20px 0 16px; font-size: 13px; color: #94A3B8;">
                or continue with
              </div>

              <div style="display: flex; gap: 12px;">
                <button class="btn btn-outline" style="flex: 1; font-size: 13px;" onclick="LandingView.handleSocialLogin('${activeRole}', 'Google')">
                  Google
                </button>
                <button class="btn btn-outline" style="flex: 1; font-size: 13px;" onclick="LandingView.handleSocialLogin('${activeRole}', 'GitHub')">
                  GitHub
                </button>
              </div>

              <div style="text-align: center; margin-top: 24px; font-size: 13px; color: #64748B;">
                Don't have an account? <a href="#" onclick="App.showToast('Please contact administrator for enterprise access', 'info'); return false;">Contact Admin</a>
              </div>
            </div>

          </div>
        </div>
      `;
    };

    LandingView.switchLoginRole = (newRole) => {
      activeRole = newRole;
      updateView();
    };

    updateView();
  },

  handleLogin(event, role) {
    event.preventDefault();
    AppData.setRole(role);
    App.showToast(`Logged in successfully as ${role.toUpperCase()}!`, "success");
    App.navigate("dashboard");
  },

  handleSocialLogin(role, provider) {
    AppData.setRole(role);
    App.showToast(`Authenticated via ${provider} as ${role.toUpperCase()}`, "success");
    App.navigate("dashboard");
  }
};

window.LandingView = LandingView;

