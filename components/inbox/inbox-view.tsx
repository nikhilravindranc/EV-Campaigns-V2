"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, ArrowCounterClockwiseIcon, ChatsCircleIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Badge, Card, PageHeading, PageShell, PrimaryButton, SearchInput, UnderlineTabs, fieldClass } from "@/components/shared/campaign-ui";
import { EmptyState } from "@/components/shared/state-panels";
import { useHydrated } from "@/hooks/use-hydrated";
import { useStoredState } from "@/hooks/use-stored-state";
import { demoNow } from "@/lib/api/store";
import { formatDateTime, formatRelative } from "@/lib/format";
import { campaignHref } from "@/lib/routes";
import { INBOX_KEY, INBOX_LABELS, initialsOf, SEED_THREADS, type InboxLabel, type InboxThread } from "@/lib/inbox";
import { cn } from "@/lib/utils";

type Filter = "todo" | "done" | "all";

const LABEL_TONE: Record<InboxLabel, { fg: string; bg: string }> = {
  Question: { fg: "var(--ch-journey-fg)", bg: "var(--ch-journey-bg)" },
  "Sales lead": { fg: "var(--success)", bg: "var(--success-bg)" },
  "Unsubscribe request": { fg: "var(--danger)", bg: "var(--danger-bg)" },
  Feedback: { fg: "var(--ch-automation-fg)", bg: "var(--ch-automation-bg)" },
};

const last = (t: InboxThread) => t.messages[t.messages.length - 1];

