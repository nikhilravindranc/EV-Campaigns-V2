"use client";

import { CopyIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Card, CardHeader, PageHeading, PageShell, fieldClass } from "@/components/shared/campaign-ui";
import { Switch } from "@/components/shared/email-ui";
import { TOPICS } from "@/components/campaigns/editor/draft";
import { useHydrated } from "@/hooks/use-hydrated";
import { useStoredState } from "@/hooks/use-stored-state";
import { formatNumber } from "@/lib/format";
import { hash } from "@/lib/mock-data/campaigns";
import { cn } from "@/lib/utils";

const DESCRIPTIONS: Record<string, string> = {
  Marketing: "News and offers about our products",
  Newsletter: "The monthly newsletter and weekly digest",
  "Product Updates": "New features and tips",
  Events: "Webinars and events you may like",
  "Offers & Promotions": "Discounts and seasonal sales",
};

interface PrefSettings {
  title: string;
  intro: string;
  shown: string[];
  allowUnsubscribeAll: boolean;
}

const DEFAULTS: PrefSettings = { title: "Manage your email preferences", intro: "Choose what you'd like to hear from us. You can change this at any time.", shown: [...TOPICS], allowUnsubscribeAll: true };
const KEY = "evoq-campaigns:preference-center";
const LINK = "https://evoq.one/preferences/{{contact_id}}";

/** What subscribers see and choose from when they click “Manage preferences” in an email footer. */
export function PreferencesView() {
  const hydrated = useHydrated();
  const [stored, setStored] = useStoredState<PrefSettings>(KEY, DEFAULTS);
  const s = hydrated ? { ...DEFAULTS, ...stored } : DEFAULTS;
  const patch = (p: Partial<PrefSettings>) => setStored({ ...s, ...p });
  const toggle = (t: string, on: boolean) => patch({ shown: on ? [...s.shown, t] : s.shown.filter((x) => x !== t) });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(LINK);
      toast.success("Link copied", { description: "Paste it into an email as the manage-preferences link." });
    } catch {
      toast.error("Couldn't copy", { description: "Select the link and copy it by hand." });
    }
  };

  return (
    <PageShell>
      <PageHeading
        crumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Preferences" }]}
        title="Subscriber preferences"
        description="A page where subscribers choose which topics they get, instead of leaving altogether. Fewer unsubscribes, better targeting."
      />
      <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Card label="Preference page">
            <CardHeader title="Page content" />
            <div className="grid gap-3 px-5 pb-5">
              <div className="grid gap-1">
                <label htmlFor="pc-title" className="text-[13px] font-medium text-ink">
                  Title
                </label>
                <input id="pc-title" value={s.title} onChange={(e) => patch({ title: e.target.value })} maxLength={80} className={fieldClass} />
              </div>
              <div className="grid gap-1">
                <label htmlFor="pc-intro" className="text-[13px] font-medium text-ink">
                  Introduction
                </label>
                <textarea id="pc-intro" value={s.intro} onChange={(e) => patch({ intro: e.target.value })} rows={2} maxLength={200} className={cn(fieldClass, "h-auto py-2")} />
              </div>
            </div>
          </Card>
          <Card label="Topics">
            <CardHeader title="Topics people can choose" subtitle="Campaigns are sent under a topic, and only people subscribed to it receive them." />
            <ul className="divide-y divide-line-soft px-5 pb-2">
              {TOPICS.map((t) => (
                <li key={t} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <div className="min-w-0 flex-1 basis-[200px]">
                    <p className="text-[14px] font-medium text-ink">{t}</p>
                    <p className="text-[12.5px] text-ink-muted">
                      {DESCRIPTIONS[t]} · {formatNumber(6000 + (hash(t) % 5800))} subscribers (sample)
                    </p>
                  </div>
                  <Switch checked={s.shown.includes(t)} onChange={(on) => toggle(t, on)} label={`Show ${t}`} />
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-soft px-5 py-3">
              <div className="min-w-0 flex-1 basis-[200px]">
                <p className="text-[14px] font-medium text-ink">“Unsubscribe from everything” option</p>
                <p className="text-[12.5px] text-ink-muted">Lets people leave completely from the same page.</p>
              </div>
              <Switch checked={s.allowUnsubscribeAll} onChange={(v) => patch({ allowUnsubscribeAll: v })} label="Allow unsubscribe from all" />
            </div>
          </Card>
          <Card label="Link">
            <CardHeader title="Add it to your emails" subtitle="Template footers already include a Manage preferences link. For your own HTML, use this one." />
            <div className="flex flex-wrap items-center gap-2 px-5 pb-5">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-line bg-campaign-muted px-3 py-2 font-mono text-[12.5px] text-ink">{LINK}</code>
              <button type="button" onClick={copy} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink hover:border-brand-soft focus-visible:outline-2 focus-visible:outline-brand-action">
                <CopyIcon size={15} aria-hidden /> Copy
              </button>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-[calc(var(--header-h)+24px)]">
          <p className="mb-2 text-[12.5px] font-medium text-ink-muted">Preview</p>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card" aria-label="Preview of the preference page">
            <div className="flex items-center gap-1.5 border-b border-line-soft bg-campaign-muted px-3 py-2" aria-hidden>
              <span className="size-2.5 rounded-full bg-[#F0A8A4]" />
              <span className="size-2.5 rounded-full bg-[#F6D58E]" />
              <span className="size-2.5 rounded-full bg-[#9BD7BC]" />
              <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-ink-muted">evoq.one/preferences</span>
            </div>
            <div className="px-6 py-7">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-campaign-tint text-campaign-action" aria-hidden>
                <EnvelopeSimpleIcon size={20} />
              </span>
              <h2 className="mt-3 text-[20px] leading-7 font-semibold text-ink">{s.title || "Manage your email preferences"}</h2>
              <p className="mt-1 text-[13.5px] leading-5 text-ink-body">{s.intro}</p>
              <ul className="mt-4 space-y-2">
                {TOPICS.filter((t) => s.shown.includes(t)).map((t) => (
                  <li key={t} className="flex items-start gap-3 rounded-xl border border-line px-3.5 py-3">
                    <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded border border-campaign-action bg-campaign-action text-[10px] leading-none text-white" aria-hidden>
                      ✓
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-medium text-ink">{t}</span>
                      <span className="block text-[12.5px] text-ink-muted">{DESCRIPTIONS[t]}</span>
                    </span>
                  </li>
                ))}
                {s.shown.length === 0 && <li className="rounded-xl border border-dashed border-line px-3.5 py-4 text-center text-[12.5px] text-ink-muted">Turn on at least one topic to show it here.</li>}
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-[13px] font-semibold text-white">Save preferences</span>
                {s.allowUnsubscribeAll && <span className="text-[12.5px] text-ink-muted underline">Unsubscribe from everything</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
