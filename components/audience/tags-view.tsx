"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TagIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { Card, PageHeading, PageShell, SearchInput } from "@/components/shared/campaign-ui";
import { EmptyState } from "@/components/shared/state-panels";
import { useContactTags } from "@/hooks/use-audience";
import { formatNumber } from "@/lib/format";

/** Every tag in use, how many contacts carry it, and where to go with it. */
export function TagsView() {
  const { data, isError } = useContactTags();
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((t) => !term || t.tag.includes(term)).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [data, q]);
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <PageShell>
      <PageHeading
        crumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Tags" }]}
        title="Tags"
        description="Labels you put on contacts, such as vip or purchased. Use them to build segments, trigger workflows and personalise emails."
        actions={<SearchInput value={q} onChange={setQ} placeholder="Search tags…" label="Search tags" className="w-full sm:w-[240px]" />}
      />
      <Card className="mt-5" label="Tags">
        {isError ? (
          <EmptyState icon={TagIcon} title="Tags couldn't be loaded" hint="Refresh the page to try again." />
        ) : !data ? (
          <p className="px-5 py-10 text-center text-[13px] text-ink-muted">Loading tags…</p>
        ) : rows.length === 0 ? (
          <EmptyState icon={TagIcon} title={q ? "No tags match" : "No tags yet"} hint={q ? "Try another word." : "Add tags to contacts from the Contacts page, or from an import."} />
        ) : (
          <ul className="divide-y divide-line-soft">
            {rows.map((t) => (
              <li key={t.tag} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-campaign-tint text-campaign-action" aria-hidden>
                  <TagIcon size={17} />
                </span>
                <div className="min-w-0 flex-1 basis-[200px]">
                  <p className="truncate text-[14px] font-medium text-ink">{t.tag}</p>
                  <div className="mt-1 h-1.5 max-w-[260px] overflow-hidden rounded-full bg-campaign-muted" aria-hidden>
                    <div className="h-full rounded-full bg-campaign-soft" style={{ width: `${Math.max(3, (t.count / max) * 100)}%` }} />
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-[13px] text-ink-body tabular-nums">
                  <UsersThreeIcon size={15} aria-hidden className="text-ink-muted" /> {formatNumber(t.count)} {t.count === 1 ? "contact" : "contacts"}
                </p>
                <div className="flex gap-3 text-[13px] font-medium">
                  <Link href={`/contacts?tag=${encodeURIComponent(t.tag)}`} className="text-brand hover:text-brand-press">
                    View contacts
                  </Link>
                  <Link href="/segments/new" className="text-brand hover:text-brand-press">
                    Build a segment
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}
