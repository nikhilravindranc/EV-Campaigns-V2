"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, CircleIcon, MinusCircleIcon, PlayCircleIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, primaryButtonClass } from "@/components/shared/campaign-ui";
import { SKIPPED_KEY, STEPS, useSetup, VERIFIED_KEY, type Step } from "@/components/getting-started/setup-steps";
import { useStoredState } from "@/hooks/use-stored-state";
import { HELP_ROUTE } from "@/lib/help";
import type { SetupStepKey } from "@/lib/api/setup";
import { DEFAULT_SENDER } from "@/lib/mock-data/campaigns";
import { cn } from "@/lib/utils";

const NO_KEYS: SetupStepKey[] = [];
const minutes = (n: number) => `${n} ${n === 1 ? "minute" : "minutes"}`;

/**
 * Overview setup checklist: progress, time left, and one step at a time with
 * its action, a way to skip it, and a how-to. Shares its steps and progress with
 * the Getting Started page, and hides itself once every step is done.
 */
export function SetupCard({ onCreateCampaign }: { onCreateCampaign: () => void }) {
  const [verified, setVerified] = useStoredState(VERIFIED_KEY, false);
  const [skipped, setSkipped] = useStoredState<SetupStepKey[]>(SKIPPED_KEY, NO_KEYS);
  const [picked, setPicked] = useState<SetupStepKey | null>(null);
  // Phones show the current step only, with the full list one tap away.
  const [listOpen, setListOpen] = useState(false);
  const setup = useSetup(verified);

  if (!setup) {
    return (
      <Card label="Set up EVOQ Campaigns" className="mt-6">
        <div className="space-y-3 p-5">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  const done = STEPS.filter((s) => setup.done[s.key]).length;
  if (done === STEPS.length) return null;

  const open = (s: Step) => !setup.done[s.key] && !skipped.includes(s.key);
  const next = STEPS.find(open);
  const current = STEPS.find((s) => s.key === picked) ?? next ?? STEPS.find((s) => !setup.done[s.key]) ?? STEPS[0];
  const left = STEPS.filter(open).reduce((sum, s) => sum + s.minutes, 0);
  const share = (done / STEPS.length) * 100;

  const toggleSkip = (key: SetupStepKey) => {
    setPicked(null);
    setSkipped(skipped.includes(key) ? skipped.filter((k) => k !== key) : [...skipped, key]);
  };
  const run = (s: Step) => {
    if (s.key === "sender") {
      setVerified(true);
      toast.success("Sender verified", { description: `${DEFAULT_SENDER.email} · simulated — no DNS records were checked.` });
    } else if (s.key === "campaign") onCreateCampaign();
  };

  const isDone = setup.done[current.key];
  const isSkipped = !isDone && skipped.includes(current.key);
  const action = current.href ? (
    <Link href={current.href} className={primaryButtonClass}>
      {isDone ? "Open" : current.action}
    </Link>
  ) : (
    !isDone && (
      <button type="button" onClick={() => run(current)} className={primaryButtonClass}>
        {current.key === "sender" && <ShieldCheckIcon size={16} aria-hidden />}
        {current.action}
      </button>
    )
  );

  return (
    <Card label="Set up EVOQ Campaigns" className="mt-6">
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-[17px] leading-6 font-semibold text-ink">Set up EVOQ Campaigns</h2>
          <p className="text-[13px] text-ink-muted tabular-nums">
            {done} of {STEPS.length} complete{left > 0 && <> · about {left} min left</>}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--neutral-bg)]" role="progressbar" aria-label="Setup progress" aria-valuenow={Math.round(share)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${Math.max(share, 3)}%` }} />
        </div>
      </div>

      <div className="grid border-t border-line-soft md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <ol aria-label="Setup steps" className={cn("p-2 md:block md:border-r md:border-line-soft", listOpen ? "block" : "hidden")}>
          {STEPS.map((s) => {
            const ok = setup.done[s.key];
            const skip = !ok && skipped.includes(s.key);
            const active = s.key === current.key;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onClick={() => setPicked(s.key)}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] transition-colors focus-visible:outline-2 focus-visible:outline-brand-action", active ? "bg-campaign-muted font-medium text-ink" : "text-ink-body hover:bg-campaign-muted/70")}
                >
                  {ok ? <CheckCircleIcon size={20} weight="fill" className="shrink-0 text-[var(--success)]" aria-label="Done" /> : skip ? <MinusCircleIcon size={20} className="shrink-0 text-ink-faint" aria-label="Skipped" /> : <CircleIcon size={20} className="shrink-0 text-ink-faint" aria-label="To do" />}
                  <span className={cn("min-w-0 flex-1 truncate", (ok || skip) && "text-ink-muted")}>{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col justify-center gap-3 p-5 md:p-7">
          <button type="button" aria-expanded={listOpen} onClick={() => setListOpen((o) => !o)} className="-mt-1 w-fit rounded text-[13px] font-medium text-brand hover:text-brand-press focus-visible:outline-2 focus-visible:outline-brand-action md:hidden">
            {listOpen ? "Hide steps" : `Show all ${STEPS.length} steps`}
          </button>
          <span className="w-fit rounded-md bg-[var(--neutral-bg)] px-2 py-0.5 text-[12px] font-medium text-ink-body">{isDone ? "Done" : isSkipped ? "Skipped" : minutes(current.minutes)}</span>
          <div>
            <h3 className="text-[18px] leading-7 font-semibold text-ink">{current.title}</h3>
            <p className="mt-1 max-w-lg text-[13.5px] leading-[22px] text-ink-body">{current.text}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {action}
            {!isDone && (
              <button type="button" onClick={() => toggleSkip(current.key)} className="rounded text-[13px] font-medium text-brand hover:text-brand-press focus-visible:outline-2 focus-visible:outline-brand-action">
                {isSkipped ? "Add back" : "Skip"}
              </button>
            )}
            <Link href={current.guide ? `${HELP_ROUTE}#${current.guide}` : HELP_ROUTE} className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-brand hover:text-brand-press focus-visible:outline-2 focus-visible:outline-brand-action">
              <PlayCircleIcon size={18} aria-hidden /> Show me how
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
