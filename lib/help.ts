export const HELP_ROUTE = "/help";

/** Support address shown in the Help menu and Help Center. */
export const SUPPORT_EMAIL = "support@evoq.one";

export interface HelpGuide {
  id: string;
  title: string;
  text: string;
  /** Rough reading time, shown as "3 min read". */
  minutes: number;
  steps: string[];
  /** Where the guide's task happens in the app. */
  href: string;
  cta: string;
}

export const HELP_GUIDES: HelpGuide[] = [
  {
    id: "first-campaign",
    title: "Send your first email campaign",
    text: "From picking an audience to scheduling, in one page.",
    minutes: 4,
    steps: [
      "Choose Create Campaign and pick Email.",
      "Under Recipients, select up to 10 lists or segments. The count below shows who will really receive it.",
      "Fill in From, Reply-to and Subject. Type @ to add a name and : to add an emoji.",
      "Under Content, pick a gallery template, a layout, or your own HTML, then choose Use template.",
      "When the error counter shows 0 Errors, choose Review & Launch and set a send time.",
    ],
    href: "/campaigns/new",
    cta: "Create a campaign",
  },
  {
    id: "import-contacts",
    title: "Import and organise contacts",
    text: "Bring in a CSV and keep unreachable people out of your sends.",
    minutes: 3,
    steps: [
      "Open Contacts and choose Import Contacts.",
      "Upload a CSV with an email column. First name, last name and mobile are optional.",
      "Check the Reachable, Suppressed, Excluded and Invalid tabs. Only Reachable contacts receive campaigns.",
      "Group people into a List (fixed) or a Segment (updates itself from your conditions).",
    ],
    href: "/contacts?import=1",
    cta: "Import contacts",
  },
  {
    id: "templates",
    title: "Design a reusable email template",
    text: "Start from the gallery, a layout or your own HTML.",
    minutes: 3,
    steps: [
      "Open Email Templates and name your template.",
      "Choose Gallery, Layout or HTML Editor, then Continue.",
      "Preview before you use it. Choose Customize first to edit, or Use template to apply it as-is.",
      "Saved templates appear under My Templates and in any campaign.",
    ],
    href: "/templates",
    cta: "Open templates",
  },
  {
    id: "segments",
    title: "Build a segment that updates itself",
    text: "Target by tags, engagement or purchase activity.",
    minutes: 3,
    steps: [
      "Open Segments and choose Create Segment.",
      "Add conditions such as tags, recent opens or signup source.",
      "Check the estimated and reachable counts, then save.",
      "Use the segment as a campaign audience. The Used by column shows where it is in use.",
    ],
    href: "/segments",
    cta: "Open segments",
  },
  {
    id: "workflows",
    title: "Automate a welcome series",
    text: "Trigger messages when someone joins a list or submits a form.",
    minutes: 4,
    steps: [
      "Open Workflows and choose Create Workflow.",
      "Pick a trigger, for example Joins Newsletter Subscribers.",
      "Add steps and waits, then review the contacts-processed count.",
      "Activate it. You can pause a workflow at any time without losing its history.",
    ],
    href: "/workflows",
    cta: "Open workflows",
  },
  {
    id: "analytics",
    title: "Read your campaign analytics",
    text: "What each rate means and where to compare campaigns.",
    minutes: 3,
    steps: [
      "Open Analytics and pick a channel and date range.",
      "Open rate is opens of delivered email. It is an estimate because some inboxes block the tracking pixel.",
      "Click-through rate is clicks of delivered messages.",
      "Use Campaign Comparison to compare sends side by side.",
    ],
    href: "/analytics",
    cta: "Open analytics",
  },
];

export const guideById = (id: string) => HELP_GUIDES.find((g) => g.id === id);

export const HELP_FAQ = [
  { q: "Why did my campaign reach fewer people than my list size?", a: "Campaigns only send to reachable contacts. People who unsubscribed, bounced or are suppressed are left out, and the Recipients card tells you how many." },
  { q: "Why is my open rate an estimate?", a: "Opens are counted with an invisible pixel, and some inboxes block it. Click rates are more reliable." },
  { q: "Can I send to more than one list?", a: "Yes. Pick up to 10 lists or segments. People on more than one are counted once." },
  { q: "How do I use my own HTML?", a: "In a campaign or template, choose Import HTML to upload a file, or HTML Editor to paste and edit code." },
  { q: "What do the WhatsApp template statuses mean?", a: "Approved templates can be used in campaigns. In review and Rejected ones cannot until they are approved." },
];

