"use client";

import { useRef, type ReactNode } from "react";
import { ChatCircleDotsIcon, EnvelopeSimpleIcon, FlaskIcon, GearSixIcon, InfoIcon, PaperclipIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Switch } from "@/components/shared/email-ui";
import type { CampaignDraft } from "@/lib/content-session";
import type { AbTest } from "@/lib/types/campaigns";
import { smsSegments } from "@/lib/campaign-meta";
import { CURRENT_USER, DEFAULT_SENDER } from "@/lib/mock-data/campaigns";
import { SMS_MAX } from "@/lib/schemas/campaign";
import { cn } from "@/lib/utils";
import type { DraftErrors } from "./draft";
import { MessageEditor } from "@/components/whatsapp/wa-ui";
import { editorInputClass, EditorCard, EditorRow, EmailPickerInput, InlineInput, PersonalizedInput } from "./fields";

type Set = <K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) => void;

/** Sender addresses offered in the From Email dropdown (any valid address can be typed). */
const KNOWN_SENDERS = [DEFAULT_SENDER.email, CURRENT_USER.email, "news@evoq.one", "support@evoq.one"];
const PERSONALIZE_HINT = "Type @ to add personalization and : to insert emojis";

export function EmailDetailsCard({ draft, set, errors, disabled }: { draft: CampaignDraft; set: Set; errors: DraftErrors; disabled?: boolean }) {
  return (
    <EditorCard id="email-details" icon={EnvelopeSimpleIcon} title="Email Details">
      <div className="pb-4">
        <datalist id="known-senders">
          {KNOWN_SENDERS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <EditorRow label="From Email" required htmlFor="f-senderEmail" error={errors.senderEmail}>
          <EmailPickerInput id="f-senderEmail" type="email" options={KNOWN_SENDERS} value={draft.senderEmail} onChange={(v) => set("senderEmail", v)} invalid={!!errors.senderEmail} placeholder="name@yourdomain.com" disabled={disabled} autoComplete="off" />
        </EditorRow>
        <EditorRow label="From Name" required htmlFor="f-senderName" error={errors.senderName}>
          <InlineInput id="f-senderName" value={draft.senderName} onChange={(e) => set("senderName", e.target.value)} invalid={!!errors.senderName} placeholder="Your name" maxLength={60} disabled={disabled} />
        </EditorRow>
        <EditorRow label="Reply-to" required htmlFor="f-replyTo" error={errors.replyTo}>
          <InlineInput id="f-replyTo" type="email" list="known-senders" value={draft.replyTo} onChange={(e) => set("replyTo", e.target.value)} invalid={!!errors.replyTo} placeholder="name@yourdomain.com" disabled={disabled} autoComplete="off" />
        </EditorRow>
        <EditorRow label="Subject" required htmlFor="f-subject" error={errors.subject}>
          <PersonalizedInput id="f-subject" value={draft.subject} onChange={(v) => set("subject", v)} invalid={!!errors.subject} placeholder={PERSONALIZE_HINT} maxLength={150} />
        </EditorRow>
        <AbTestRow draft={draft} set={set} error={errors.subjectB} disabled={disabled} />
        <EditorRow label="Preheader" htmlFor="f-previewText" error={errors.previewText}>
          <PersonalizedInput id="f-previewText" value={draft.previewText} onChange={(v) => set("previewText", v)} invalid={!!errors.previewText} placeholder={PERSONALIZE_HINT} maxLength={150} />
        </EditorRow>
      </div>
    </EditorCard>
  );
}

const DEFAULT_AB: AbTest = { subjectB: "", testPercent: 20, metric: "opens", hours: 4 };
const TEST_SIZES = [10, 20, 30, 40, 50];
const TEST_HOURS = [1, 2, 4, 12, 24];

const selectClass = cn(editorInputClass, "h-10 pr-8");

/** Subject-line A/B test: a link to start one, then Subject B and how the winner is chosen. */
function AbTestRow({ draft, set, error, disabled }: { draft: CampaignDraft; set: Set; error?: string; disabled?: boolean }) {
  const t = draft.abTest;
  if (!t) {
    return (
      <div className="px-5 pb-1 sm:pl-[140px]">
        <button type="button" disabled={disabled} onClick={() => set("abTest", { ...DEFAULT_AB })} className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-brand hover:text-brand-press focus-visible:outline-2 focus-visible:outline-brand-action disabled:opacity-60">
          <FlaskIcon size={15} aria-hidden /> Create A/B test
        </button>
        <span className="ml-2 text-[12px] text-ink-muted">Try two subject lines and send the better one to everyone else.</span>
      </div>
    );
  }
  const patch = (p: Partial<AbTest>) => set("abTest", { ...t, ...p });
  const rest = 100 - t.testPercent;
  return (
    <div className="mx-5 my-2 rounded-xl border border-campaign-soft bg-campaign-surface/60 p-4 sm:ml-[140px]" role="group" aria-label="A/B test">
      <div className="flex items-center gap-2">
        <FlaskIcon size={16} aria-hidden className="text-campaign-action" />
        <p className="text-[13.5px] font-semibold text-ink">A/B test</p>
        <button type="button" onClick={() => set("abTest", null)} disabled={disabled} className="ml-auto rounded text-[12.5px] font-medium text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-action">
          Remove test
        </button>
      </div>
      <p className="mt-1 text-[12.5px] text-ink-muted">Your subject above is version A.</p>
      <div className="mt-3 grid gap-1.5">
        <label htmlFor="f-subjectB" className="text-[13px] font-medium text-ink">
          Subject B<span className="ml-0.5 text-[#E5484D]" aria-hidden>*</span>
        </label>
        <PersonalizedInput id="f-subjectB" value={t.subjectB} onChange={(v) => patch({ subjectB: v })} invalid={!!error} placeholder={PERSONALIZE_HINT} maxLength={150} />
        {error && (
          <p id="f-subjectB-error" role="alert" className="text-[12px] leading-4 font-medium text-[#D92D20]">
            {error}
          </p>
        )}
      </div>
      <div className="mt-3 grid gap-2.5">
        <label className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px] font-medium text-ink">
          Test group
          <select value={t.testPercent} onChange={(e) => patch({ testPercent: Number(e.target.value) })} className={cn(selectClass, "w-[200px]")} disabled={disabled}>
            {TEST_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}% of recipients
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px] font-medium text-ink">
          Winner has more
          <select value={t.metric} onChange={(e) => patch({ metric: e.target.value as AbTest["metric"] })} className={cn(selectClass, "w-[200px]")} disabled={disabled}>
            <option value="opens">Opens</option>
            <option value="clicks">Clicks</option>
          </select>
        </label>
        <label className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px] font-medium text-ink">
          Test runs for
          <select value={t.hours} onChange={(e) => patch({ hours: Number(e.target.value) })} className={cn(selectClass, "w-[200px]")} disabled={disabled}>
            {TEST_HOURS.map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "hour" : "hours"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[12.5px] leading-[18px] text-ink-body">
        <InfoIcon size={14} aria-hidden className="mt-0.5 shrink-0 text-ink-muted" />
        <span>
          Version A and version B each go to {t.testPercent / 2}% of your recipients. After {t.hours} {t.hours === 1 ? "hour" : "hours"}, the version with more {t.metric} is sent to the other {rest}%.
        </span>
      </p>
    </div>
  );
}

