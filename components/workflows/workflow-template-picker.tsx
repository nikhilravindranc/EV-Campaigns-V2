"use client";

import type { Icon } from "@phosphor-icons/react";
import { ClockIcon, EnvelopeSimpleIcon, FlagCheckeredIcon, GitBranchIcon, LightningIcon, PlusIcon, UserGearIcon } from "@phosphor-icons/react/dist/ssr";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { pluralize } from "@/lib/format";
import { WORKFLOW_TEMPLATES, type TemplateStep, type WorkflowTemplate } from "@/lib/workflow-templates";
import { cn } from "@/lib/utils";

const ICON: Record<TemplateStep["type"], { icon: Icon; fg: string; bg: string }> = {
  email: { icon: EnvelopeSimpleIcon, fg: "var(--ch-email-fg)", bg: "var(--ch-email-bg)" },
  wait: { icon: ClockIcon, fg: "var(--ch-journey-fg)", bg: "var(--ch-journey-bg)" },
  condition: { icon: GitBranchIcon, fg: "var(--ch-automation-fg)", bg: "var(--ch-automation-bg)" },
  update: { icon: UserGearIcon, fg: "var(--ch-sms-fg)", bg: "var(--ch-sms-bg)" },
  end: { icon: FlagCheckeredIcon, fg: "var(--neutral-fg)", bg: "var(--neutral-bg)" },
};

/** The journey at a glance: trigger, then each step as a small icon, joined by a line. */
function FlowPreview({ steps }: { steps: TemplateStep[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-y-1.5" aria-hidden>
      <li className="inline-flex size-7 items-center justify-center rounded-lg bg-campaign-tint text-campaign-action">
        <LightningIcon size={14} />
      </li>
      {steps.map((s, i) => {
        const m = ICON[s.type];
        return (
          <li key={i} className="flex items-center">
            <span className="h-px w-2.5 bg-campaign-soft" />
            <span className="relative inline-flex size-7 items-center justify-center rounded-lg" style={{ color: m.fg, backgroundColor: m.bg }}>
              <m.icon size={14} />
              {s.otherwise?.length ? <span className="absolute -right-1 -bottom-1 size-2.5 rounded-full bg-[var(--warning)] ring-2 ring-white" /> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const count = (steps: TemplateStep[]): number => steps.reduce((n, s) => n + (s.type === "end" ? 0 : 1) + (s.otherwise ? count(s.otherwise) : 0), 0);

export function WorkflowTemplatePicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (template: WorkflowTemplate | null) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(780px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="border-b border-line-soft px-5 pt-5 pb-4 pr-12">
          <DialogTitle className="text-[17px] font-semibold text-ink">Create a workflow</DialogTitle>
          <DialogDescription className="mt-0.5 text-[13px] text-ink-muted">Start from a ready-made journey and change anything, or build your own from a blank canvas.</DialogDescription>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin sm:p-5">
          <ul className="grid gap-3 sm:grid-cols-2">
            <li>
              <button
                type="button"
                onClick={() => onPick(null)}
                className="flex h-full w-full flex-col items-start gap-2 rounded-xl border border-dashed border-campaign-soft bg-white p-4 text-left transition-colors hover:border-campaign-action hover:bg-campaign-surface focus-visible:outline-2 focus-visible:outline-brand-action"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-campaign-tint text-campaign-action">
                  <PlusIcon size={18} weight="bold" aria-hidden />
                </span>
                <span className="text-[14px] font-semibold text-ink">Start from scratch</span>
                <span className="text-[12.5px] leading-[18px] text-ink-muted">Pick a trigger and add emails, waits and conditions one at a time.</span>
              </button>
            </li>
            {WORKFLOW_TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onPick(t)}
                  className={cn("flex h-full w-full flex-col items-start gap-2 rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-campaign-action hover:bg-campaign-surface focus-visible:outline-2 focus-visible:outline-brand-action")}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold text-ink">{t.name}</span>
                    <span className="shrink-0 rounded-md bg-campaign-muted px-1.5 py-0.5 text-[11.5px] font-medium text-ink-body">{t.goal}</span>
                  </span>
                  <span className="text-[12.5px] leading-[18px] text-ink-muted">{t.description}</span>
                  <FlowPreview steps={t.steps} />
                  <span className="text-[12px] text-ink-muted">{pluralize(count(t.steps), "step")}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