export const SHORTCUTS = [
  { keys: "Ctrl K", label: "Search" },
  { keys: "/", label: "Focus search" },
];

export interface HelpTopic {
  /** Section heading, for example "Help for Campaigns". */
  title: string;
  tips: string[];
  guideIds: string[];
}

const topic = (title: string, tips: string[], guideIds: string[]): HelpTopic => ({ title, tips, guideIds });

const TOPICS: { base: string; topic: HelpTopic }[] = [
  { base: "/campaigns/whatsapp", topic: topic("WhatsApp campaigns", ["WhatsApp sends use approved templates and go only to contacts who opted in.", "Check Templates > WhatsApp Templates for approval status first."], ["first-campaign"]) },
  { base: "/campaigns", topic: topic("Campaigns", ["Use the status tabs and filters to find a campaign fast.", "Create Campaign opens a single-page form: recipients, sender, content, then Review & Launch."], ["first-campaign", "analytics"]) },
  { base: "/templates/whatsapp", topic: topic("WhatsApp templates", ["A template must be Approved before a campaign can use it.", "Use {{first_name}} to personalise a message."], ["first-campaign"]) },
  { base: "/templates", topic: topic("Email templates", ["After you select a gallery template, choose Use template at the bottom of the panel.", "Saved templates are under My Templates."], ["templates"]) },
  { base: "/contacts", topic: topic("Contacts", ["Only Reachable contacts receive campaigns.", "Import a CSV to add many people at once."], ["import-contacts"]) },
  { base: "/lists", topic: topic("Lists", ["Lists are fixed groups you add people to yourself.", "A list in use by a campaign shows how many campaigns use it."], ["import-contacts"]) },
  { base: "/segments", topic: topic("Segments", ["Segments update on their own as contacts match or stop matching.", "Use them for targeting without maintaining lists by hand."], ["segments"]) },
  { base: "/forms", topic: topic("Forms", ["Forms add new signups to a list.", "Submissions and conversion are shown for each form."], ["import-contacts"]) },
  { base: "/workflows", topic: topic("Workflows", ["A workflow runs when its trigger happens, then follows its steps.", "Pause a workflow to stop new contacts entering it."], ["workflows"]) },
  { base: "/integrations", topic: topic("Integrations", ["Connect apps here. Each shows what will sync before you connect.", "Webhooks send a signed message to your address when something happens, like a campaign being sent.", "Connections are simulated in this demo."], ["first-campaign"]) },
  { base: "/tags", topic: topic("Tags", ["A tag is a label on a contact. Add them from Contacts or when you import.", "Use a tag as a segment condition or as a workflow trigger."], ["segments"]) },
  { base: "/preferences", topic: topic("Preferences", ["Subscribers pick the topics they want instead of unsubscribing from everything.", "Topics match the Topic you choose when you create a campaign."], ["first-campaign"]) },
  { base: "/inbox", topic: topic("Inbox", ["Replies to your campaigns collect here when Track Replies is on.", "Mark a conversation done when it is handled. Unsubscribe requests should also be removed in Contacts."], ["first-campaign"]) },
  { base: "/surveys", topic: topic("Surveys", ["Keep surveys short: one to three questions gets the most answers.", "Publish a survey, then copy its link into an email or a form thank-you page."], ["first-campaign"]) },
  { base: "/analytics", topic: topic("Analytics", ["Switch channels and date range at the top.", "Opens are estimates. Clicks are the more reliable signal."], ["analytics"]) },
  { base: "/files", topic: topic("Files", ["Upload images and documents (up to 10 MB each) to reuse in emails.", "Files stay in this browser in the demo."], ["templates"]) },
  { base: "/getting-started", topic: topic("Getting started", ["Steps tick themselves off as you use the app.", "You can do them in any order."], ["first-campaign", "import-contacts"]) },
  { base: "/dashboard", topic: topic("Home", ["The cards compare with the previous 7 days.", "Follow the setup checklist at the top, or start from a template further down."], ["first-campaign", "analytics"]) },
];

/** The help topic for the page the user is on, if any. */
export function topicFor(pathname: string): HelpTopic | null {
  const hit = TOPICS.find((t) => pathname === t.base || pathname.startsWith(`${t.base}/`));
  return hit?.topic ?? null;
}