export function SmsDetailsCard({ draft, set, errors, senderId }: { draft: CampaignDraft; set: Set; errors: DraftErrors; senderId?: string }) {
  const n = [...draft.message].length;
  const seg = smsSegments(draft.message);
  return (
    <EditorCard id="sms-details" icon={ChatCircleDotsIcon} title="SMS Details">
      <div className="pb-4">
        <EditorRow label="Sender ID">
          <span className={cn(editorInputClass, "flex items-center justify-between gap-3 bg-campaign-muted")}>
            <span>{senderId ?? DEFAULT_SENDER.smsId}</span>
            <span className="truncate text-[12px] text-ink-muted">Registered sender</span>
          </span>
        </EditorRow>
        <EditorRow label="Message" required htmlFor="f-message" error={errors.message} className="sm:items-start [&>label]:sm:pt-3">
          <div className="w-full">
            <MessageEditor id="f-message" value={draft.message} onChange={(v) => set("message", v)} max={SMS_MAX} invalid={!!errors.message} rows={5} placeholder="EVOQ: … Reply STOP to opt out" />
            <p className="mt-1 text-[12px] text-ink-muted tabular-nums">
              {seg || 0} SMS segment{seg === 1 ? "" : "s"} · 160 characters fit in one, 153 each when split{n > 0 && /{{/.test(draft.message) ? " · personalization adds a few characters per contact" : ""}
            </p>
          </div>
        </EditorRow>
      </div>
    </EditorCard>
  );
}

const MAX_ATTACH_BYTES = 10 * 1024 * 1024;
const fileSize = (b: number) => (b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

function ConfigRow({ title, description, children, className }: { title: string; description: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line-soft px-5 py-4 first:border-t-0", className)}>
      <div className="min-w-0 flex-1 basis-[240px]">
        <p className="text-[14px] leading-5 font-medium text-campaign-depth">{title}</p>
        <p className="mt-1 text-[13px] leading-[18px] text-ink-muted">{description}</p>
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}

export function OtherConfigCard({ draft, set, sms }: { draft: CampaignDraft; set: Set; sms: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const total = draft.attachments.reduce((s, a) => s + a.size, 0);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    let size = total;
    const next = [...draft.attachments];
    for (const f of Array.from(files)) {
      if (next.some((a) => a.name === f.name)) continue;
      if (size + f.size > MAX_ATTACH_BYTES) {
        toast.error("Attachments are limited to 10 MB in total", { description: `${f.name} wasn't added.` });
        continue;
      }
      size += f.size;
      next.push({ name: f.name, size: f.size });
    }
    set("attachments", next);
  };

  return (
    <EditorCard id="other-config" icon={GearSixIcon} title="Other Configuration">
      <div className="pb-1">
        {!sms && (
          <ConfigRow title="Track Replies" description="Automatically track and forward responses to your selected Reply-to address.">
            <Switch checked={draft.trackReplies} onChange={(v) => set("trackReplies", v)} label="Track replies" />
          </ConfigRow>
        )}
        {!sms && (
          <ConfigRow title="Track Opens" description="Count opens with an invisible pixel. Some inboxes block it, so opens are an estimate.">
            <Switch checked={draft.trackOpens} onChange={(v) => set("trackOpens", v)} label="Track opens" />
          </ConfigRow>
        )}
        <ConfigRow title="Track Link Clicks" description={sms ? "Shorten links so clicks show in the report." : "Wrap links so clicks show in the report, per link."}>
          <Switch checked={draft.trackClicks} onChange={(v) => set("trackClicks", v)} label="Track link clicks" />
        </ConfigRow>
        {!sms && (
          <ConfigRow title="File Attachments" description="Attach files to your email campaign — up to 10 MB in total.">
            <input
              ref={fileRef}
              type="file"
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-campaign-soft bg-white px-4 text-[14px] font-medium text-campaign-action transition-colors hover:border-campaign-action hover:bg-campaign-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-action"
            >
              <PaperclipIcon size={17} aria-hidden /> Attach Files
            </button>
          </ConfigRow>
        )}
        {!sms && draft.attachments.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 px-5 pb-4" aria-label="Attachments">
            {draft.attachments.map((a) => (
              <li key={a.name} className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-campaign-soft bg-campaign-surface py-1 pr-1 pl-2.5 text-[12.5px] text-ink-body">
                <PaperclipIcon size={13} aria-hidden className="shrink-0 text-campaign-action" />
                <span className="truncate">{a.name}</span>
                <span className="text-ink-muted">{fileSize(a.size)}</span>
                <button type="button" onClick={() => set("attachments", draft.attachments.filter((x) => x.name !== a.name))} aria-label={`Remove ${a.name}`} className="inline-flex size-5 items-center justify-center rounded text-ink-muted hover:bg-white hover:text-ink">
                  <XIcon size={11} weight="bold" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </EditorCard>
  );
}
