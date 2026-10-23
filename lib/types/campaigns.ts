/** Campaign records and the analytics derived from them. Dates are local datetimes (YYYY-MM-DDTHH:mm:ss). */
import type { EmailContent } from "./templates";

export type CampaignType = "email" | "sms" | "automation" | "journey";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "archived";

export type CampaignEventKind = "created" | "audience" | "edited" | "scheduled" | "paused" | "resumed" | "sending" | "sent" | "delivered" | "engagement" | "archived" | "restored" | "duplicated";

export interface CampaignEvent {
  at: string;
  kind: CampaignEventKind;
  text: string;
  user?: string;
}

export interface Audience {
  id: string;
  name: string;
  /** Contacts a campaign would reach (reachable members). */
  size: number;
  kind?: "list" | "segment";
}

/** A subject-line test: two versions go to a slice of the audience, the better one goes to everyone else. */
export interface AbTest {
  subjectB: string;
  /** % of recipients in the test, split evenly between A and B. */
  testPercent: number;
  /** What decides the winner. */
  metric: "opens" | "clicks";
  /** How long the test runs before the winner is sent. */
  hours: number;
}

export interface AbVariant {
  key: "a" | "b";
  subject: string;
  sent: number;
  opens: number;
  openRate: number;
  clicks: number;
  clickRate: number;
}

export interface AbResult {
  phase: "testing" | "decided";
  metric: AbTest["metric"];
  variants: AbVariant[];
  winner: "a" | "b" | null;
  /** Recipients outside the test group, who get the winner. */
  remainder: number;
  /** When the winner is (or was) chosen. */
  decidesAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  /** Email-like campaigns (email, automation, journey). */
  subject?: string;
  previewText?: string;
  /** Subject-line A/B test (email only). */
  abTest?: AbTest;
  /** SMS body. */
  message?: string;
  senderName: string;
  /** Email sender address. */
  senderEmail?: string;
  /** SMS sender ID. */
  senderId?: string;
  /** First selected list or segment (kept for older records and single-audience views). */
  audienceId: string;
  /** Every selected list and segment, up to 10. Missing on older records = [audienceId]. */
  audienceIds?: string[];
  /** Display label: "Customers" or "Customers + 2 more". */
  audience: string;
  recipients: number;
  /** Subscription topic recipients can opt out of. */
  topic?: string;
  replyTo?: string;
  trackReplies?: boolean;
  trackOpens?: boolean;
  trackClicks?: boolean;
  /** File names only — nothing is uploaded in this prototype. */
  attachments?: CampaignAttachment[];
  /** The campaign's own copy of its email content. */
  content?: EmailContent;
  /** Where the content came from ("Welcome Travel", "Two columns", "HTML import"…). */
  contentSource?: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  sentAt?: string;
  /** Delivery finished (sent campaigns). */
  completedAt?: string;
  // Results — present once a campaign has started sending.
  sent?: number;
  delivered?: number;
  opens?: number;
  clicks?: number;
  /** % of delivered */
  openRate?: number;
  /** % of delivered */
  clickRate?: number;
  bounces?: number;
  unsubscribes?: number;
  conversions?: number;
  /** SMS: messages the carrier rejected. */
  failed?: number;
  /** Automations / journeys: average sends a day while running. */
  dailyVolume?: number;
  /** Where Pause / Archive came from, so Resume / Restore can return there. */
  pausedFrom?: "scheduled" | "sending";
  archivedFrom?: Exclude<CampaignStatus, "archived">;
  history: CampaignEvent[];
}

/** One day of account-wide sending, built from the campaign records. */
export interface DayStats {
  date: string;
  emailsSent: number;
  opens: number;
  clicks: number;
  conversions: number;
  smsSent: number;
  newContacts: number;
  totalContacts: number;
}

export interface ActivityEntry {
  id: string;
  at: string;
  kind: "email" | "sms" | "automation" | "journey" | "contacts" | "list" | "segment" | "template" | "form" | "deleted" | "whatsapp" | "file";
  title: string;
  detail: string;
  campaignId?: string;
}

export interface Kpi {
  value: number;
  /** Change vs the previous period: % for counts, percentage points for rates, a plain count for campaigns. */
  change: number;
  changeUnit: "%" | "pts" | "count";
  spark: number[];
}

export interface DashboardData {
  range: { start: string; end: string; days: number };
  previous: { start: string; end: string };
  now: string;
  kpis: {
    contacts: Kpi;
    emailsSent: Kpi;
    openRate: Kpi;
    clickRate: Kpi;
    campaigns: Kpi;
    conversions: Kpi;
  };
  days: DayStats[];
  /** Contact growth, at least 28 days so the line has shape. */
  growth: { date: string; total: number }[];
  newContacts: { value: number; change: number; previousStart: string; previousEnd: string };
  channels: { type: CampaignType; count: number }[];
  best: Campaign[];
  upcoming: Campaign[];
  activity: ActivityEntry[];
  contactLimit: number;
}

export type AnalyticsChannel = "all" | "email" | "sms";

export interface AnalyticsTotals {
  campaigns: number;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  /** Email bounces plus failed SMS. */
  bounces: number;
  unsubscribes: number;
  conversions: number;
  deliveryRate: number;
  /** % of delivered email (SMS has no opens). */
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  conversionRate: number;
}

export interface AnalyticsData {
  range: { start: string; end: string; days: number };
  previous: { start: string; end: string };
  totals: AnalyticsTotals;
  previousTotals: AnalyticsTotals;
  series: { date: string; sent: number; opens: number; clicks: number; conversions: number; newContacts: number; totalContacts: number }[];
  growth: { date: string; total: number; added: number }[];
  channels: ({ type: CampaignType } & AnalyticsTotals)[];
  /** Campaigns that started sending in the range, newest first. */
  campaigns: Campaign[];
}

export interface EngagementPoint {
  label: string;
  /** Full label for tooltips. */
  title: string;
  opens: number;
  clicks: number;
}

export interface CampaignAnalytics {
  engagement: EngagementPoint[];
  engagementUnit: "hour" | "day";
  devices: { name: string; value: number }[];
  /** Email clients, or mobile carriers for SMS. */
  clients: { name: string; value: number }[];
  links: { label: string; url: string; clicks: number; unique: number }[];
  /** Subject-line test results, when the campaign ran one. */
  ab?: AbResult;
  /** Account average for the same channel, for comparison chips. */
  benchmark: { openRate: number; clickRate: number; bounceRate: number; unsubscribeRate: number; deliveryRate: number };
}

export interface CampaignDetail {
  campaign: Campaign;
  analytics: CampaignAnalytics | null;
  now: string;
}

export interface CampaignInput {
  name: string;
  type: "email" | "sms";
  subject: string;
  message: string;
  audienceId: string;
}

export interface CampaignAttachment {
  name: string;
  size: number;
}

export interface CampaignEdit {
  name: string;
  subject?: string;
  previewText?: string;
  /** null removes the test. */
  abTest?: AbTest | null;
  message?: string;
  senderName?: string;
  senderEmail?: string;
  audienceId?: string;
  /** Replaces the whole selection (up to 10 lists and segments). */
  audienceIds?: string[];
  topic?: string;
  replyTo?: string;
  trackReplies?: boolean;
  trackOpens?: boolean;
  trackClicks?: boolean;
  attachments?: CampaignAttachment[];
  /** null removes the content. */
  content?: EmailContent | null;
  contentSource?: string;
}
