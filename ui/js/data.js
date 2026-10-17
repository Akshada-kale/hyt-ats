/**
 * HuntYourTribe (HYT ATS) - Unified Data Layer
 * Backed by actual data from data/jds, eval_results.json, and recruiter_human_labels.csv.
 * Supports persistent localStorage state with graceful server API sync.
 */

const STORAGE_KEY = "HYT_ATS_STATE_V1";

const DEFAULT_STATE = {
  activeRole: "candidate", // candidate | recruiter | admin
  currentUser: {
    candidate: {
      id: "aksada",
      name: "Akshada Kale",
      email: "akshada@example.com",
      avatar: "A",
      phone: "+91 98765 43210",
      education: "B.Tech in Computer Science, XYZ University (2022 - 2026)",
      location: "Pune, India",
      github: "https://github.com/Akshada-kale",
      about: "Passionate software engineer with hands-on experience in full-stack web development, React, Node.js, and MongoDB. Enthusiastic about creating clean user interfaces and scalable APIs.",
      skills: ["JavaScript", "React", "Node.js", "Python", "MongoDB", "Express.js", "HTML5", "CSS3", "Git"],
      resumeFile: "Akshada_Kale_Resume.pdf",
      resumeSize: "450 KB",
      lastUpdated: "Oct 14, 2026"
    },
    recruiter: {
      id: "rohan_hr",
      name: "Rohan",
      role: "HR Recruiter",
      email: "hr@example.com",
      avatar: "HR",
      company: "TechCorp"
    },
    admin: {
      id: "admin_sys",
      name: "Admin",
      role: "System Admin",
      email: "admin@huntyourtribe.com",
      avatar: "AD"
    }
  },

  // Jobs catalog (Derived from data/jds/*.json)
  jobs: [
    {
      id: "2234533717",
      title: "Full Stack Software Engineer",
      company: "TechCorp",
      location: "Bangalore, India",
      jobType: "Full-time",
      experience: "2-5 years",
      postedDate: "Oct 10, 2026",
      status: "Open",
      applicantsCount: 128,
      shortlistedCount: 18,
      reviewCount: 42,
      rejectedCount: 68,
      overview: "We are looking for a Full Stack Software Engineer to build and maintain web applications. You will work on frontend and backend features, integrate APIs, collaborate with cross-functional teams, and deploy applications on cloud platforms. Experience with React, Node.js, MongoDB, AWS, and CI/CD is preferred.",
      mustHaves: [
        "JavaScript", "React", "Node.js", "MongoDB", "REST APIs",
        "AWS", "Git", "CI/CD", "Problem Solving"
      ],
      niceToHaves: [
        "Docker", "TypeScript", "Express.js", "PostgreSQL", "System Design"
      ]
    },
    {
      id: "3586167732",
      title: "Backend Developer",
      company: "DataWorks",
      location: "Pune, India",
      jobType: "Full-time",
      experience: "2-4 years",
      postedDate: "Oct 8, 2026",
      status: "Open",
      applicantsCount: 56,
      shortlistedCount: 12,
      reviewCount: 18,
      rejectedCount: 26,
      overview: "Join our data infrastructure team to engineer high-throughput backend services and streaming pipelines. Requires strong Python, Django, and PostgreSQL capabilities with real-time distributed data handling.",
      mustHaves: ["Python", "Django", "PostgreSQL", "REST APIs", "Redis", "Docker"],
      niceToHaves: ["Kafka", "Kubernetes", "AWS", "Celery"]
    },
    {
      id: "3887497535",
      title: "Frontend Developer",
      company: "Webify",
      location: "Remote",
      jobType: "Full-time",
      experience: "0-2 years",
      postedDate: "Oct 5, 2026",
      status: "Open",
      applicantsCount: 42,
      shortlistedCount: 8,
      reviewCount: 14,
      rejectedCount: 20,
      overview: "Passionate about modern web interfaces? Build responsive, accessible, and delightful experiences with React, TypeScript, and modern CSS frameworks.",
      mustHaves: ["React", "TypeScript", "Tailwind", "CSS3", "HTML5", "Git"],
      niceToHaves: ["Next.js", "Framer Motion", "Jest", "GraphQL"]
    },
    {
      id: "3886458575",
      title: "Product Manager",
      company: "InnovateX",
      location: "Mumbai, India",
      jobType: "Full-time",
      experience: "1-3 years",
      postedDate: "Oct 1, 2026",
      status: "Closed",
      applicantsCount: 38,
      shortlistedCount: 5,
      reviewCount: 15,
      rejectedCount: 18,
      overview: "Drive the roadmap for AI-native consumer SaaS products from discovery to launch with strong analytical and cross-functional leadership.",
      mustHaves: ["Product Roadmap", "Agile", "User Research", "Data Analytics", "SQL"],
      niceToHaves: ["Figma", "A/B Testing", "Jira", "Growth Hacking"]
    },
    {
      id: "3891267064",
      title: "DevOps Engineer",
      company: "CloudTech",
      location: "Remote",
      jobType: "Full-time",
      experience: "3-6 years",
      postedDate: "Sep 28, 2026",
      status: "Open",
      applicantsCount: 25,
      shortlistedCount: 6,
      reviewCount: 8,
      rejectedCount: 11,
      overview: "Design resilient multi-region infrastructure on AWS using Terraform and maintain zero-downtime CI/CD deployment pipelines.",
      mustHaves: ["AWS", "Terraform", "Kubernetes", "Docker", "CI/CD", "Linux"],
      niceToHaves: ["Ansible", "Prometheus", "Python", "ArgoCD"]
    },
    {
      id: "3900940733",
      title: "UI/UX Designer",
      company: "DesignStudio",
      location: "Bangalore, India",
      jobType: "Full-time",
      experience: "2-5 years",
      postedDate: "Sep 20, 2026",
      status: "Closed",
      applicantsCount: 18,
      shortlistedCount: 4,
      reviewCount: 6,
      rejectedCount: 8,
      overview: "Craft elegant and intuitive digital experiences, design systems, and wireframes for web and mobile recruitment software.",
      mustHaves: ["Figma", "UI Design", "Design Systems", "Prototyping", "User Research"],
      niceToHaves: ["CSS/HTML", "Motion Design", "Micro-interactions"]
    }
  ],

  // Candidate's own applications list (Candidate view)
  candidateApplications: [
    {
      id: "APP-2234-AK01",
      jobId: "2234533717",
      jobTitle: "Full Stack Software Engineer",
      company: "TechCorp",
      status: "Under Review", // "Shortlisted" | "Under Review" | "Not Shortlisted"
      appliedDate: "Oct 14, 2026",
      timeline: [
        { title: "Application Submitted", timestamp: "Oct 14, 2026, 09:10 AM", status: "completed", note: "Application received and registered." },
        { title: "Resume Screening (AI)", timestamp: "Oct 14, 2026, 09:45 AM", status: "completed", note: "Deterministic Gates 0-8 executed successfully." },
        { title: "Under Human Review", timestamp: "Oct 15, 2026, 02:20 PM", status: "active", note: "Your application is currently being examined by the hiring team." },
        { title: "Final Decision", timestamp: "Pending", status: "pending", note: "Will be updated upon recruiter review completion." }
      ]
    },
    {
      id: "APP-3887-AK02",
      jobId: "3887497535",
      jobTitle: "Frontend Developer",
      company: "Webify",
      status: "Shortlisted",
      appliedDate: "Oct 10, 2026",
      timeline: [
        { title: "Application Submitted", timestamp: "Oct 10, 2026, 09:10 AM", status: "completed" },
        { title: "Resume Screening (AI)", timestamp: "Oct 10, 2026, 09:45 AM", status: "completed" },
        { title: "Under Human Review", timestamp: "Oct 11, 2026, 11:30 AM", status: "completed" },
        { title: "Final Decision", timestamp: "Oct 12, 2026, 09:00 AM", status: "completed", note: "Congratulations! You have been shortlisted for this role." }
      ]
    },
    {
      id: "APP-3586-AK03",
      jobId: "3586167732",
      jobTitle: "Data Analyst",
      company: "DataWorks",
      status: "Not Shortlisted",
      appliedDate: "Oct 5, 2026",
      timeline: [
        { title: "Application Submitted", timestamp: "Oct 05, 2026, 10:00 AM", status: "completed" },
        { title: "Resume Screening (AI)", timestamp: "Oct 05, 2026, 10:15 AM", status: "completed" },
        { title: "Final Decision", timestamp: "Oct 06, 2026, 04:30 PM", status: "completed", note: "Position closed. Thank you for your interest." }
      ]
    },
    {
      id: "APP-3886-AK04",
      jobId: "3886458575",
      jobTitle: "Product Manager",
      company: "InnovateX",
      status: "Under Review",
      appliedDate: "Sep 28, 2026",
      timeline: [
        { title: "Application Submitted", timestamp: "Sep 28, 2026, 02:00 PM", status: "completed" },
        { title: "Resume Screening (AI)", timestamp: "Sep 28, 2026, 02:30 PM", status: "completed" },
        { title: "Under Human Review", timestamp: "Sep 29, 2026, 10:00 AM", status: "active" },
        { title: "Final Decision", timestamp: "Pending", status: "pending" }
      ]
    },
    {
      id: "APP-3891-AK05",
      jobId: "3891267064",
      jobTitle: "DevOps Engineer",
      company: "CloudTech",
      status: "Not Shortlisted",
      appliedDate: "Sep 20, 2026",
      timeline: [
        { title: "Application Submitted", timestamp: "Sep 20, 2026, 11:00 AM", status: "completed" },
        { title: "Resume Screening (AI)", timestamp: "Sep 20, 2026, 11:20 AM", status: "completed" },
        { title: "Final Decision", timestamp: "Sep 21, 2026, 03:00 PM", status: "completed" }
      ]
    }
  ],

  // Candidates roster for Recruiter & Admin
  candidates: [
    {
      id: "c_rahul",
      candidateId: "rahul_sharma",
      name: "Rahul Sharma",
      degree: "2 yrs - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 11, 2026",
      fitScore: 90.1,
      decision: "AUTO_ADVANCE",
      statusLabel: "Shortlisted",
      skillsMatch: "15/16",
      email: "r*******@gmail.com",
      phone: "+91 98******12",
      github: "@rahul-dev",
      location: "Bangalore, India",
      breakdown: {
        technical: 92.0,
        experience: 88.0,
        seniority: 90.0,
        education: 100.0,
        location: 100.0,
        weightedTotal: 90.1
      },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "Excellent technical alignment across modern full-stack stack and verified GitHub portfolio.",
      ruleTriggered: "Gate 7 - Condition 1 (High Score >= 75.0)",
      matchedSkills: ["JavaScript", "React", "Node.js", "MongoDB", "Express.js", "AWS", "Git", "REST APIs", "CI/CD"],
      missingSkills: ["System Design"]
    },
    {
      id: "c_neha",
      candidateId: "neha_gupta",
      name: "Neha Gupta",
      degree: "2 yrs - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 11, 2026",
      fitScore: 78.4,
      decision: "AUTO_ADVANCE",
      statusLabel: "Shortlisted",
      skillsMatch: "13/16",
      email: "n*******@gmail.com",
      phone: "+91 97******44",
      github: "@nehagupta",
      location: "Delhi, India",
      breakdown: {
        technical: 82.5,
        experience: 75.0,
        seniority: 70.0,
        education: 100.0,
        location: 80.0,
        weightedTotal: 78.4
      },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "Solid React and backend competencies with strong open-source contribution record.",
      ruleTriggered: "Gate 7 - Condition 1 (Score >= 75.0)",
      matchedSkills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Git", "REST APIs"],
      missingSkills: ["AWS", "Docker"]
    },
    {
      id: "c_aksada",
      candidateId: "aksada",
      name: "Akshada Kale",
      degree: "2 yrs - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 10, 2026",
      fitScore: 42.6,
      decision: "ESCALATE",
      statusLabel: "Human Review",
      skillsMatch: "8/16",
      email: "********@gmail.com",
      phone: "*******90",
      github: "@Akshada-kale",
      location: "Bangalore, India",
      breakdown: {
        technical: 55.3,
        experience: 8.3,
        seniority: 40.0,
        education: 100.0,
        location: 100.0,
        weightedTotal: 42.62
      },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      unverifiedRatio: "66.7%",
      githubLanguages: ["HTML", "Java", "JavaScript", "CSS", "Python"],
      privacyRedaction: "1 email, 1 phone, 1 URL (Name masked)",
      reason: "Ambiguous fit. Human judgment required.",
      ruleTriggered: "Gate 7 - Condition 5 (Mid-Range)",
      assessment: {
        strengths: "The candidate demonstrates verified proficiency in JavaScript/TypeScript, React, Node.js, Express.js, and MongoDB, evidenced by the development of full-stack features for web applications.",
        gaps: "Critical experience deficits exist in responsive design principles, AWS, Azure, Google Cloud Platform, testing, and CI/CD pipelines, all of which are flagged as hard failures.",
        interviewFocus: "Assess ability to implement responsive design principles and familiarity with cloud deployment strategies on AWS or Azure."
      },
      matchedRequirements: [
        { req: "JavaScript", evidence: "'React.js, JavaScript' (Projects)", conf: 0.95 },
        { req: "Node.js", evidence: "'Node.js, Express.js' (Projects)", conf: 0.92 },
        { req: "MongoDB", evidence: "'MongoDB' (Projects)", conf: 0.90 },
        { req: "Full-Stack Development", evidence: "'Developed full-stack web applications'", conf: 0.88 }
      ],
      missingRequirements: [
        { req: "Responsive Design", evidence: "Not found in resume", conf: 0.00 },
        { req: "AWS", evidence: "Not mentioned", conf: 0.00 },
        { req: "CI/CD", evidence: "Not mentioned", conf: 0.00 },
        { req: "Testing", evidence: "No testing tools/experience", conf: 0.00 }
      ],
      gatesOutput: [
        { gate: 0, name: "Integrity Shield", status: "Passed (0 flags)", time: "22:04:22", pass: true },
        { gate: 1, name: "Layout Extraction", status: "Extracted 4509 characters (1 page)", time: "22:04:22", pass: true },
        { gate: 2, name: "Privacy Shield", status: "Redacted 1 email, 1 phone, 1 URL. Name masked: True.", time: "22:04:22", pass: true },
        { gate: 3, name: "Structured Extraction", status: "Cache HIT (resume parsed)", time: "22:04:22", pass: true },
        { gate: 4, name: "Verification Engine", status: "GitHub verified, 0 flags", time: "22:04:22", pass: true },
        { gate: 5, name: "Domain Pre-Filter", status: "Similarity 1.00 >= 0.30", time: "22:04:33", pass: true },
        { gate: 6, name: "Deterministic Scoring", status: "Score = 42.62 (tech=55.3, exp=8.3, sen=40.0)", time: "22:04:33", pass: true },
        { gate: 7, name: "Decision Policy", status: "Condition 5 -> ESCALATE", time: "22:04:33", pass: true },
        { gate: 8, name: "Explanation (LLM)", status: "Generated recruiter explanation", time: "22:04:33", pass: true }
      ]
    },
    {
      id: "c_rohan_m",
      candidateId: "rohan_mehta",
      name: "Rohan Mehta",
      degree: "1 yr - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 9, 2026",
      fitScore: 28.3,
      decision: "AUTO_REJECT",
      statusLabel: "Rejected",
      skillsMatch: "6/16",
      email: "r*******@yahoo.com",
      phone: "+91 94******51",
      github: "@rohan-m",
      location: "Mumbai, India",
      breakdown: { technical: 30.0, experience: 10.0, seniority: 20.0, education: 100.0, location: 80.0, weightedTotal: 28.3 },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "Insufficient full-stack experience and multiple core must-haves missing.",
      ruleTriggered: "Gate 7 - Condition 3 (Low Score < 40.0)",
      matchedSkills: ["JavaScript", "HTML5", "CSS3"],
      missingSkills: ["Node.js", "MongoDB", "AWS", "CI/CD", "REST APIs"]
    },
    {
      id: "c_sneha",
      candidateId: "sneha_patil",
      name: "Sneha Patil",
      degree: "2 yrs - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 9, 2026",
      fitScore: 45.1,
      decision: "ESCALATE",
      statusLabel: "Human Review",
      skillsMatch: "7/16",
      email: "s*******@gmail.com",
      phone: "+91 98******99",
      github: "@snehap",
      location: "Pune, India",
      breakdown: { technical: 52.0, experience: 20.0, seniority: 35.0, education: 100.0, location: 100.0, weightedTotal: 45.1 },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "Front-end heavy candidate with partial node.js background.",
      ruleTriggered: "Gate 7 - Condition 5 (Mid-Range)",
      matchedSkills: ["React", "JavaScript", "CSS3", "Git"],
      missingSkills: ["AWS", "MongoDB", "CI/CD"]
    },
    {
      id: "c_vikram",
      candidateId: "vikram_reddy",
      name: "Vikram Reddy",
      degree: "4 yrs - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 9, 2026",
      fitScore: 76.2,
      decision: "AUTO_ADVANCE",
      statusLabel: "Shortlisted",
      skillsMatch: "12/16",
      email: "v*******@gmail.com",
      phone: "+91 91******77",
      github: "@vikramr",
      location: "Hyderabad, India",
      breakdown: { technical: 80.0, experience: 75.0, seniority: 70.0, education: 100.0, location: 80.0, weightedTotal: 76.2 },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "High technical competence across React, Node, SQL and AWS.",
      ruleTriggered: "Gate 7 - Condition 1 (Score >= 75.0)",
      matchedSkills: ["JavaScript", "React", "Node.js", "AWS", "SQL", "Git"],
      missingSkills: ["MongoDB"]
    },
    {
      id: "c_ankita",
      candidateId: "ankita_desai",
      name: "Ankita Desai",
      degree: "1 yr - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 8, 2026",
      fitScore: 32.0,
      decision: "AUTO_REJECT",
      statusLabel: "Rejected",
      skillsMatch: "5/16",
      email: "a*******@gmail.com",
      phone: "+91 93******21",
      github: "@ankitad",
      location: "Ahmedabad, India",
      breakdown: { technical: 35.0, experience: 15.0, seniority: 20.0, education: 100.0, location: 80.0, weightedTotal: 32.0 },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "Missing core backend and database requirements.",
      ruleTriggered: "Gate 7 - Condition 3 (Score < 40.0)",
      matchedSkills: ["HTML", "CSS", "JavaScript"],
      missingSkills: ["React", "Node.js", "AWS", "MongoDB"]
    },
    {
      id: "c_karan",
      candidateId: "karan_verma",
      name: "Karan Verma",
      degree: "3 yrs - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 8, 2026",
      fitScore: 68.5,
      decision: "ESCALATE",
      statusLabel: "Human Review",
      skillsMatch: "11/16",
      email: "k*******@gmail.com",
      phone: "+91 99******18",
      github: "@karanv",
      location: "Bangalore, India",
      breakdown: { technical: 72.0, experience: 65.0, seniority: 60.0, education: 100.0, location: 100.0, weightedTotal: 68.5 },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "Strong Python/Django developer transitioning to Node/React stack.",
      ruleTriggered: "Gate 7 - Condition 5 (Mid-Range)",
      matchedSkills: ["Python", "PostgreSQL", "REST APIs", "Git", "Docker"],
      missingSkills: ["React", "Node.js"]
    },
    {
      id: "c_priya",
      candidateId: "priya_singh",
      name: "Priya Singh",
      degree: "2 yrs - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 8, 2026",
      fitScore: 51.2,
      decision: "ESCALATE",
      statusLabel: "Human Review",
      skillsMatch: "9/16",
      email: "p*******@gmail.com",
      phone: "+91 96******33",
      github: "@priyasingh",
      location: "Noida, India",
      breakdown: { technical: 60.0, experience: 30.0, seniority: 40.0, education: 100.0, location: 80.0, weightedTotal: 51.2 },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "Good front-end portfolio, intermediate Node experience.",
      ruleTriggered: "Gate 7 - Condition 5 (Mid-Range)",
      matchedSkills: ["JavaScript", "React", "Node.js", "Git"],
      missingSkills: ["AWS", "MongoDB", "CI/CD"]
    },
    {
      id: "c_arjun",
      candidateId: "arjun_nair",
      name: "Arjun Nair",
      degree: "4 yrs - B.Tech",
      appliedJobId: "2234533717",
      appliedJobTitle: "Full Stack Software Engineer",
      appliedDate: "Oct 8, 2026",
      fitScore: 82.7,
      decision: "AUTO_ADVANCE",
      statusLabel: "Shortlisted",
      skillsMatch: "14/16",
      email: "a*******@gmail.com",
      phone: "+91 95******88",
      github: "@arjunnair",
      location: "Chennai, India",
      breakdown: { technical: 88.0, experience: 80.0, seniority: 75.0, education: 100.0, location: 80.0, weightedTotal: 82.7 },
      integrityFlags: 0,
      verificationFlags: 0,
      quarantineStatus: "CLEAN",
      overqualification: "BALANCED",
      reason: "Comprehensive full stack capability with production cloud deployments.",
      ruleTriggered: "Gate 7 - Condition 1 (Score >= 75.0)",
      matchedSkills: ["JavaScript", "React", "Node.js", "MongoDB", "AWS", "Docker", "Git"],
      missingSkills: ["System Design"]
    }
  ],

  // Evaluation & Fairness benchmark data from eval_results.json
  evaluation: {
    datasetSize: 200,
    timestamp: "2026-10-16T07:31:04Z",
    metrics: {
      ndcg5: 0.8209,
      ndcg10: 0.8201,
      jaccardBaselineNDCG5: 0.4727,
      tfidfBaselineNDCG5: 0.4573,
      decisionAccuracy: 0.575, // 57.5%
      autoAdvanceRecall: 0.125, // 12.5%
      judgeKappa: 0.1355, // ~0.14
      fairnessFlips: "0 / 1,080",
      adversarialQuarantined: "15 / 15",
      macroPrecision: 0.6436,
      macroRecall: 0.4696,
      macroF1: 0.4718
    },
    policyConfig: {
      weights: {
        technical: 0.40,
        experience: 0.30,
        seniority: 0.20,
        education: 0.05,
        location: 0.05
      },
      thresholds: {
        autoAdvanceMin: 75.0,
        escalateMin: 40.0,
        autoRejectMax: 39.9
      }
    }
  },

  // Audit Log Entries
  auditLogs: [
    { id: "LOG-01", timestamp: "2026-10-16 11:42:01", actor: "System Pipeline", action: "Executed Screening Gate 0-8", target: "Candidate: aksada (Akshada Kale)", status: "Completed (42.62/100)" },
    { id: "LOG-02", timestamp: "2026-10-16 11:30:15", actor: "Rohan (HR)", action: "Shortlisted Candidate", target: "Candidate: Neha Gupta", status: "Status -> Shortlisted" },
    { id: "LOG-03", timestamp: "2026-10-16 10:15:22", actor: "System Pipeline", action: "Adversarial Prompt Injection Blocked", target: "Resume: payload_test.pdf", status: "Quarantined" },
    { id: "LOG-04", timestamp: "2026-10-16 09:12:00", actor: "Candidate: Akshada Kale", action: "Submitted Job Application", target: "Job: 2234533717 (Full Stack)", status: "Success" },
    { id: "LOG-05", timestamp: "2026-10-15 16:40:00", actor: "Admin", action: "Verified Evaluation Metrics", target: "eval_results.json (200 pairs)", status: "Audited" }
  ]
};

class DataStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read from localStorage, using defaults", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Could not write to localStorage", e);
    }
  }

  getRole() {
    return this.state.activeRole;
  }

  setRole(role) {
    if (["candidate", "recruiter", "admin"].includes(role)) {
      this.state.activeRole = role;
      this.saveState();
    }
  }

  getCurrentUser() {
    const role = this.getRole();
    return this.state.currentUser[role];
  }

  getJobs() {
    return this.state.jobs;
  }

  getJobById(id) {
    return this.state.jobs.find(j => j.id === id) || this.state.jobs[0];
  }

  getCandidateApplications() {
    return this.state.candidateApplications;
  }

  getCandidates() {
    return this.state.candidates;
  }

  getCandidateById(id) {
    return this.state.candidates.find(c => c.id === id || c.candidateId === id) || this.state.candidates[2];
  }

  getEvaluation() {
    return this.state.evaluation;
  }

  getAuditLogs() {
    return this.state.auditLogs;
  }

  addJob(newJob) {
    this.state.jobs.unshift(newJob);
    this.saveState();
  }

  submitApplication(jobId, whyFit) {
    const job = this.getJobById(jobId);
    const newApp = {
      id: `APP-${jobId.slice(0, 4)}-${Date.now().toString().slice(-4)}`,
      jobId: jobId,
      jobTitle: job.title,
      company: job.company,
      status: "Under Review",
      appliedDate: "Oct 16, 2026",
      timeline: [
        { title: "Application Submitted", timestamp: "Oct 16, 2026, Just Now", status: "completed", note: "Application registered." },
        { title: "Resume Screening (AI)", timestamp: "Oct 16, 2026, In Progress", status: "active", note: "AI pipeline screening candidate." },
        { title: "Under Human Review", timestamp: "Pending", status: "pending" },
        { title: "Final Decision", timestamp: "Pending", status: "pending" }
      ]
    };
    this.state.candidateApplications.unshift(newApp);

    // Also update candidate count in job
    job.applicantsCount = (job.applicantsCount || 0) + 1;
    job.reviewCount = (job.reviewCount || 0) + 1;

    // Add to audit logs
    this.state.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-3)}`,
      timestamp: "2026-10-16 23:50:00",
      actor: "Akshada Kale",
      action: "Submitted Application",
      target: `Job: ${job.title} (${job.company})`,
      status: "Screening In Progress"
    });

    this.saveState();
    return newApp;
  }

  updateCandidateDecision(candidateId, newDecision, comment = "") {
    const cand = this.getCandidateById(candidateId);
    if (cand) {
      cand.decision = newDecision;
      cand.statusLabel = newDecision === "AUTO_ADVANCE" ? "Shortlisted" : (newDecision === "AUTO_REJECT" ? "Rejected" : "Human Review");
      
      this.state.auditLogs.unshift({
        id: `LOG-${Date.now().toString().slice(-3)}`,
        timestamp: "2026-10-16 23:55:00",
        actor: "Rohan (HR)",
        action: `Decision override: ${newDecision}`,
        target: `Candidate: ${cand.name}`,
        status: comment || "Manual recruiter review decision"
      });

      this.saveState();
    }
  }

  updateCandidateProfile(profileData) {
    Object.assign(this.state.currentUser.candidate, profileData);
    this.saveState();
  }

  uploadCandidateResume(fileName, fileSize, newSkills = []) {
    const cand = this.state.currentUser.candidate;
    cand.resumeFile = fileName;
    cand.resumeSize = fileSize;
    cand.lastUpdated = "Just Now";

    if (newSkills && newSkills.length > 0) {
      newSkills.forEach(s => {
        if (!cand.skills.includes(s)) cand.skills.push(s);
      });
    }

    this.state.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-3)}`,
      timestamp: "2026-10-17 00:10:00",
      actor: cand.name,
      action: "Uploaded New Resume",
      target: fileName,
      status: `Parsed ${newSkills.length} skills`
    });

    this.saveState();
  }

  getSampleJDs() {
    return [
      {
        id: "2234533717",
        title: "Freelance Full-Stack Software Engineer",
        company: "Ideando Inc / SkillFit",
        location: "Remote",
        jobType: "Full-time",
        experience: "3+ years",
        description: "SkillFit, a subsidiary of Ideando Inc. is a cutting-edge AI-powered platform that revolutionizes talent acquisition. We are seeking a talented and experienced Freelance Full-Stack Software Engineer. Proficiency in modern programming languages and frameworks including JavaScript/TypeScript, React, Node.js, Python, and Express.js. Experience with relational and NoSQL databases such as PostgreSQL, MongoDB. Familiarity with cloud platforms AWS, Azure, GCP, and CI/CD pipelines.",
        mustHaves: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "MongoDB", "PostgreSQL", "REST APIs", "Git"],
        niceToHaves: ["AWS", "Azure", "Docker", "CI/CD", "System Design"]
      },
      {
        id: "3586167732",
        title: "Senior Software Engineer (Backend Systems)",
        company: "DataWorks",
        location: "Pune, India",
        jobType: "Full-time",
        experience: "4-7 years",
        description: "Join our data infrastructure team to engineer high-throughput backend services and streaming pipelines. Requires strong Python, Django, and PostgreSQL capabilities with real-time distributed data handling.",
        mustHaves: ["Python", "Django", "PostgreSQL", "REST APIs", "Redis", "Docker"],
        niceToHaves: ["Kafka", "Kubernetes", "AWS", "Celery"]
      },
      {
        id: "3891267064",
        title: "Lead AWS Platform Engineer",
        company: "CloudTech",
        location: "Remote",
        jobType: "Full-time",
        experience: "5+ years",
        description: "Design resilient multi-region infrastructure on AWS using Terraform and maintain zero-downtime CI/CD deployment pipelines. Lead architectural reviews and cloud security audits.",
        mustHaves: ["AWS", "Terraform", "Kubernetes", "Docker", "CI/CD", "Linux"],
        niceToHaves: ["Ansible", "Prometheus", "Python", "ArgoCD"]
      }
    ];
  }

  getCandidateResumeContent(candidateId = "aksada") {
    return `AKSHADA KALE
Pune, India | akshada@example.com | +91 98765 43210
GitHub: https://github.com/Akshada-kale | LinkedIn: linkedin.com/in/akshada-kale

============================================================
EDUCATION
============================================================
Bachelor of Technology in Computer Science & Engineering
XYZ University (2022 - 2026) | CGPA: 8.9/10

============================================================
TECHNICAL SKILLS
============================================================
- Languages: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3, SQL
- Frameworks & Libraries: React.js, Node.js, Express.js, Redux Toolkit
- Databases & Storage: MongoDB, PostgreSQL, Firebase
- Tools & Utilities: Git, GitHub, RESTful APIs, Postman, VS Code, npm

============================================================
PROJECTS
============================================================
1. LearnMate — Peer Tutoring & Knowledge Exchange Web App
   - Developed responsive full-stack platform using React.js, Node.js, and MongoDB.
   - Built JWT-based user authentication and real-time chat endpoints.
   - Integrated RESTful APIs with MongoDB Atlas for scalable document storage.

2. HEALIS — Healthcare Appointment & Clinic Scheduler
   - Engineered appointment reservation workflow with role-based portal access.
   - Designed clean responsive UI adhering to modern accessibility guidelines.

3. Seikaham — Microservices Task Management Board
   - Implemented kanban board with dynamic state transitions and drag-and-drop.

============================================================
CERTIFICATIONS & ACHIEVEMENTS
============================================================
- Complete Web Development Bootcamp (React, Node, MongoDB)
- Open Source Contributor to 5+ community repositories
- Finalist in National Inter-College Hackathon 2025`;
  }
}

// Export singleton instance
const AppData = new DataStore();
