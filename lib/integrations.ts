/**
 * The integrations catalog and webhook settings. Connections are simulated: nothing is sent to
 * the apps, and what you connect is remembered in this browser only.
 */
export type IntegrationCategory = "CRM" | "Ecommerce" | "Automation" | "Analytics" | "Design" | "Lead capture";

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  /** What flows between the app and EVOQ once connected. */
  syncs: string[];
  /** Tile colours for the letter logo. */
  fg: string;
  bg: string;
  /** What to ask for when connecting (never a password or key). */
  account?: { label: string; placeholder: string };
  /** Made by EVOQ. */
  native?: boolean;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = ["CRM", "Ecommerce", "Automation", "Analytics", "Design", "Lead capture"];

export const INTEGRATIONS: Integration[] = [
  { id: "evoq-crm", name: "EVOQ CRM", category: "CRM", description: "Use customer records, opportunities and activities from EVOQ CRM as your audience, and send engagement back to each record.", syncs: ["Contacts and companies", "Opportunities", "Email activity on each record"], fg: "#5B21B6", bg: "#F3E8FF", native: true },
  { id: "salesforce", name: "Salesforce", category: "CRM", description: "Sync leads and contacts both ways so campaigns reach the right people and results show up in Salesforce.", syncs: ["Leads and contacts", "Campaign members", "Opens and clicks"], fg: "#0B6CB5", bg: "#E5F2FB", account: { label: "Salesforce org", placeholder: "yourcompany.my.salesforce.com" } },
  { id: "hubspot", name: "HubSpot", category: "CRM", description: "Import HubSpot contacts and lists, and log every send on the contact timeline.", syncs: ["Contacts and lists", "Lifecycle stage", "Email activity"], fg: "#D9542C", bg: "#FDEBE4", account: { label: "HubSpot portal", placeholder: "Portal ID" } },
  { id: "shopify", name: "Shopify", category: "Ecommerce", description: "Bring in customers, orders and products to target buyers and add product blocks to emails.", syncs: ["Customers", "Orders and revenue", "Products"], fg: "#3F7F2A", bg: "#EAF4E5", account: { label: "Store address", placeholder: "your-store.myshopify.com" } },
  { id: "woocommerce", name: "WooCommerce", category: "Ecommerce", description: "Sync your WooCommerce store to segment by purchases and send order follow-ups.", syncs: ["Customers", "Orders", "Products"], fg: "#7F54B3", bg: "#F1EAF8", account: { label: "Store address", placeholder: "https://shop.example.com" } },
  { id: "zapier", name: "Zapier", category: "Automation", description: "Connect EVOQ to thousands of apps. Add contacts, tag people and trigger workflows from other tools.", syncs: ["Triggers: new contact, email opened", "Actions: add contact, add tag"], fg: "#E8590C", bg: "#FFF0E6" },
  { id: "meta-leads", name: "Meta Leads", category: "Lead capture", description: "Send leads from Facebook and Instagram lead ads straight into a list.", syncs: ["Lead form answers", "Ad and campaign names"], fg: "#1877F2", bg: "#E7F0FE", account: { label: "Ad account", placeholder: "Ad account ID" } },
  { id: "google-analytics", name: "Google Analytics", category: "Analytics", description: "Tag email links automatically and see revenue and conversions from campaigns in your reports.", syncs: ["UTM parameters on links", "Conversions and revenue"], fg: "#E37400", bg: "#FFF3E0", account: { label: "Measurement ID", placeholder: "G-XXXXXXXXXX" } },
  { id: "canva", name: "Canva", category: "Design", description: "Design images in Canva and drop them into emails from the Files library.", syncs: ["Designs to the Files library"], fg: "#00A4B8", bg: "#E0F6F9" },
];

export interface ConnectedApp {
  connectedAt: string;
  account: string;
}

export type WebhookEvent = "campaign.sent" | "email.opened" | "email.clicked" | "contact.unsubscribed" | "form.submitted";

export const WEBHOOK_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: "campaign.sent", label: "A campaign is sent" },
  { value: "email.opened", label: "An email is opened" },
  { value: "email.clicked", label: "A link is clicked" },
  { value: "contact.unsubscribed", label: "A contact unsubscribes" },
  { value: "form.submitted", label: "A form is submitted" },
];

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  /** Signing secret, shown once in this demo. */
  secret: string;
  createdAt: string;
  active: boolean;
}

export interface IntegrationSettings {
  apps: Record<string, ConnectedApp>;
  webhooks: Webhook[];
  apiKey?: string;
}

export const NO_SETTINGS: IntegrationSettings = { apps: {}, webhooks: [] };
export const SETTINGS_KEY = "evoq-campaigns:integrations";

/** A random-looking token for demo secrets and keys. */
export function token(prefix: string, length = 24): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return `${prefix}${Array.from(bytes, (b) => chars[b % chars.length]).join("")}`;
}

/** Only secure addresses can receive events. */
export function validateWebhookUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:") return "Use a secure address that starts with https://";
    if (!u.hostname.includes(".") || /^(localhost|127\.|10\.|192\.168\.)/.test(u.hostname)) return "Use a public address, not localhost or a private network";
    return null;
  } catch {
    return "Enter a full address, for example https://example.com/hooks/evoq";
  }
}

/** The JSON body a webhook receives for an event (sample values). */
export function samplePayload(event: WebhookEvent): string {
  const base = { id: "evt_demo_1042", type: event, created: new Date().toISOString() };
  const data: Record<WebhookEvent, object> = {
    "campaign.sent": { campaign: { id: "cmp-1001", name: "Summer Sale Email" }, recipients: 4980 },
    "email.opened": { campaign: { id: "cmp-1001" }, contact: { email: "alex@example.com" }, device: "Mobile" },
    "email.clicked": { campaign: { id: "cmp-1001" }, contact: { email: "alex@example.com" }, url: "https://evoq.one/sale" },
    "contact.unsubscribed": { contact: { email: "alex@example.com" }, source: "email footer" },
    "form.submitted": { form: { id: "form-1", name: "Newsletter Signup" }, contact: { email: "alex@example.com" } },
  };
  return JSON.stringify({ ...base, data: data[event] }, null, 2);
}
