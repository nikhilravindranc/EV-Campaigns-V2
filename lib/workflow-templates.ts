import type { TriggerType, WorkflowStep } from "@/lib/types/workspace";

export type TemplateStep = Omit<WorkflowStep, "id" | "otherwise"> & { otherwise?: TemplateStep[] };

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  /** Shown as a tag on the card. */
  goal: "Welcome" | "Re-engage" | "Sales" | "Events" | "Loyalty";
  trigger: { type: TriggerType; value?: string };
  steps: TemplateStep[];
}

const email = (subject: string): TemplateStep => ({ type: "email", subject });
const wait = (delay: number, unit: "hours" | "days" = "days"): TemplateStep => ({ type: "wait", delay, unit });
const tag = (value: string): TemplateStep => ({ type: "update", action: "add-tag", actionValue: value });
const when = (condition: "opened" | "clicked", otherwise?: TemplateStep[]): TemplateStep => ({ type: "condition", condition, otherwise });
const end: TemplateStep = { type: "end" };

/** Ready-made journeys. Pick the list, form or tag that starts them after choosing one. */
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "welcome-series",
    name: "Welcome series",
    description: "Greet new subscribers, then follow up differently depending on whether they opened your first email.",
    goal: "Welcome",
    trigger: { type: "list-join", value: "" },
    steps: [email("Welcome to {{org_name}} 👋"), wait(2), when("opened", [email("Did you see our welcome?")]), email("3 ways to get started"), tag("onboarded"), end],
  },
  {
    id: "win-back",
    name: "Win back inactive customers",
    description: "Re-engage people who stopped opening, with a last-chance offer for those who ignore the first email.",
    goal: "Re-engage",
    trigger: { type: "tag-added", value: "inactive-90" },
    steps: [email("We miss you, {{first_name}}"), wait(3), when("clicked", [email("Last chance: 20% off to come back")]), tag("re-engaged"), end],
  },
  {
    id: "post-purchase",
    name: "Post-purchase thank you",
    description: "Say thanks after a purchase, then ask for a review a week later.",
    goal: "Sales",
    trigger: { type: "tag-added", value: "purchased" },
    steps: [wait(1), email("Thanks for your order, {{first_name}}"), wait(7), email("How did we do? Leave a quick review"), end],
  },
  {
    id: "webinar-follow-up",
    name: "Webinar follow-up",
    description: "Send the recording to registrants and nudge those who didn't click through.",
    goal: "Events",
    trigger: { type: "form-submit", value: "" },
    steps: [wait(1), email("Your webinar recording and slides"), wait(2), when("clicked", [email("Here's what you missed")]), tag("webinar-attendee"), end],
  },
  {
    id: "birthday",
    name: "Birthday greeting",
    description: "A birthday email with a gift code, sent on the day.",
    goal: "Loyalty",
    trigger: { type: "date-field", value: "birthday" },
    steps: [email("Happy birthday, {{first_name}} 🎂 here's a gift"), end],
  },
  {
    id: "lead-nurture",
    name: "Lead nurture",
    description: "Follow up a new lead over a week and invite them to book a call.",
    goal: "Sales",
    trigger: { type: "form-submit", value: "" },
    steps: [email("Thanks for getting in touch"), wait(2), email("How we help teams like yours"), wait(3), when("opened", [email("Quick question about your goals")]), email("Book a 15-minute call"), end],
  },
];

export const templateById = (id: string | undefined) => WORKFLOW_TEMPLATES.find((t) => t.id === id);

let seq = 0;
/** Fresh step ids for a template's steps, branches included. */
export function instantiate(steps: TemplateStep[]): WorkflowStep[] {
  return steps.map((s) => {
    const { otherwise, ...rest } = s;
    return { id: `step-${Date.now().toString(36)}-${++seq}`, ...rest, ...(otherwise ? { otherwise: instantiate(otherwise) } : {}) };
  });
}
