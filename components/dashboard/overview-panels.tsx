"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowserIcon, PaperPlaneTiltIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, StatusBadge, td, th, TypeIcon, ViewAll, viewAllClass } from "@/components/shared/campaign-ui";
import { EmptyState } from "@/components/shared/state-panels";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useItems } from "@/hooks/use-workspace";
import { isSms } from "@/lib/campaign-meta";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import { campaignHref, CAMPAIGNS_ROUTE } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface SummaryStat {
  label: string;
  value: ReactNode;
  change?: ReactNode;
}

/** The headline numbers in one card, so the page opens with a single clear summary instead of six tiles. */
export function SummaryCard({ stats, loading, className }: { stats: SummaryStat[]; loading: boolean; className?: string }) {
  return (
    <Card label="Summary" className={className}>
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={cn("min-w-0 px-5 py-4", i % 2 === 1 && "border-l border-line-soft", i >= 2 && "border-t border-line-soft lg:border-t-0", i > 0 && "lg:border-l lg:border-line-soft")}>
            <dt className="text-[13px] leading-5 text-ink-muted">{s.label}</dt>
            <dd className="mt-1">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <span className="block truncate text-[28px] leading-9 font-semibold tracking-[-0.02em] text-ink tabular-nums">{s.value}</span>
                  <span className="mt-1 block">{s.change}</span>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

const RECENT = 5;

/** The latest campaigns and how they did, newest activity first. */
export function RecentCampaignsCard({ className }: { className?: string }) {
  const router = useRouter();
  const { data } = useCampaigns();
  const rows = useMemo(() => {
    if (!data) return undefined;
    const when = (c: (typeof data)[number]) => c.sentAt ?? c.updatedAt;
    return data
      .filter((c) => c.status !== "archived")
      .sort((a, b) => when(b).localeCompare(when(a)))
      .slice(0, RECENT);
  }, [data]);

  return (
    <Card label="Recent campaigns" className={className}>
      <CardHeader title="Recent campaigns" action={<ViewAll href={CAMPAIGNS_ROUTE} label="All campaigns" arrow />} />
      {!rows ? (
        <div className="space-y-3 px-5 pb-5">
          {Array.from({ length: RECENT }, (_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={PaperPlaneTiltIcon} title="No campaigns yet" hint="Create your first campaign to see it here." className="py-10" />
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] border-collapse">
            <caption className="sr-only">Recent campaigns</caption>
            <thead>
              <tr className="border-y border-line-soft">
                <th scope="col" className={th}>
                  Campaign
                </th>
                <th scope="col" className={th}>
                  Status
                </th>
                <th scope="col" className={cn(th, "text-right")}>
                  Recipients
                </th>
                <th scope="col" className={cn(th, "text-right")}>
                  Open rate
                </th>
                <th scope="col" className={cn(th, "text-right")}>
                  Click rate
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} onClick={() => router.push(campaignHref(c.id))} className="cursor-pointer border-b border-line-soft transition-colors last:border-0 hover:bg-campaign-muted">
                  <td className={cn(td, "py-3")}>
                    <span className="flex items-center gap-3">
                      <TypeIcon type={c.type} size={32} className="shrink-0" />
                      <span className="min-w-0">
                        <Link href={campaignHref(c.id)} onClick={(e) => e.stopPropagation()} className="block truncate rounded font-medium text-ink hover:text-brand focus-visible:outline-2 focus-visible:outline-brand-action">
                          {c.name}
                        </Link>
                        <span className="block truncate text-[12px] leading-4 text-ink-muted">{c.sentAt ? `Sent ${formatDate(c.sentAt)}` : c.scheduledAt ? `Scheduled ${formatDate(c.scheduledAt)}` : `Edited ${formatDate(c.updatedAt)}`}</span>
                      </span>
                    </span>
                  </td>
                  <td className={td}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className={cn(td, "text-right tabular-nums")}>{formatNumber(c.recipients)}</td>
                  <td className={cn(td, "text-right tabular-nums", c.openRate === undefined && "text-ink-faint")} title={isSms(c) ? "SMS has no open tracking" : undefined}>
                    {c.openRate === undefined ? "—" : formatPercent(c.openRate)}
                  </td>
                  <td className={cn(td, "text-right tabular-nums", c.clickRate === undefined && "text-ink-faint")}>{c.clickRate === undefined ? "—" : formatPercent(c.clickRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

const FORM_KIND = { embedded: "Embedded form", popup: "Pop-up", landing: "Landing page" } as const;
const FORMS_SHOWN = 4;

/** Signup forms and what they bring in, busiest first. */
export function FormsCard({ className }: { className?: string }) {
  const { data } = useItems("forms");
  const forms = useMemo(() => data?.filter((f) => f.status !== "archived").sort((a, b) => b.submissions - a.submissions), [data]);
  const total = forms?.reduce((sum, f) => sum + f.submissions, 0) ?? 0;
  const live = forms?.filter((f) => f.status === "active").length ?? 0;

  return (
    <Card label="Signup forms" className={className}>
      <CardHeader
        title="Signup forms"
        subtitle={forms ? `${formatNumber(total)} signups from ${live} live ${live === 1 ? "form" : "forms"}` : undefined}
        action={<ViewAll href="/forms" label="All forms" arrow />}
      />
      {!forms ? (
        <div className="space-y-3 px-5 pb-5">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <EmptyState icon={BrowserIcon} title="No forms yet" hint="Publish a signup form to grow your list." className="py-8" />
      ) : (
        <ul className="divide-y divide-line-soft px-5 pb-1">
          {forms.slice(0, FORMS_SHOWN).map((f) => (
            <li key={f.id}>
              <Link href={`/forms/${encodeURIComponent(f.id)}`} className="flex items-center gap-3 rounded py-3 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand-action">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium text-ink">{f.name}</span>
                  <span className="block truncate text-[12px] leading-4 text-ink-muted">
                    {FORM_KIND[f.kind]} · {f.status === "active" ? "Live" : "Draft"}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-[13.5px] font-medium text-ink tabular-nums">{formatNumber(f.submissions)}</span>
                  <span className="block text-[12px] leading-4 text-ink-muted tabular-nums">{f.views > 0 ? `${formatPercent((f.submissions / f.views) * 100)} converted` : "No views yet"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-line-soft px-5 py-3">
        <Link href="/forms/new" className={viewAllClass}>
          <PlusIcon size={14} weight="bold" aria-hidden /> Create a form
        </Link>
      </div>
    </Card>
  );
}
