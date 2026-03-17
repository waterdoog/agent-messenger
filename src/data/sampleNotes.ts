export interface MeetingNote {
  id: string;
  title: string;
  summary: string;
  duration: number; // seconds
  timestamp: Date;
  attendees: string[];
  actionItems: string[];
  tags: string[];
}

export const sampleMeetingNotes: MeetingNote[] = [
  {
    id: "note-pitch",
    title: "Pitch Deck — Seed Round",
    summary: "Finalized the seed round pitch deck. Covers company overview, product differentiation (Context Cells), traction (2,400 beta users, 38% WoW growth), TAM/SAM/SOM, and the $2.5M ask. Ready for investor outreach.",
    duration: 2700,
    timestamp: new Date(Date.now() - 86400000 * 0.2),
    attendees: ["Lisa", "James", "Sarah", "Mike"],
    actionItems: [
      "Send deck to 5 target investors by Friday",
      "Prepare financial appendix (separate, confidential)",
      "Schedule practice pitch sessions",
    ],
    tags: ["fundraising", "pitch"],
  },
  {
    id: "note-financial",
    title: "Financial Report — Q1 2025",
    summary: "Reviewed Q1 financials: $42K MRR, burn rate $85K/mo, 18-month runway at current pace. Unit economics improving — CAC down 22%, LTV/CAC ratio at 3.2x. Cap table updated post-angel round.",
    duration: 3600,
    timestamp: new Date(Date.now() - 86400000 * 0.8),
    attendees: ["Lisa", "CFO", "James"],
    actionItems: [
      "Update financial model with Q1 actuals",
      "Prepare investor-ready financials (redacted version)",
      "Review cap table with legal counsel",
    ],
    tags: ["finance", "confidential"],
  },
  {
    id: "note-1",
    title: "Q1 Roadmap Planning",
    summary: "Discussed Q1 priorities: onboarding revamp (#1), API v2 (#2), analytics dashboard (#3). Sarah leads design, Mike owns backend. Two platform engineers joining next Monday. Beta target: March 28.",
    duration: 912,
    timestamp: new Date(Date.now() - 86400000 * 0.5),
    attendees: ["Sarah", "Mike", "Lisa", "James"],
    actionItems: [
      "Define analytics data model schema (due March 15)",
      "Review Mike's API v2 proposal (due Friday)",
      "Schedule sync with Sarah on onboarding flow",
    ],
    tags: ["roadmap", "planning"],
  },
  {
    id: "note-2",
    title: "Design Review — Onboarding Flow",
    summary: "Sarah presented 3 onboarding variants. Team picked Option B (progressive disclosure). Need to finalize copy and add micro-animations. Design handoff set for March 18.",
    duration: 1845,
    timestamp: new Date(Date.now() - 86400000 * 1),
    attendees: ["Sarah", "Tom", "Lisa"],
    actionItems: [
      "Finalize onboarding copy by March 14",
      "Add micro-animation specs to Figma",
      "Share Figma link with eng team",
    ],
    tags: ["design", "onboarding"],
  },
  {
    id: "note-3",
    title: "API v2 Architecture Discussion",
    summary: "Mike proposed RESTful + GraphQL hybrid. Team debated trade-offs. Decided on REST-first with GraphQL gateway for complex queries. Breaking changes need migration guide.",
    duration: 2400,
    timestamp: new Date(Date.now() - 86400000 * 2),
    attendees: ["Mike", "James", "Kevin"],
    actionItems: [
      "Draft API v2 migration guide",
      "Set up GraphQL gateway prototype",
      "Define backward compatibility policy",
    ],
    tags: ["api", "architecture"],
  },
  {
    id: "note-4",
    title: "Sprint Retrospective — Sprint 14",
    summary: "Velocity improved 15%. Main blocker was flaky CI tests (fixed mid-sprint). Team wants more async standups. Agreed to trial async updates Mon/Wed/Fri.",
    duration: 1200,
    timestamp: new Date(Date.now() - 86400000 * 3),
    attendees: ["Lisa", "Sarah", "Mike", "Tom", "Kevin"],
    actionItems: [
      "Set up async standup bot in Slack",
      "Document CI fix for flaky tests",
      "Update sprint planning template",
    ],
    tags: ["retro", "process"],
  },
  {
    id: "note-5",
    title: "Client Call — Acme Corp Integration",
    summary: "Acme wants webhook support for real-time order sync. They need SSO with SAML. Timeline: pilot by April 15, full rollout May 1. They're willing to co-develop the webhook spec.",
    duration: 1800,
    timestamp: new Date(Date.now() - 86400000 * 4),
    attendees: ["Lisa", "James", "Acme PM", "Acme CTO"],
    actionItems: [
      "Draft webhook spec document",
      "Research SAML SSO implementation options",
      "Schedule follow-up with Acme engineering",
    ],
    tags: ["client", "integration"],
  },
  {
    id: "note-6",
    title: "Analytics Dashboard Kickoff",
    summary: "Defined core metrics: DAU, retention, funnel conversion, feature adoption. Will use ClickHouse for analytics DB. MVP shows 4 charts + date range filter. Full version post-beta.",
    duration: 2100,
    timestamp: new Date(Date.now() - 86400000 * 5),
    attendees: ["Tom", "Kevin", "Lisa"],
    actionItems: [
      "Set up ClickHouse instance",
      "Define event tracking schema",
      "Create dashboard wireframes",
    ],
    tags: ["analytics", "kickoff"],
  },
  {
    id: "note-7",
    title: "1:1 with James — Career Growth",
    summary: "Discussed path to senior engineer. Key areas: system design depth, mentoring, and cross-team influence. James suggested leading the analytics project as a growth opportunity.",
    duration: 1500,
    timestamp: new Date(Date.now() - 86400000 * 6),
    attendees: ["James"],
    actionItems: [
      "Write a technical design doc for analytics pipeline",
      "Mentor a junior engineer on the team",
      "Present at next engineering all-hands",
    ],
    tags: ["1:1", "career"],
  },
  {
    id: "note-8",
    title: "Security Review — Auth System",
    summary: "Reviewed current auth implementation. Found 2 medium-severity issues: token expiry too long (24h → 1h), missing rate limiting on login. No critical issues. Passing overall.",
    duration: 2700,
    timestamp: new Date(Date.now() - 86400000 * 7),
    attendees: ["Kevin", "James", "Security Team"],
    actionItems: [
      "Reduce token expiry to 1 hour",
      "Implement login rate limiting (5 attempts/min)",
      "Add security headers to API responses",
    ],
    tags: ["security", "review"],
  },
  {
    id: "note-9",
    title: "Product Sync — Mobile Strategy",
    summary: "Debated native vs. React Native vs. PWA. Decision: PWA first for beta, evaluate native post-launch based on user feedback. Mobile-first responsive design required for all new features.",
    duration: 1650,
    timestamp: new Date(Date.now() - 86400000 * 9),
    attendees: ["Lisa", "Sarah", "Tom"],
    actionItems: [
      "Audit current app for mobile responsiveness",
      "Set up PWA manifest and service worker",
      "Create mobile design guidelines",
    ],
    tags: ["product", "mobile"],
  },
  {
    id: "note-10",
    title: "Vendor Evaluation — Monitoring Tools",
    summary: "Compared Datadog, Grafana Cloud, and New Relic. Datadog wins on features but 2x cost. Grafana Cloud is best value. Decision: Grafana Cloud for now, revisit at Series B.",
    duration: 1350,
    timestamp: new Date(Date.now() - 86400000 * 11),
    attendees: ["Kevin", "James"],
    actionItems: [
      "Set up Grafana Cloud trial",
      "Migrate existing dashboards from free tier",
      "Define alerting rules for critical paths",
    ],
    tags: ["vendor", "infrastructure"],
  },
];

