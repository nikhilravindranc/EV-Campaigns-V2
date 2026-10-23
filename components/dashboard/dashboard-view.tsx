"use client";

import { useRouter } from "next/navigation";
import { CalendarBlankIcon, CaretDownIcon, ChatCircleDotsIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, fieldClass, OutlineButton, PageShell } from "@/components/shared/campaign-ui";
import { Change } from "@/components/shared/kpi-card";
import { ErrorState } from "@/components/shared/state-panels";
import { CreateCampaignDialog, useCreateDialog } from "@/components/campaigns/campaign-dialogs";
import { useDashboard } from "@/hooks/use-campaigns";
import { useHydrated } from "@/hooks/use-hydrated";
import { useStoredState } from "@/hooks/use-stored-state";
import { addDays, formatNumber, formatPercent, formatRange } from "@/lib/format";
import { CURRENT_USER, DEMO_TODAY } from "@/lib/mock-data/campaigns";
import { campaignHref } from "@/lib/routes";
import type { Kpi } from "@/lib/types/campaigns";
import { cn } from "@/lib/utils";
import { PerformanceCard, UpcomingCard } from "./dashboard-panels";
import { FormsCard, RecentCampaignsCard, SummaryCard } from "./overview-panels";
import { SetupCard } from "./setup-card";
import { TemplatesStrip } from "./templates-strip";

const RANGES = [7, 30, 90] as const;
type RangeDays = (typeof RANGES)[number];
const DEFAULT_RANGE: RangeDays = 7;

/** Date range picker showing the actual dates, as in the design. */
function RangeSelect({ value, onChange }: { value: RangeDays; onChange: (d: RangeDays) => void }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v) as RangeDays)}>
      <SelectTrigger aria-label="Date range" className={cn(fieldClass, "h-10 w-auto gap-3 rounded-lg pr-3 pl-3.5 text-[13.5px] font-medium text-ink [&>svg:last-child]:hidden")}>
        <SelectValue>{formatRange(addDays(DEMO_TODAY, -(value - 1)), DEMO_TODAY)}</SelectValue>
        <CalendarBlankIcon size={17} aria-hidden className="text-ink-muted" />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {RANGES.map((d) => (
          <SelectItem key={d} value={String(d)}>
            Last {d} days <span className="text-ink-muted">· {formatRange(addDays(DEMO_TODAY, -(d - 1)), DEMO_TODAY)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Primary split button: Create Campaign + channel choice. */
function CreateMenu({ onCreate }: { onCreate: (t: "email" | "sms") => void }) {
  return (
    <div className="inline-flex h-10 shrink-0 overflow-hidden rounded-lg bg-gradient-brand text-white shadow-[0_2px_6px_rgb(91_33_182/0.25)]">
      <button type="button" onClick={() => onCreate("email")} className="px-4 text-button transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
        Create Campaign
      </button>
      <span className="my-2 w-px bg-white/30" aria-hidden />
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Choose campaign type" className="px-2.5 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white data-[state=open]:bg-white/10">
          <CaretDownIcon size={14} weight="bold" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl">
          <DropdownMenuLabel className="text-[12px] font-medium text-ink-muted">Create</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => onCreate("email")}>
            <EnvelopeSimpleIcon aria-hidden className="text-[var(--ch-email-fg)]" /> Email campaign
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onCreate("sms")}>
            <ChatCircleDotsIcon aria-hidden className="text-[var(--ch-sms-fg)]" /> SMS campaign
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** "↑ 8.2% vs last 7 days" in the unit each KPI uses. */
function kpiChange(k: Kpi | undefined, days: number) {
  if (!k) return null;
  const text = k.changeUnit === "%" ? formatPercent(Math.abs(k.change)) : k.changeUnit === "pts" ? `${Math.abs(k.change).toFixed(1)} pts` : formatNumber(Math.abs(k.change));
  const suffix = k.changeUnit === "count" ? `new · last ${days} days` : `vs last ${days} days`;
  return <Change value={k.change} text={text} suffix={suffix} />;
}

export function DashboardView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const create = useCreateDialog();
  const [storedRange, setRange] = useStoredState<RangeDays>("evoq-campaigns:dashboard-range", DEFAULT_RANGE);
  const days: RangeDays = RANGES.includes(storedRange) ? storedRange : DEFAULT_RANGE;
  const { data, isError, refetch } = useDashboard(hydrated ? days : DEFAULT_RANGE);
  const loading = !data;
  // The Upcoming card shows the next few only; the full list is one click away.
  const upcoming = data && { ...data, upcoming: data.upcoming.slice(0, 3) };
  const k = data?.kpis;
  // Greeting follows the viewer's clock; the server renders the morning variant.
  const hello = hydrated ? greeting(new Date().getHours()) : "Good morning";

  return (
    <PageShell>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-[24px] leading-8 font-semibold tracking-[-0.015em] text-ink sm:text-[27px] sm:leading-9">
            {hello}, {CURRENT_USER.firstName}{" "}
            <span role="img" aria-label="waving hand">
              👋
            </span>
          </h1>
          <p className="mt-1 text-[14.5px] leading-5 text-ink-muted">Here&apos;s what&apos;s happening with your campaigns.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <RangeSelect value={days} onChange={setRange} />
          <CreateMenu onCreate={create.open} />
        </div>
      </div>

      <SetupCard onCreateCampaign={() => create.open("email")} />

      {isError ? (
        <Card className="mt-5">
          <ErrorState hint="The dashboard couldn't be loaded." action={<OutlineButton onClick={() => refetch()}>Try again</OutlineButton>} />
        </Card>
      ) : (
        <>
          <SummaryCard
            className="mt-6"
            loading={loading}
            stats={[
              { label: "Emails sent", value: k && formatNumber(k.emailsSent.value), change: kpiChange(k?.emailsSent, days) },
              { label: "Open rate", value: k && formatPercent(k.openRate.value), change: kpiChange(k?.openRate, days) },
              { label: "Click-through rate", value: k && formatPercent(k.clickRate.value), change: kpiChange(k?.clickRate, days) },
              { label: "Conversions", value: k && formatNumber(k.conversions.value), change: kpiChange(k?.conversions, days) },
            ]}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <PerformanceCard data={data} />
            <UpcomingCard data={upcoming} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <RecentCampaignsCard />
            <FormsCard />
          </div>
          <TemplatesStrip className="mt-4" />
        </>
      )}

      <CreateCampaignDialog {...create.props} onCreated={(c) => router.push(campaignHref(c.id))} />
    </PageShell>
  );
}
