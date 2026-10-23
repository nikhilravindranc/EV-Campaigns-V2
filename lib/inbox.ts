/** Replies to campaigns, kept as conversations. Sample threads; replies you write stay in this browser. */
export type InboxLabel = "Question" | "Sales lead" | "Unsubscribe request" | "Feedback";
export type InboxStatus = "todo" | "done";

export interface InboxMessage {
  from: "contact" | "you";
  text: string;
  at: string;
}

export interface InboxThread {
  id: string;
  name: string;
  email: string;
  subject: string;
  campaignId?: string;
  campaignName?: string;
  label: InboxLabel;
  status: InboxStatus;
  unread: boolean;
  messages: InboxMessage[];
}

export const INBOX_LABELS: InboxLabel[] = ["Question", "Sales lead", "Unsubscribe request", "Feedback"];
export const INBOX_KEY = "evoq-campaigns:inbox";

export const SEED_THREADS: InboxThread[] = [
  {
    id: "th-1",
    name: "Priya Nair",
    email: "priya.nair@northwind.example",
    subject: "Re: Summer Sale: up to 40% off",
    campaignId: "cmp-1001",
    campaignName: "Summer Sale Email",
    label: "Question",
    status: "todo",
    unread: true,
    messages: [{ from: "contact", text: "Hi, does the 40% discount apply to the annual plan as well, or only monthly? We'd like to switch this week.", at: "2025-05-18T09:42:00" }],
  },
  {
    id: "th-2",
    name: "Marcus Webb",
    email: "marcus@brightpath.example",
    subject: "Re: Live webinar: build your first automation",
    campaignId: "cmp-1009",
    campaignName: "Webinar Invitation: Email Automation 101",
    label: "Sales lead",
    status: "todo",
    unread: true,
    messages: [
      { from: "contact", text: "Great timing. We're a team of 12 and looking to move off spreadsheets for follow-ups. Can someone walk us through pricing after the session?", at: "2025-05-17T16:05:00" },
    ],
  },
  {
    id: "th-3",
    name: "Elena Rossi",
    email: "elena.rossi@loomstudio.example",
    subject: "Re: 48 hours only: weekend flash deals",
    campaignId: "cmp-1010",
    campaignName: "Weekend Flash Deals",
    label: "Unsubscribe request",
    status: "todo",
    unread: false,
    messages: [{ from: "contact", text: "Please take me off this list. I get too many emails.", at: "2025-05-17T11:20:00" }],
  },
  {
    id: "th-4",
    name: "Tom Becker",
    email: "tbecker@hollis.example",
    subject: "Re: 3 quick tips to get more from EVOQ",
    campaignId: "cmp-1011",
    campaignName: "Product Tips: Getting Started",
    label: "Feedback",
    status: "done",
    unread: false,
    messages: [
      { from: "contact", text: "Tip 2 saved me an hour. Could you do one on segments next?", at: "2025-05-15T14:10:00" },
      { from: "you", text: "Thanks Tom, glad it helped. A segments guide is on its way next week.", at: "2025-05-15T15:02:00" },
    ],
  },
];

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