export interface FileItem {
  id: string;
  name: string;
  type: "pdf" | "doc" | "sheet" | "image" | "figma" | "slide" | "md" | "link";
  size: string;
  updatedAt: Date;
}

export interface FolderItem {
  id: string;
  name: string;
  icon: string;
  files: FileItem[];
}

export const sampleFolders: FolderItem[] = [
  {
    id: "folder-notes",
    name: "Meeting Notes",
    icon: "📝",
    files: [
      { id: "fn-1", name: "Q1 Roadmap Planning.doc", type: "doc", size: "420 KB", updatedAt: new Date(Date.now() - 86400000 * 0.5) },
      { id: "fn-2", name: "Design Review — Onboarding Flow.doc", type: "doc", size: "380 KB", updatedAt: new Date(Date.now() - 86400000 * 1) },
      { id: "fn-3", name: "API v2 Architecture Discussion.doc", type: "doc", size: "510 KB", updatedAt: new Date(Date.now() - 86400000 * 2) },
      { id: "fn-4", name: "Sprint Retrospective — Sprint 14.doc", type: "doc", size: "290 KB", updatedAt: new Date(Date.now() - 86400000 * 3) },
      { id: "fn-5", name: "Client Call — Acme Corp Integration.doc", type: "doc", size: "340 KB", updatedAt: new Date(Date.now() - 86400000 * 4) },
      { id: "fn-6", name: "Analytics Dashboard Kickoff.doc", type: "doc", size: "410 KB", updatedAt: new Date(Date.now() - 86400000 * 5) },
      { id: "fn-7", name: "1:1 with James — Career Growth.doc", type: "doc", size: "180 KB", updatedAt: new Date(Date.now() - 86400000 * 6) },
      { id: "fn-8", name: "Security Review — Auth System.doc", type: "doc", size: "620 KB", updatedAt: new Date(Date.now() - 86400000 * 7) },
      { id: "fn-9", name: "Product Sync — Mobile Strategy.doc", type: "doc", size: "350 KB", updatedAt: new Date(Date.now() - 86400000 * 9) },
      { id: "fn-10", name: "Vendor Evaluation — Monitoring Tools.doc", type: "doc", size: "280 KB", updatedAt: new Date(Date.now() - 86400000 * 11) },
    ],
  },
  {
    id: "folder-vc",
    name: "VC / Pitch",
    icon: "🚀",
    files: [
      { id: "fvc-1", name: "Pitch Deck — Seed Round.slide", type: "slide", size: "5.2 MB", updatedAt: new Date(Date.now() - 86400000 * 0.2) },
      { id: "fvc-2", name: "Investor One-Pager.pdf", type: "pdf", size: "1.4 MB", updatedAt: new Date(Date.now() - 86400000 * 1) },
      { id: "fvc-3", name: "Market Analysis.pdf", type: "pdf", size: "3.1 MB", updatedAt: new Date(Date.now() - 86400000 * 3) },
      { id: "fvc-4", name: "Competitive Landscape.slide", type: "slide", size: "2.8 MB", updatedAt: new Date(Date.now() - 86400000 * 5) },
      { id: "fvc-5", name: "Team Bios.doc", type: "doc", size: "520 KB", updatedAt: new Date(Date.now() - 86400000 * 7) },
    ],
  },
  {
    id: "folder-finance",
    name: "Financial Documents",
    icon: "💰",
    files: [
      { id: "ffin-1", name: "Financial Report — Q1 2025.sheet", type: "sheet", size: "1.8 MB", updatedAt: new Date(Date.now() - 86400000 * 0.8) },
      { id: "ffin-2", name: "Revenue Projections 2025.sheet", type: "sheet", size: "960 KB", updatedAt: new Date(Date.now() - 86400000 * 2) },
      { id: "ffin-3", name: "Cap Table.sheet", type: "sheet", size: "340 KB", updatedAt: new Date(Date.now() - 86400000 * 4) },
      { id: "ffin-4", name: "Burn Rate Analysis.sheet", type: "sheet", size: "280 KB", updatedAt: new Date(Date.now() - 86400000 * 6) },
      { id: "ffin-5", name: "Unit Economics Model.sheet", type: "sheet", size: "420 KB", updatedAt: new Date(Date.now() - 86400000 * 8) },
      { id: "ffin-6", name: "Term Sheet — Draft.pdf", type: "pdf", size: "1.2 MB", updatedAt: new Date(Date.now() - 86400000 * 10) },
    ],
  },
  {
    id: "folder-1",
    name: "Product Specs",
    icon: "📁",
    files: [
      { id: "f1-1", name: "Q1 Product Roadmap.pdf", type: "pdf", size: "2.4 MB", updatedAt: new Date(Date.now() - 86400000 * 1) },
      { id: "f1-2", name: "Feature Prioritization Matrix.sheet", type: "sheet", size: "340 KB", updatedAt: new Date(Date.now() - 86400000 * 2) },
      { id: "f1-3", name: "User Onboarding PRD.doc", type: "doc", size: "1.1 MB", updatedAt: new Date(Date.now() - 86400000 * 3) },
      { id: "f1-4", name: "API v2 Spec.md", type: "md", size: "86 KB", updatedAt: new Date(Date.now() - 86400000 * 4) },
      { id: "f1-5", name: "Analytics Dashboard Requirements.doc", type: "doc", size: "920 KB", updatedAt: new Date(Date.now() - 86400000 * 5) },
      { id: "f1-6", name: "Competitive Analysis.pdf", type: "pdf", size: "4.7 MB", updatedAt: new Date(Date.now() - 86400000 * 7) },
      { id: "f1-7", name: "Beta Launch Plan.slide", type: "slide", size: "3.2 MB", updatedAt: new Date(Date.now() - 86400000 * 8) },
      { id: "f1-8", name: "User Personas.pdf", type: "pdf", size: "1.8 MB", updatedAt: new Date(Date.now() - 86400000 * 10) },
    ],
  },
  {
    id: "folder-2",
    name: "Design Assets",
    icon: "🎨",
    files: [
      { id: "f2-1", name: "Onboarding Flow v3.figma", type: "figma", size: "—", updatedAt: new Date(Date.now() - 86400000 * 1) },
      { id: "f2-2", name: "Design System Components.figma", type: "figma", size: "—", updatedAt: new Date(Date.now() - 86400000 * 2) },
      { id: "f2-3", name: "Mobile Wireframes.figma", type: "figma", size: "—", updatedAt: new Date(Date.now() - 86400000 * 3) },
      { id: "f2-4", name: "Icon Set Export.zip", type: "image", size: "12.3 MB", updatedAt: new Date(Date.now() - 86400000 * 4) },
      { id: "f2-5", name: "Brand Guidelines.pdf", type: "pdf", size: "6.1 MB", updatedAt: new Date(Date.now() - 86400000 * 5) },
      { id: "f2-6", name: "Color Palette.png", type: "image", size: "240 KB", updatedAt: new Date(Date.now() - 86400000 * 6) },
      { id: "f2-7", name: "Landing Page Mockup.figma", type: "figma", size: "—", updatedAt: new Date(Date.now() - 86400000 * 7) },
      { id: "f2-8", name: "Dashboard Concepts.pdf", type: "pdf", size: "3.4 MB", updatedAt: new Date(Date.now() - 86400000 * 8) },
      { id: "f2-9", name: "Typography Scale.png", type: "image", size: "180 KB", updatedAt: new Date(Date.now() - 86400000 * 9) },
      { id: "f2-10", name: "Animation Specs.md", type: "md", size: "42 KB", updatedAt: new Date(Date.now() - 86400000 * 10) },
      { id: "f2-11", name: "User Flow Diagrams.figma", type: "figma", size: "—", updatedAt: new Date(Date.now() - 86400000 * 11) },
      { id: "f2-12", name: "App Store Screenshots.zip", type: "image", size: "8.7 MB", updatedAt: new Date(Date.now() - 86400000 * 12) },
      { id: "f2-13", name: "Error State Illustrations.svg", type: "image", size: "320 KB", updatedAt: new Date(Date.now() - 86400000 * 13) },
      { id: "f2-14", name: "Loading Animations.json", type: "md", size: "56 KB", updatedAt: new Date(Date.now() - 86400000 * 14) },
    ],
  },
  {
    id: "folder-3",
    name: "Engineering Docs",
    icon: "⚙️",
    files: [
      { id: "f3-1", name: "System Architecture Overview.md", type: "md", size: "124 KB", updatedAt: new Date(Date.now() - 86400000 * 2) },
      { id: "f3-2", name: "Database Schema v2.pdf", type: "pdf", size: "890 KB", updatedAt: new Date(Date.now() - 86400000 * 3) },
      { id: "f3-3", name: "API Endpoints Reference.md", type: "md", size: "210 KB", updatedAt: new Date(Date.now() - 86400000 * 5) },
      { id: "f3-4", name: "CI/CD Pipeline Guide.doc", type: "doc", size: "560 KB", updatedAt: new Date(Date.now() - 86400000 * 8) },
      { id: "f3-5", name: "Security Audit Report.pdf", type: "pdf", size: "1.5 MB", updatedAt: new Date(Date.now() - 86400000 * 10) },
      { id: "f3-6", name: "Performance Benchmarks.sheet", type: "sheet", size: "420 KB", updatedAt: new Date(Date.now() - 86400000 * 12) },
    ],
  },
  {
    id: "folder-4",
    name: "Client Materials",
    icon: "🤝",
    files: [
      { id: "f4-1", name: "Acme Corp — Integration Proposal.pdf", type: "pdf", size: "2.1 MB", updatedAt: new Date(Date.now() - 86400000 * 3) },
      { id: "f4-2", name: "Webhook Spec Draft.doc", type: "doc", size: "780 KB", updatedAt: new Date(Date.now() - 86400000 * 5) },
      { id: "f4-3", name: "SSO Implementation Timeline.sheet", type: "sheet", size: "210 KB", updatedAt: new Date(Date.now() - 86400000 * 7) },
    ],
  },
  {
    id: "folder-5",
    name: "Team Wiki",
    icon: "📖",
    files: [
      { id: "f5-1", name: "Onboarding Checklist.md", type: "md", size: "34 KB", updatedAt: new Date(Date.now() - 86400000 * 1) },
      { id: "f5-2", name: "Team Directory.sheet", type: "sheet", size: "120 KB", updatedAt: new Date(Date.now() - 86400000 * 2) },
      { id: "f5-3", name: "Code Review Guidelines.md", type: "md", size: "56 KB", updatedAt: new Date(Date.now() - 86400000 * 4) },
      { id: "f5-4", name: "Sprint Planning Process.doc", type: "doc", size: "340 KB", updatedAt: new Date(Date.now() - 86400000 * 6) },
      { id: "f5-5", name: "Engineering Values.md", type: "md", size: "28 KB", updatedAt: new Date(Date.now() - 86400000 * 8) },
      { id: "f5-6", name: "Meeting Cadence.md", type: "md", size: "18 KB", updatedAt: new Date(Date.now() - 86400000 * 9) },
      { id: "f5-7", name: "Tool Stack Overview.md", type: "md", size: "42 KB", updatedAt: new Date(Date.now() - 86400000 * 10) },
      { id: "f5-8", name: "Incident Response Playbook.pdf", type: "pdf", size: "1.2 MB", updatedAt: new Date(Date.now() - 86400000 * 11) },
      { id: "f5-9", name: "Vacation Policy.doc", type: "doc", size: "180 KB", updatedAt: new Date(Date.now() - 86400000 * 12) },
      { id: "f5-10", name: "Remote Work Guidelines.md", type: "md", size: "24 KB", updatedAt: new Date(Date.now() - 86400000 * 13) },
      { id: "f5-11", name: "Knowledge Sharing Sessions.sheet", type: "sheet", size: "90 KB", updatedAt: new Date(Date.now() - 86400000 * 14) },
      { id: "f5-12", name: "Feedback Templates.doc", type: "doc", size: "210 KB", updatedAt: new Date(Date.now() - 86400000 * 15) },
      { id: "f5-13", name: "Architecture Decision Records.md", type: "md", size: "156 KB", updatedAt: new Date(Date.now() - 86400000 * 16) },
      { id: "f5-14", name: "Release Process.md", type: "md", size: "38 KB", updatedAt: new Date(Date.now() - 86400000 * 17) },
      { id: "f5-15", name: "Design Review Checklist.md", type: "md", size: "22 KB", updatedAt: new Date(Date.now() - 86400000 * 18) },
      { id: "f5-16", name: "Slack Channel Guide.md", type: "md", size: "16 KB", updatedAt: new Date(Date.now() - 86400000 * 19) },
      { id: "f5-17", name: "OKR Templates.sheet", type: "sheet", size: "140 KB", updatedAt: new Date(Date.now() - 86400000 * 20) },
      { id: "f5-18", name: "Interview Rubric.doc", type: "doc", size: "280 KB", updatedAt: new Date(Date.now() - 86400000 * 21) },
      { id: "f5-19", name: "Tech Talks Schedule.sheet", type: "sheet", size: "78 KB", updatedAt: new Date(Date.now() - 86400000 * 22) },
      { id: "f5-20", name: "Retrospective Notes Archive.pdf", type: "pdf", size: "3.8 MB", updatedAt: new Date(Date.now() - 86400000 * 23) },
      { id: "f5-21", name: "New Hire Welcome Pack.pdf", type: "pdf", size: "5.2 MB", updatedAt: new Date(Date.now() - 86400000 * 24) },
    ],
  },
];

export interface CalendarPermission {
  id: string;
  label: string;
  description: string;
  level: "view" | "book" | "manage";
}

export const calendarPermissions: CalendarPermission[] = [
  { id: "cal-view", label: "View availability", description: "Recipient can see your free/busy slots", level: "view" },
  { id: "cal-book", label: "Book meetings", description: "Recipient can book time on your calendar", level: "book" },
  { id: "cal-manage", label: "Full access", description: "Recipient can view, create, and modify events", level: "manage" },
];