/** Replies to your campaigns, as conversations you can answer and close. */
export function InboxView() {
  const hydrated = useHydrated();
  const [stored, setStored] = useStoredState<InboxThread[]>(INBOX_KEY, SEED_THREADS);
  const threads = hydrated ? stored : SEED_THREADS;
  const [filter, setFilter] = useState<Filter>("todo");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const counts = { todo: threads.filter((t) => t.status === "todo").length, done: threads.filter((t) => t.status === "done").length };
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return threads
      .filter((t) => (filter === "all" || t.status === filter) && (!term || `${t.name} ${t.email} ${t.subject} ${t.messages.map((m) => m.text).join(" ")}`.toLowerCase().includes(term)))
      .sort((a, b) => last(b).at.localeCompare(last(a).at));
  }, [threads, filter, q]);
  const open = threads.find((t) => t.id === openId) ?? null;
  const now = demoNow();

  const update = (id: string, patch: Partial<InboxThread>) => setStored(threads.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const select = (t: InboxThread) => {
    setOpenId(t.id);
    setDraft("");
    if (t.unread) update(t.id, { unread: false });
  };
  const send = () => {
    if (!open || draft.trim().length < 2) return;
    update(open.id, { messages: [...open.messages, { from: "you", text: draft.trim(), at: now }], status: "done" });
    setDraft("");
    toast.success("Reply sent", { description: `To ${open.email} · simulated, nothing is actually emailed` });
  };

  return (
    <PageShell>
      <PageHeading
        crumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Inbox" }]}
        title="Inbox"
        description="Replies to your campaigns. Turn on Track Replies in a campaign to collect them here. Replies you write are simulated."
        actions={<SearchInput value={q} onChange={setQ} placeholder="Search replies…" label="Search replies" className="w-full sm:w-[240px]" />}
      />
      <div className="mt-4">
        <UnderlineTabs
          label="Inbox filter"
          idPrefix="inbox"
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "todo", label: "To do", count: counts.todo },
            { value: "done", label: "Done", count: counts.done },
            { value: "all", label: "All" },
          ]}
        />
      </div>
      <div id="inbox-panel" role="tabpanel" className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card label="Conversations" className={cn(open && "hidden lg:block")}>
          {rows.length === 0 ? (
            <EmptyState icon={ChatsCircleIcon} title={filter === "todo" ? "All caught up" : "No conversations"} hint={filter === "todo" ? "New replies to your campaigns appear here." : "Try another filter or search."} className="py-12" />
          ) : (
            <ul className="divide-y divide-line-soft">
              {rows.map((t) => (
                <li key={t.id}>
                  <button type="button" onClick={() => select(t)} aria-current={t.id === openId ? "true" : undefined} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-campaign-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-action", t.id === openId && "bg-campaign-muted")}>
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-campaign-tint text-[12px] font-semibold text-campaign-action" aria-hidden>
                      {initialsOf(t.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className={cn("min-w-0 flex-1 truncate text-[13.5px]", t.unread ? "font-semibold text-ink" : "font-medium text-ink-body")}>{t.name}</span>
                        <span className="shrink-0 text-[11.5px] text-ink-muted">{formatRelative(last(t).at, now)}</span>
                      </span>
                      <span className="block truncate text-[12.5px] text-ink-body">{t.subject}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-ink-muted">{last(t).from === "you" ? "You: " : ""}{last(t).text}</span>
                      <span className="mt-1.5 flex items-center gap-1.5">
                        <Badge {...LABEL_TONE[t.label]}>{t.label}</Badge>
                        {t.unread && <span className="size-2 rounded-full bg-brand" aria-label="Unread" />}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card label="Conversation" className={cn(!open && "hidden lg:block")}>
          {!open ? (
            <EmptyState icon={ChatsCircleIcon} title="Select a conversation" hint="Choose a reply on the left to read it and answer." className="py-16" />
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-start gap-3 border-b border-line-soft px-5 py-4">
                <button type="button" onClick={() => setOpenId(null)} aria-label="Back to conversations" className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-campaign-muted lg:hidden">
                  <ArrowLeftIcon size={18} aria-hidden />
                </button>
                <div className="min-w-0 flex-1 basis-[220px]">
                  <h2 className="truncate text-[15px] font-semibold text-ink">{open.subject}</h2>
                  <p className="truncate text-[12.5px] text-ink-muted">
                    {open.name} · {open.email}
                    {open.campaignId && (
                      <>
                        {" · "}
                        <Link href={campaignHref(open.campaignId)} className="text-brand hover:text-brand-press">
                          {open.campaignName}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-[12.5px] text-ink-muted">
                  Label
                  <select value={open.label} onChange={(e) => update(open.id, { label: e.target.value as InboxLabel })} className={cn(fieldClass, "h-8 w-auto text-[12.5px]")}>
                    {INBOX_LABELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => update(open.id, { status: open.status === "done" ? "todo" : "done" })}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-medium text-ink hover:border-brand-soft focus-visible:outline-2 focus-visible:outline-brand-action"
                >
                  {open.status === "done" ? <ArrowCounterClockwiseIcon size={14} aria-hidden /> : <CheckCircleIcon size={14} aria-hidden />}
                  {open.status === "done" ? "Reopen" : "Mark done"}
                </button>
              </div>
              {open.label === "Unsubscribe request" && (
                <p className="mx-5 mt-4 rounded-lg bg-[var(--warning-bg)] px-3 py-2 text-[12.5px] text-[var(--warning)]">
                  This person asked to leave. Unsubscribe them from <Link href="/contacts" className="font-medium underline">Contacts</Link> so they stop receiving campaigns.
                </p>
              )}
              <ol className="space-y-3 px-5 py-4" aria-label="Messages">
                {open.messages.map((m, i) => (
                  <li key={i} className={cn("max-w-[88%] rounded-2xl px-4 py-3 text-[13.5px] leading-5", m.from === "you" ? "ml-auto rounded-br-md bg-brand text-white" : "rounded-bl-md bg-campaign-muted text-ink")}>
                    <p>{m.text}</p>
                    <p className={cn("mt-1 text-[11.5px]", m.from === "you" ? "text-white/80" : "text-ink-muted")}>
                      {m.from === "you" ? "You" : open.name} · {formatDateTime(m.at)}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="border-t border-line-soft bg-campaign-muted px-5 py-4">
                <label htmlFor="inbox-reply" className="text-[13px] font-medium text-ink">
                  Reply to {open.name.split(" ")[0]}
                </label>
                <textarea id="inbox-reply" value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={1000} placeholder="Write your reply…" className={cn(fieldClass, "mt-1.5 h-auto py-2")} />
                <div className="mt-2 flex justify-end">
                  <PrimaryButton icon={PaperPlaneTiltIcon} onClick={send} disabled={draft.trim().length < 2}>
                    Send reply
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
