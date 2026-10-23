import type { CampaignDraft } from "@/lib/content-session";
import type { EmailBlock, EmailContent } from "@/lib/types/templates";

/**
 * Checks run before a campaign is sent, so problems surface while they can still
 * be fixed. "block" stops sending (saving a draft is always allowed); "warn"
 * is advice the sender can override; "pass" confirms what was checked.
 */
export type CheckLevel = "block" | "warn" | "pass";

export interface Check {
  id: "sender" | "unsubscribe" | "placeholder" | "links" | "subject" | "optout" | "audience";
  level: CheckLevel;
  title: string;
  detail: string;
}

const PLACEHOLDER = /your headline goes here|call to action|add button text|feature headline|short article|another update|start designing your email|add blocks from|lorem ipsum|introduce your message/i;
const SPAMMY = /\b(free money|act now|100% free|winner|guaranteed|no obligation|click here)\b|!{3,}|\${2,}/i;

function walk(blocks: EmailBlock[]): EmailBlock[] {
  return blocks.flatMap((b) => (b.type === "columns" ? [b, ...walk(b.columns.flat())] : [b]));
}

/** Every visible piece of text in a design, for placeholder scans. */
function textOf(content: EmailContent): string {
  if (content.kind === "text") return content.text;
  if (content.kind === "html") return content.html.replace(/<[^>]+>/g, " ");
  return walk(content.blocks)
    .map((b) => (b.type === "heading" || b.type === "text" ? b.text : b.type === "button" ? b.label : b.type === "product" ? `${b.name} ${b.description}` : b.type === "dynamic" ? `${b.text} ${b.fallback}` : ""))
    .join("\n");
}

function hasUnsubscribe(content: EmailContent): boolean {
  if (content.kind === "html") return /unsubscribe|\{\{\s*unsubscribe/i.test(content.html);
  if (content.kind === "text") return /unsubscribe/i.test(content.text);
  return walk(content.blocks).some((b) => b.type === "footer" && b.showUnsubscribe);
}

function emptyLinks(content: EmailContent): number {
  if (content.kind !== "design") return 0;
  return walk(content.blocks).filter((b) => b.type === "button" && (!b.href.trim() || b.href.trim() === "#")).length;
}

/** Email checks. `senderVerified` is whether the sender address has been verified. */
export function checkEmail(draft: CampaignDraft, senderVerified: boolean): Check[] {
  const out: Check[] = [];
  const content = draft.content;

  out.push(
    senderVerified
      ? {
          id: "sender",
          level: "pass",
          title: "Sender verified",
          detail: `${draft.senderEmail} can send on your behalf.`,
        }
      : {
          id: "sender",
          level: "block",
          title: "Verify your sender address",
          detail: `Inboxes may reject or junk mail from ${draft.senderEmail || "an unverified address"}. Verify it to send.`,
        },
  );

  if (content) {
    out.push(
      hasUnsubscribe(content)
        ? {
            id: "unsubscribe",
            level: "pass",
            title: "Unsubscribe link included",
            detail: "Recipients can opt out in one click.",
          }
        : {
            id: "unsubscribe",
            level: "block",
            title: "Add an unsubscribe link",
            detail: "Marketing email must let people opt out. Add a footer block with Unsubscribe turned on, or an unsubscribe link in your HTML.",
          },
    );

    const placeholder = textOf(content).match(PLACEHOLDER);
    out.push(
      placeholder
        ? {
            id: "placeholder",
            level: "warn",
            title: "Placeholder text found",
            detail: `“${placeholder[0]}” looks like sample copy. Replace it before sending.`,
          }
        : {
            id: "placeholder",
            level: "pass",
            title: "No placeholder text",
            detail: "The copy has been filled in.",
          },
    );

    const missing = emptyLinks(content);
    out.push(
      missing
        ? {
            id: "links",
            level: "warn",
            title: `${missing === 1 ? "A button has" : `${missing} buttons have`} no link`,
            detail: "Buttons without a web address lead nowhere. Add a link or remove the button.",
          }
        : {
            id: "links",
            level: "pass",
            title: "Buttons link somewhere",
            detail: "Every button has a web address.",
          },
    );
  }

  const flagged = (subject: string) => {
    const letters = subject.replace(/[^A-Za-z]/g, "");
    return SPAMMY.test(subject) || (letters.length >= 8 && letters === letters.toUpperCase());
  };
  out.push(
    flagged(draft.subject.trim()) || (draft.abTest && flagged(draft.abTest.subjectB.trim()))
      ? {
          id: "subject",
          level: "warn",
          title: "Subject may trigger spam filters",
          detail: "Avoid all capitals, repeated punctuation and phrases like “act now”. They lower inbox placement.",
        }
      : {
          id: "subject",
          level: "pass",
          title: "Subject looks safe",
          detail: "No common spam triggers.",
        },
  );

  return out;
}

/** SMS checks: carriers expect a way to opt out. */
export function checkSms(draft: CampaignDraft): Check[] {
  const message = draft.message;
  return [
    /\bstop\b/i.test(message)
      ? {
          id: "optout",
          level: "pass",
          title: "Opt-out instructions included",
          detail: "Recipients can reply STOP.",
        }
      : {
          id: "optout",
          level: "warn",
          title: "Add opt-out instructions",
          detail: "Include “Reply STOP to opt out” so recipients can unsubscribe and carriers don't flag the message.",
        },
  ];
}

export const blocking = (checks: Check[]) => checks.filter((c) => c.level === "block");
export const warnings = (checks: Check[]) => checks.filter((c) => c.level === "warn");
