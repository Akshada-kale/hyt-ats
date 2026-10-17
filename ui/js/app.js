/**
 * HuntYourTribe (HYT ATS) - Core Application Controller & Router
 * Assembles Top Navbar, Role-Specific Sidebar, Toast System, and View Dispatcher.
 */

const App = {
  currentRoute: "landing",
  currentParams: {},

  async init() {
    // Sync state with backend on startup
    await AppData.syncWithBackend();

    // Check initial route from hash or default to landing
    const hash = window.location.hash.replace("#/", "") || "landing";
    App.navigate(hash);
  },

  navigate(route, params = {}) {
    App.currentRoute = route;
    App.currentParams = params;
    window.location.hash = `#/${route}`;
    App.closeMobileSidebar();

    const appRoot = document.getElementById("appRoot");
    if (!appRoot) return;

    // Public / Unauthenticated Views (No Sidebar)
    if (route === "landing") {
      LandingView.render(appRoot);
      return;
    }
    if (route === "role-select") {
      LandingView.renderRoleSelect(appRoot);
      return;
    }
    if (route === "login") {
      LandingView.renderLogin(appRoot, params.role || "candidate");
      return;
    }

    // Authenticated Views: Render App Shell (Navbar + Sidebar + Content Area)
    App.renderShell(appRoot);
    App.renderRouteContent();
  },

  openLogin(role) {
    App.navigate("login", { role });
  },

  loginAsAndGo(role, target, paramId) {
    AppData.setRole(role);
    if (target === "jobs") {
      App.navigate("candidate-job-detail", { jobId: paramId });
    } else {
      App.navigate("dashboard");
    }
  },

  renderShell(container) {
    const role = AppData.getRole();
    const user = AppData.getCurrentUser();

    container.innerHTML = `
      <!-- Top Navigation Bar -->
      <header class="top-navbar">
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="nav-toggle-btn" onclick="App.toggleMobileSidebar()" title="Toggle Navigation">
            ${Icons.menu(20)}
          </button>
          <div class="navbar-brand" onclick="App.navigate('dashboard')">
            ${Icons.logo(30)}
            <span>HuntYourTribe</span>
          </div>
        </div>

        <div class="navbar-search">
          <input type="text" placeholder="Search jobs, candidates..." onkeydown="if(event.key==='Enter') App.showToast('Searching system records...', 'info')">
          <span class="search-icon">${Icons.search(16)}</span>
        </div>

        <div class="navbar-actions">
          <!-- Backend Connection Status Indicator Badge -->
          <div class="backend-status-badge ${AppData.isBackendConnected ? 'online' : 'offline'}" onclick="App.reconnectBackend()" title="${AppData.isBackendConnected ? 'Connected to HYT AI ATS Backend (Click to refresh)' : 'Operating in Offline Mode (Click to retry connection)'}">
            <span class="status-pulse-dot"></span>
            <span class="status-badge-text">${AppData.isBackendConnected ? 'Backend Online' : 'Offline Mode'}</span>
          </div>

          <!-- Role Switcher Quick Dropdown -->
          <div class="role-selector-wrapper">
            <span class="role-label">Role:</span>
            <select class="form-control role-select-dropdown" onchange="App.switchRole(this.value)">
              <option value="candidate" ${role === 'candidate' ? 'selected' : ''}>Candidate (${(AppData.state.currentUser && AppData.state.currentUser.candidate && AppData.state.currentUser.candidate.name) ? AppData.state.currentUser.candidate.name.split(' ')[0] : 'Candidate'})</option>
              <option value="recruiter" ${role === 'recruiter' ? 'selected' : ''}>Recruiter (Rohan)</option>
              <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin (System)</option>
            </select>
          </div>

          <button class="btn btn-outline btn-sm nav-bell-btn" style="border-radius: 50%; width: 36px; height: 36px; padding: 0;" onclick="App.showToast('All notifications read', 'info')">
            ${Icons.bell(18)}
          </button>

          <!-- User Profile Dropdown -->
          <div class="user-profile-menu" onclick="App.showProfileMenu(event)">
            <div class="avatar-circle avatar-${role}">
              ${role === 'candidate' ? (user.name ? user.name.charAt(0).toUpperCase() : 'C') : (role === 'recruiter' ? 'HR' : 'AD')}
            </div>
            <div class="user-profile-info">
              <div class="user-name">${user.name}</div>
              <div class="user-role-badge">${role === 'candidate' ? 'Candidate' : (role === 'recruiter' ? 'Recruiter' : 'Admin')}</div>
            </div>
            <button class="btn-logout" title="Logout" onclick="event.stopPropagation(); App.logout()">
              ${Icons.logOut(16)}
            </button>
          </div>
        </div>
      </header>

      <!-- App Body (Sidebar + Backdrop + Content) -->
      <div class="app-container">
        <!-- Mobile Sidebar Backdrop -->
        <div id="sidebarBackdrop" class="sidebar-backdrop" onclick="App.closeMobileSidebar()"></div>

        <aside class="sidebar" id="appSidebar">
          <div class="sidebar-nav">
            ${App.renderSidebarLinks(role)}
          </div>

          <div class="sidebar-footer">
            <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">HuntYourTribe ATS v2.4</div>
            <button class="sidebar-link" style="width: 100%; border: none; background: none; justify-content: flex-start; color: #DC2626;" onclick="App.logout()">
              ${Icons.logOut(16)}
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main class="main-content" id="mainContentArea">
          <!-- Dynamic Route Content Injected Here -->
        </main>
      </div>
    `;
  },

  renderSidebarLinks(role) {
    const r = App.currentRoute;

    if (role === "candidate") {
      return `
        <a class="sidebar-link ${r === 'dashboard' || r === 'candidate-dashboard' ? 'active' : ''}" onclick="App.navigate('dashboard')">
          ${Icons.dashboard()} <span>Dashboard</span>
        </a>
        <a class="sidebar-link ${r === 'candidate-browse' || r === 'candidate-job-detail' ? 'active' : ''}" onclick="App.navigate('candidate-browse')">
          ${Icons.briefcase()} <span>Browse Jobs</span>
        </a>
        <a class="sidebar-link ${r === 'candidate-applications' || r === 'candidate-app-detail' ? 'active' : ''}" onclick="App.navigate('candidate-applications')">
          ${Icons.fileText()} <span>My Applications</span>
        </a>
        <a class="sidebar-link ${r === 'candidate-profile' ? 'active' : ''}" onclick="App.navigate('candidate-profile')">
          ${Icons.user()} <span>Profile</span>
        </a>
      `;
    }

    if (role === "recruiter") {
      return `
        <a class="sidebar-link ${r === 'dashboard' || r === 'recruiter-dashboard' ? 'active' : ''}" onclick="App.navigate('dashboard')">
          ${Icons.dashboard()} <span>Dashboard</span>
        </a>
        <a class="sidebar-link ${r === 'recruiter-post-job' ? 'active' : ''}" onclick="App.navigate('recruiter-post-job')">
          ${Icons.plusCircle()} <span>Post a Job</span>
        </a>
        <a class="sidebar-link ${r === 'recruiter-manage-jobs' ? 'active' : ''}" onclick="App.navigate('recruiter-manage-jobs')">
          ${Icons.briefcase()} <span>Manage Jobs</span>
        </a>
        <a class="sidebar-link ${r === 'recruiter-applicants' || r === 'recruiter-candidate-review' ? 'active' : ''}" onclick="App.navigate('recruiter-applicants')">
          ${Icons.users()} <span>Applicants</span>
        </a>
        <a class="sidebar-link" onclick="App.navigate('recruiter-applicants', { filter: 'Human Review' })">
          ${Icons.clock()} <span>Human Review</span>
        </a>
        <a class="sidebar-link" onclick="App.navigate('recruiter-applicants', { filter: 'Shortlisted' })">
          ${Icons.userCheck()} <span>Shortlisted</span>
        </a>
        <a class="sidebar-link" onclick="App.navigate('recruiter-applicants', { filter: 'Rejected' })">
          ${Icons.userX()} <span>Rejected</span>
        </a>
      `;
    }

    if (role === "admin") {
      return `
        <a class="sidebar-link ${r === 'dashboard' || r === 'admin-dashboard' ? 'active' : ''}" onclick="App.navigate('dashboard')">
          ${Icons.dashboard()} <span>Dashboard</span>
        </a>
        <a class="sidebar-link ${r === 'admin-console' ? 'active' : ''}" onclick="App.navigate('admin-console')">
          ${Icons.terminal()} <span>Pipeline Console</span>
        </a>
        <a class="sidebar-link ${r === 'admin-logs' ? 'active' : ''}" onclick="App.navigate('admin-logs')">
          ${Icons.fileText()} <span>Pipeline Logs</span>
        </a>
        <a class="sidebar-link ${r === 'admin-integrity' ? 'active' : ''}" onclick="App.navigate('admin-integrity')">
          ${Icons.shield()} <span>Integrity & Quarantine</span>
        </a>
        <a class="sidebar-link ${r === 'admin-evaluation' ? 'active' : ''}" onclick="App.navigate('admin-evaluation')">
          ${Icons.barChart()} <span>Evaluation & Fairness</span>
        </a>
        <a class="sidebar-link ${r === 'admin-policy' ? 'active' : ''}" onclick="App.navigate('admin-policy')">
          ${Icons.sliders()} <span>Decision Policy</span>
        </a>
        <a class="sidebar-link ${r === 'admin-users' ? 'active' : ''}" onclick="App.navigate('admin-users')">
          ${Icons.gitBranch()} <span>Users & Audit Log</span>
        </a>
      `;
    }

    return '';
  },

  renderRouteContent() {
    const cont = document.getElementById("mainContentArea");
    if (!cont) return;

    const route = App.currentRoute;
    const role = AppData.getRole();
    const params = App.currentParams;

    // Role Root Dashboard
    if (route === "dashboard") {
      if (role === "candidate") CandidateView.renderDashboard(cont);
      else if (role === "recruiter") RecruiterView.renderDashboard(cont);
      else if (role === "admin") AdminView.renderDashboard(cont);
      return;
    }

    // Candidate Routes
    if (route === "candidate-dashboard") CandidateView.renderDashboard(cont);
    else if (route === "candidate-browse") CandidateView.renderBrowseJobs(cont);
    else if (route === "candidate-job-detail") CandidateView.renderJobDetail(cont, params);
    else if (route === "candidate-applications") CandidateView.renderApplications(cont, params);
    else if (route === "candidate-app-detail") CandidateView.renderAppDetail(cont, params);
    else if (route === "candidate-profile") CandidateView.renderProfile(cont);

    // Recruiter Routes
    else if (route === "recruiter-dashboard") RecruiterView.renderDashboard(cont);
    else if (route === "recruiter-post-job") RecruiterView.renderPostJob(cont);
    else if (route === "recruiter-manage-jobs") RecruiterView.renderManageJobs(cont);
    else if (route === "recruiter-applicants") RecruiterView.renderApplicants(cont, params);
    else if (route === "recruiter-candidate-review") RecruiterView.renderCandidateReview(cont, params);

    // Admin Routes
    else if (route === "admin-dashboard") AdminView.renderDashboard(cont);
    else if (route === "admin-console" || route === "admin-logs") {
      AdminView.renderDashboard(cont);
      AdminView.switchDetailTab('logs');
    }
    else if (route === "admin-integrity") {
      AdminView.renderDashboard(cont);
      AdminView.switchDetailTab('integrity');
    }
    else if (route === "admin-evaluation") AdminView.renderEvaluation(cont);
    else if (route === "admin-policy") AdminView.renderPolicy(cont);
    else if (route === "admin-users") AdminView.renderUsers(cont);
  },

  switchRole(newRole) {
    AppData.setRole(newRole);
    App.showToast(`Switched active workspace to ${newRole.toUpperCase()}`, "info");
    App.navigate("dashboard");
  },

  toggleMobileSidebar() {
    const sb = document.getElementById('appSidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (sb) sb.classList.toggle('mobile-open');
    if (bd) bd.classList.toggle('active');
  },

  closeMobileSidebar() {
    const sb = document.getElementById('appSidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (sb) sb.classList.remove('mobile-open');
    if (bd) bd.classList.remove('active');
  },

  logout() {
    App.closeMobileSidebar();
    App.showToast("Logged out successfully", "info");
    App.navigate("landing");
  },

  showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? Icons.check(16) : (type === 'warning' ? Icons.alertTriangle(16) : Icons.bell(16))}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  async reconnectBackend() {
    App.showToast("Syncing with HYT ATS Backend API...", "info");
    const ok = await AppData.syncWithBackend();
    const appRoot = document.getElementById("appRoot");
    if (App.currentRoute !== "landing" && App.currentRoute !== "role-select" && App.currentRoute !== "login") {
      App.renderShell(appRoot);
      App.renderRouteContent();
    }
    if (ok) {
      App.showToast("Connected to HYT ATS AI Engine! Live data synchronized.", "success");
    } else {
      App.showToast("Backend server not detected at localhost:8000. Operating in offline mode.", "warning");
    }
  },

  openPdfModal(filename = "riya_sharma.pdf", title = "Document Preview") {
    const cleanName = filename ? filename.split("/").pop().split("\\").pop() : "riya_sharma.pdf";
    const pdfUrl = `/api/pdf/view?file=${encodeURIComponent(cleanName)}`;
    const downloadUrl = `/api/pdf/download?file=${encodeURIComponent(cleanName)}&download=1`;

    const existingModal = document.getElementById("globalPdfModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "globalPdfModal";
    modal.className = "modal-backdrop";
    modal.style.zIndex = "9999";
    modal.onclick = (e) => {
      if (e.target === modal) App.closePdfModal();
    };

    modal.innerHTML = `
      <div class="modal-content modal-full" style="max-width: 1200px; width: 95vw; height: 90vh; display: flex; flex-direction: column; padding: 22px; border-radius: 16px; background: #FFFFFF; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);" onclick="event.stopPropagation()">
        <div class="modal-header" style="margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center;">
              ${Icons.fileText(22)}
            </div>
            <div>
              <h3 style="font-size: 18px; font-weight: 800; color: #111827; margin: 0;">${title}</h3>
              <div style="font-size: 12px; color: #64748B; font-family: var(--font-mono); margin-top: 2px; display: flex; align-items: center; gap: 8px;">
                <span>File: <strong>${cleanName}</strong></span>
                <span class="badge badge-indigo" style="font-size: 10px;">PDF Document</span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div class="btn-group" style="display: flex; background: #F1F5F9; padding: 3px; border-radius: 8px; border: 1px solid var(--border);">
              <button id="pdfTabVisualBtn" class="btn btn-sm btn-primary" onclick="App.switchPdfModalTab('visual', '${cleanName}')">
                ${Icons.eye(14)} PDF Viewer
              </button>
              <button id="pdfTabTextBtn" class="btn btn-sm btn-outline" style="border: none; background: transparent;" onclick="App.switchPdfModalTab('text', '${cleanName}')">
                ${Icons.code(14)} Extracted Text
              </button>
            </div>
            <a href="${pdfUrl}" target="_blank" class="btn btn-outline btn-sm" title="Open in new dedicated window">
              ${Icons.externalLink(14)} New Tab
            </a>
            <a href="${downloadUrl}" class="btn btn-outline btn-sm" download="${cleanName}" title="Download original PDF file">
              ${Icons.download(14)} Download
            </a>
            <button class="btn btn-outline btn-sm" style="border-radius: 50%; width: 34px; height: 34px; padding: 0;" onclick="App.closePdfModal()" title="Close Preview">
              ${Icons.x(16)}
            </button>
          </div>
        </div>

        <div style="flex: 1; min-height: 0; position: relative; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: #525659;">
          <!-- Visual PDF Iframe View -->
          <iframe id="pdfModalIframe" src="${pdfUrl}#toolbar=1&navpanes=0" style="width: 100%; height: 100%; border: none; background: #525659;"></iframe>
          
          <!-- Extracted Text View (Fallback / Alternative) -->
          <div id="pdfModalTextView" style="display: none; width: 100%; height: 100%; overflow-y: auto; background: #0D1117; color: #E6EDF3; padding: 24px; font-family: var(--font-mono); font-size: 13px; line-height: 1.6; white-space: pre-wrap;">
            Loading parsed layout text from Gate 1...
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  closePdfModal() {
    const m = document.getElementById("globalPdfModal");
    if (m) m.remove();
  },

  async switchPdfModalTab(tab, filename) {
    const ifr = document.getElementById("pdfModalIframe");
    const txt = document.getElementById("pdfModalTextView");
    const vBtn = document.getElementById("pdfTabVisualBtn");
    const tBtn = document.getElementById("pdfTabTextBtn");

    if (tab === "visual") {
      if (ifr) ifr.style.display = "block";
      if (txt) txt.style.display = "none";
      if (vBtn) { vBtn.className = "btn btn-sm btn-primary"; vBtn.style.background = ""; }
      if (tBtn) { tBtn.className = "btn btn-sm btn-outline"; tBtn.style.border = "none"; tBtn.style.background = "transparent"; }
    } else {
      if (ifr) ifr.style.display = "none";
      if (txt) txt.style.display = "block";
      if (vBtn) { vBtn.className = "btn btn-sm btn-outline"; vBtn.style.border = "none"; vBtn.style.background = "transparent"; }
      if (tBtn) { tBtn.className = "btn btn-sm btn-primary"; }

      txt.innerText = "Extracting layout text from backend (Gate 1)...";
      try {
        const res = await AppData.apiCall(`/api/resume/content?file=${encodeURIComponent(filename)}`);
        if (res && res.content) {
          txt.innerText = res.content;
        } else {
          txt.innerText = "No raw text extracted for this document.";
        }
      } catch (e) {
        txt.innerText = "Error loading text content: " + e.message;
      }
    }
  }
};

// Bootstrap app on DOM load
window.addEventListener("DOMContentLoaded", () => {
  App.init();
});
