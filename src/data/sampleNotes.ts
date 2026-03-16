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

export interface FolderItem {
  id: string;
  name: string;
  fileCount: number;
  icon: string;
}

export const sampleFolders: FolderItem[] = [
  { id: "folder-1", name: "Product Specs", fileCount: 8, icon: "📁" },
  { id: "folder-2", name: "Design Assets", fileCount: 14, icon: "🎨" },
  { id: "folder-3", name: "Engineering Docs", fileCount: 6, icon: "⚙️" },
  { id: "folder-4", name: "Client Materials", fileCount: 3, icon: "🤝" },
  { id: "folder-5", name: "Team Wiki", fileCount: 21, icon: "📖" },
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
