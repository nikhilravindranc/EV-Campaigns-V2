"use client";

import { useState, type ReactNode } from "react";
import { CalendarCheckIcon, CheckCircleIcon, FloppyDiskIcon, PaperPlaneTiltIcon, ShieldCheckIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fieldClass, OutlineButton, PrimaryButton } from "@/components/shared/campaign-ui";
import { EmailThumb } from "@/components/shared/email-ui";
import { useAudienceEstimate } from "@/hooks/use-audience";
import { useAudiences } from "@/hooks/use-campaigns";
import { canSchedule, isSms } from "@/lib/campaign-meta";
import { blocking, checkEmail, checkSms, warnings, type Check } from "@/lib/compliance";
import type { CampaignDraft } from "@/lib/content-session";
import { addDays, formatDateTime, formatNumber } from "@/lib/format";
import { hour12, sendTimeAdvice } from "@/lib/send-time";
import { DEMO_TODAY } from "@/lib/mock-data/campaigns";
import type { Campaign } from "@/lib/types/campaigns";
import { cn } from "@/lib/utils";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 border-b border-line-soft py-2.5 text-[13px] leading-5 last:border-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

export function ReviewDialog({
  open,
  onOpenChange,
  campaign: c,
  draft,
  saving,
  senderVerified,
  onVerifySender,
  onSaveDraft,
  onSchedule,
  onSendNow,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  campaign: Campaign;
  draft: CampaignDraft;
  saving: boolean;
  senderVerified: boolean;
  onVerifySender: () => void;
  onSaveDraft: () => void;
  onSchedule: (at: string) => void;
  onSendNow: () => void;
}) {
  const sms = isSms(c);
  const { data: audiences } = useAudiences();
  const chosen = (audiences ?? []).filter((a) => draft.audienceIds.includes(a.id));
  const { data: estimate } = useAudienceEstimate(
    {
      listIds: chosen.filter((a) => a.kind !== "segment").map((a) => a.id),
      segmentIds: chosen.filter((a) => a.kind === "segment").map((a) => a.id),
    },
    open && chosen.length > 0,
  );
  const existing = c.status !== "draft" && c.scheduledAt ? c.scheduledAt : undefined;
  const [date, setDate] = useState(existing?.slice(0, 10) ?? (c.scheduledAt && c.scheduledAt.slice(0, 10) > DEMO_TODAY ? c.scheduledAt.slice(0, 10) : addDays(DEMO_TODAY, 1)));
  const [time, setTime] = useState(existing?.slice(11, 16) ?? "09:00");
  const [dateError, setDateError] = useState("");
  const schedulable = canSchedule(c);
  const [mode, setMode] = useState<"now" | "best" | "later">("later");
  const advice = sendTimeAdvice(draft.audienceIds.join(","), DEMO_TODAY);
  const checks = sms ? checkSms(draft) : checkEmail(draft, senderVerified);
  const blockers = blocking(checks);
  const suggestions = warnings(checks);

  const schedule = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return setDateError("Choose a send date and time");
    if (date < DEMO_TODAY) return setDateError("Choose a date in the future");
    setDateError("");
    onSchedule(`${date}T${time}:00`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(820px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="flex items-start gap-3 border-b border-line-soft px-5 pt-5 pb-4 pr-12">
          <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg", blockers.length ? "bg-[var(--danger-bg)] text-[#D92D20]" : "bg-[var(--success-bg)] text-[var(--success)]")} aria-hidden>
            {blockers.length ? <WarningCircleIcon size={20} weight="fill" /> : <CheckCircleIcon size={20} weight="fill" />}
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-[17px] font-semibold text-ink">Review and launch</DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] text-ink-muted">
              {blockers.length ? `${blockers.length} ${blockers.length === 1 ? "thing needs" : "things need"} fixing before this can be sent.` : suggestions.length ? "Ready to send. Review the suggestions below first." : "Everything checks out."} This
              demo never sends real messages.
            </DialogDescription>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-5 py-4 scrollbar-thin md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="min-w-0">
            <dl>
              <Row label="Campaign">{draft.name}</Row>
              <Row label="Recipients">
                {chosen.map((a) => a.name).join(", ")}
                <span className="block text-[12px] text-ink-muted">{estimate ? `≈ ${formatNumber(estimate.eligible)} ${sms ? "phone numbers" : "contacts"} will receive it` : "Estimating…"}</span>
              </Row>
              <Row label="Topic">{draft.topic}</Row>
              {sms ? (
                <Row label="Message">{draft.message}</Row>
              ) : (
                <>
                  <Row label="From">
                    {draft.senderName} &lt;{draft.senderEmail}&gt;
                  </Row>
                  <Row label="Reply-to">{draft.replyTo}</Row>
                  <Row label="Subject">
                    {draft.subject}
                    {draft.previewText && <span className="block text-[12px] text-ink-muted">{draft.previewText}</span>}
                  </Row>
                  {draft.abTest && (
                  <Row label="A/B test">
                    B: {draft.abTest.subjectB}
                    <span className="block text-[12px] text-ink-muted">
                      {draft.abTest.testPercent}% of recipients, winner by {draft.abTest.metric} after {draft.abTest.hours} {draft.abTest.hours === 1 ? "hour" : "hours"}
                    </span>
                  </Row>
                )}
                <Row label="Content">{draft.contentSource || "Custom content"}</Row>
                  <Row label="Tracking">{[draft.trackOpens && "Opens", draft.trackClicks && "Clicks", draft.trackReplies && "Replies"].filter(Boolean).join(", ") || "Off"}</Row>
                  {draft.attachments.length > 0 && <Row label="Attachments">{draft.attachments.map((a) => a.name).join(", ")}</Row>}
                </>
              )}
            </dl>
            <div className="mt-4">
              <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                <ShieldCheckIcon size={16} aria-hidden /> Pre-send checks
              </h3>
              <ul className="mt-2 space-y-1.5">
                {checks.map((k) => (
                  <CheckRow key={k.id} check={k} onVerify={onVerifySender} />
                ))}
              </ul>
            </div>
          </div>
          {!sms && draft.content && (
            <div className="hidden overflow-hidden rounded-lg border border-line md:block">
              <EmailThumb eager content={draft.content} className="h-[300px] w-full" />
            </div>
          )}
        </div>

        <div className="border-t border-line-soft bg-campaign-muted px-5 py-4">
          {schedulable ? (
            <div className="flex flex-wrap items-end gap-3">
              <div role="radiogroup" aria-label="When to send" className="inline-flex rounded-lg border border-line bg-white p-0.5">
                {(
                  [
                    ["now", "Send now"],
                    ["best", "Best time"],
                    ["later", "Schedule"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={mode === key}
                    onClick={() => setMode(key)}
                    className={cn("h-8 rounded-md px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-action", mode === key ? "bg-brand text-white" : "text-ink-body hover:text-ink")}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {mode === "best" && !sms && (
                <div className="w-full rounded-xl border border-campaign-soft bg-white p-3">
                  <p className="text-[13px] font-medium text-ink">
                    Best time for this audience: <span className="text-campaign-action">{advice.label}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">
                    Your contacts open most around {hour12(advice.peak)}. Sending then is estimated to bring about {advice.liftPercent}% more opens than 9:00 AM. It will go out on {formatDateTime(advice.at)}.
                  </p>
                  <div className="mt-2 flex h-10 items-end gap-0.5" role="img" aria-label={`Opens by hour of day, highest around ${hour12(advice.peak)}`}>
                    {advice.hours.map((v, i) => (
                      <span key={i} className={cn("flex-1 rounded-sm", i === advice.peak ? "bg-brand" : "bg-campaign-soft")} style={{ height: `${Math.max(6, v * 100)}%` }} title={`${hour12(i)}`} />
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between text-[10.5px] text-ink-faint" aria-hidden>
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>11 PM</span>
                  </div>
                </div>
              )}
              {mode === "later" && (
                <>
                  <div className="grid gap-1">
                    <label htmlFor="review-date" className="text-field-label text-ink-body">
                      Send date
                    </label>
                    <input id="review-date" type="date" min={DEMO_TODAY} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={dateError ? true : undefined} className={cn(fieldClass, "w-[160px]")} />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="review-time" className="text-field-label text-ink-body">
                      Time
                    </label>
                    <input id="review-time" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} className={cn(fieldClass, "w-[120px]")} />
                  </div>
                </>
              )}
              <div className="ml-auto flex flex-wrap gap-2">
                <OutlineButton icon={FloppyDiskIcon} onClick={onSaveDraft} disabled={saving}>
                  Save Draft
                </OutlineButton>
                <PrimaryButton
                  icon={mode === "now" ? PaperPlaneTiltIcon : CalendarCheckIcon}
                  onClick={mode === "now" ? onSendNow : mode === "best" ? () => onSchedule(advice.at) : schedule}
                  disabled={saving || blockers.length > 0}
                  title={blockers.length ? "Fix the checks above to send" : undefined}
                >
                  {saving ? "Working…" : mode === "now" ? "Send now" : mode === "best" ? "Schedule at best time" : existing ? "Reschedule Campaign" : "Schedule Campaign"}
                </PrimaryButton>
              </div>
              {blockers.length > 0 ? (
                <p role="alert" className="w-full text-[12px] font-medium text-[#D92D20]">
                  Fix {blockers.length === 1 ? "the check" : "the checks"} marked “Required” to send. You can still save a draft.
                </p>
              ) : dateError ? (
                <p role="alert" className="w-full text-[12px] font-medium text-[#DC2626]">
                  {dateError}
                </p>
              ) : (
                mode === "later" && existing && <p className="w-full text-[12px] text-ink-muted">Currently scheduled for {formatDateTime(existing)}. Times use your local time zone.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <p className="mr-auto text-[12.5px] text-ink-muted">Automations and journeys start from their trigger — save the changes to keep them.</p>
              <PrimaryButton icon={FloppyDiskIcon} onClick={onSaveDraft} disabled={saving}>
                Save changes
              </PrimaryButton>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** One pre-send check: a tick, a warning or a required fix (with a one-click verify for the sender). */
function CheckRow({ check: k, onVerify }: { check: Check; onVerify: () => void }) {
  const Icon = k.level === "pass" ? CheckCircleIcon : k.level === "warn" ? WarningIcon : WarningCircleIcon;
  const tone = k.level === "pass" ? "text-[var(--success)]" : k.level === "warn" ? "text-[var(--warning)]" : "text-[#D92D20]";
  return (
    <li className="flex items-start gap-2.5 rounded-lg border border-line-soft bg-white px-3 py-2">
      <Icon size={18} weight="fill" className={cn("mt-0.5 shrink-0", tone)} aria-hidden />
      <span className="min-w-0 flex-1 text-[12.5px] leading-5">
        <span className="font-medium text-ink">
          {k.title}
          {k.level === "block" && <span className="ml-2 rounded bg-[var(--danger-bg)] px-1.5 text-[11px] font-semibold text-[#D92D20]">Required</span>}
          <span className="sr-only">{k.level === "pass" ? " (passed)" : k.level === "warn" ? " (suggestion)" : " (required)"}</span>
        </span>
        <span className="block text-ink-muted">{k.detail}</span>
      </span>
      {k.id === "sender" && k.level === "block" && (
        <button type="button" onClick={onVerify} className="shrink-0 rounded-lg border border-line bg-white px-2.5 py-1 text-[12px] font-medium text-brand hover:border-brand-soft focus-visible:outline-2 focus-visible:outline-brand-action">
          Verify now
        </button>
      )}
    </li>
  );
}
