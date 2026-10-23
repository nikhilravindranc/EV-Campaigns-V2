"use client";

import { useState } from "react";
import { CheckCircleIcon, CopyIcon, KeyIcon, LightningIcon, PlugsConnectedIcon, PlusIcon, TrashIcon, WebhooksLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge, Card, CardHeader, ConfirmDialog, fieldClass, OutlineButton, PageHeading, PageShell, PrimaryButton, SearchInput, UnderlineTabs } from "@/components/shared/campaign-ui";
import { EmptyState } from "@/components/shared/state-panels";
import { useHydrated } from "@/hooks/use-hydrated";
import { useStoredState } from "@/hooks/use-stored-state";
import { formatDateTime, formatNumber } from "@/lib/format";
import { demoNow } from "@/lib/api/store";
import { INTEGRATION_CATEGORIES, INTEGRATIONS, NO_SETTINGS, SETTINGS_KEY, samplePayload, token, validateWebhookUrl, WEBHOOK_EVENTS, type Integration, type IntegrationCategory, type IntegrationSettings, type Webhook, type WebhookEvent } from "@/lib/integrations";
import { cn } from "@/lib/utils";

type Tab = "apps" | "developers";

function useSettings() {
  const hydrated = useHydrated();
  const [stored, set] = useStoredState<IntegrationSettings>(SETTINGS_KEY, NO_SETTINGS);
  const settings = hydrated ? { ...NO_SETTINGS, ...stored } : NO_SETTINGS;
  return { settings, update: (patch: Partial<IntegrationSettings>) => set({ ...settings, ...patch }), ready: hydrated };
}

function Logo({ app }: { app: Pick<Integration, "name" | "fg" | "bg"> }) {
  return (
    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-[17px] font-bold" style={{ color: app.fg, backgroundColor: app.bg }} aria-hidden>
      {app.name[0]}
    </span>
  );
}

export function IntegrationsView() {
  const [tab, setTab] = useState<Tab>("apps");
  const { settings } = useSettings();
  const connected = Object.keys(settings.apps).length;
  return (
    <PageShell>
      <PageHeading
        crumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Integrations" }]}
        title="Integrations"
        description="Connect your CRM, store and other tools so contacts, orders and results flow both ways. Connections here are simulated."
      />
      <div className="mt-4">
        <UnderlineTabs label="Integrations" idPrefix="int" value={tab} onChange={setTab} tabs={[{ value: "apps", label: "Apps", count: connected }, { value: "developers", label: "Webhooks and API", count: settings.webhooks.length }]} />
      </div>
      <div id="int-panel" role="tabpanel" className="mt-4">
        {tab === "apps" ? <AppsTab /> : <DevelopersTab />}
      </div>
    </PageShell>
  );
}

// ── Apps ─────────────────────────────────────────────────────────────

function AppsTab() {
  const { settings, update } = useSettings();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<IntegrationCategory | "">("");
  const [connecting, setConnecting] = useState<Integration | null>(null);
  const [disconnecting, setDisconnecting] = useState<Integration | null>(null);

  const term = q.trim().toLowerCase();
  const apps = INTEGRATIONS.filter((a) => (!category || a.category === category) && (!term || a.name.toLowerCase().includes(term) || a.description.toLowerCase().includes(term)));
  const connect = (a: Integration, account: string) => {
    update({ apps: { ...settings.apps, [a.id]: { connectedAt: demoNow(), account } } });
    setConnecting(null);
    toast.success(`${a.name} connected`, { description: "Simulated: no data was exchanged with the app." });
  };
  const disconnect = (a: Integration) => {
    const { [a.id]: _removed, ...rest } = settings.apps;
    void _removed;
    update({ apps: rest });
    setDisconnecting(null);
    toast.info(`${a.name} disconnected`);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search apps…" label="Search apps" className="w-full sm:w-[260px]" />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {(["", ...INTEGRATION_CATEGORIES] as const).map((c) => (
            <button
              key={c || "all"}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn("h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-action", category === c ? "border-brand bg-brand text-white" : "border-line bg-white text-ink-body hover:border-brand-soft")}
            >
              {c || "All"}
            </button>
          ))}
        </div>
      </div>

      {apps.length === 0 ? (
        <Card className="mt-4" label="No apps">
          <EmptyState icon={PlugsConnectedIcon} title="No apps match" hint="Try another word or category." />
        </Card>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {apps.map((a) => {
            const on = settings.apps[a.id];
            return (
              <li key={a.id}>
                <Card label={a.name} className="flex h-full flex-col">
                  <div className="flex items-start gap-3 p-5 pb-3">
                    <Logo app={a} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 text-[15px] font-semibold text-ink">
                        {a.name}
                        {a.native && <Badge fg="var(--campaign-action)" bg="var(--campaign-tint)">By EVOQ</Badge>}
                      </p>
                      <p className="text-[12px] text-ink-muted">{a.category}</p>
                    </div>
                    {on && (
                      <Badge fg="var(--success)" bg="var(--success-bg)" dot>
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="px-5 text-[13px] leading-5 text-ink-body">{a.description}</p>
                  <ul className="mt-3 space-y-1 px-5 text-[12.5px] text-ink-muted">
                    {a.syncs.map((s) => (
                      <li key={s} className="flex items-start gap-1.5">
                        <CheckCircleIcon size={14} weight="fill" className="mt-0.5 shrink-0 text-campaign-soft" aria-hidden />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center gap-2 px-5 py-4">
                    {on ? (
                      <>
                        <p className="min-w-0 flex-1 truncate text-[12px] text-ink-muted">
                          {on.account ? `${on.account} · ` : ""}since {formatDateTime(on.connectedAt)}
                        </p>
                        <OutlineButton onClick={() => setDisconnecting(a)}>Disconnect</OutlineButton>
                      </>
                    ) : (
                      <PrimaryButton onClick={() => setConnecting(a)}>Connect</PrimaryButton>
                    )}
                  </div>
                  {on && (
                    <p className="border-t border-line-soft bg-campaign-muted px-5 py-2.5 text-[12px] text-ink-body">
                      Last sync just now · {formatNumber(a.category === "CRM" ? 12458 : a.category === "Ecommerce" ? 3245 : 0) || "—"} {a.category === "CRM" ? "contacts" : a.category === "Ecommerce" ? "customers" : "events"} (sample)
                    </p>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <ConnectDialog app={connecting} onClose={() => setConnecting(null)} onConnect={connect} />
      <ConfirmDialog
        open={!!disconnecting}
        onOpenChange={(o) => !o && setDisconnecting(null)}
        title={`Disconnect ${disconnecting?.name ?? ""}?`}
        description="Syncing stops and nothing is deleted from either app. You can reconnect at any time."
        confirmLabel="Disconnect"
        onConfirm={() => disconnecting && disconnect(disconnecting)}
      />
    </>
  );
}

function ConnectDialog({ app, onClose, onConnect }: { app: Integration | null; onClose: () => void; onConnect: (a: Integration, account: string) => void }) {
  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">{app && <ConnectForm key={app.id} app={app} onConnect={onConnect} />}</DialogContent>
    </Dialog>
  );
}

function ConnectForm({ app, onConnect }: { app: Integration; onConnect: (a: Integration, account: string) => void }) {
  const [account, setAccount] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConnect(app, account.trim());
      }}
    >
      <div className="flex items-start gap-3 border-b border-line-soft px-5 pt-5 pb-4 pr-12">
        <Logo app={app} />
        <div className="min-w-0">
          <DialogTitle className="text-[17px] font-semibold text-ink">Connect {app.name}</DialogTitle>
          <DialogDescription className="mt-0.5 text-[13px] text-ink-muted">You&apos;ll sign in to {app.name} and choose what EVOQ can access.</DialogDescription>
        </div>
      </div>
      <div className="space-y-3 px-5 py-4">
        {app.account && (
          <div className="grid gap-1">
            <label htmlFor="int-account" className="text-[13px] font-medium text-ink">
              {app.account.label} <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input id="int-account" value={account} onChange={(e) => setAccount(e.target.value)} placeholder={app.account.placeholder} className={fieldClass} autoComplete="off" />
          </div>
        )}
        <p className="text-[12.5px] leading-[18px] text-ink-muted">What will sync: {app.syncs.join(", ").toLowerCase()}.</p>
        <p className="rounded-lg bg-campaign-muted px-3 py-2 text-[12px] leading-4 text-ink-muted">Demo only: no sign-in happens and no data leaves this browser. Never enter real passwords or keys here.</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-line-soft bg-campaign-muted px-5 py-3">
        <PrimaryButton type="submit">Connect {app.name}</PrimaryButton>
      </div>
    </form>
  );
}

// ── Webhooks and API ─────────────────────────────────────────────────

function DevelopersTab() {
  const { settings, update } = useSettings();
  const [adding, setAdding] = useState(false);
  const [testing, setTesting] = useState<Webhook | null>(null);
  const [removing, setRemoving] = useState<Webhook | null>(null);
  const [revealed, setRevealed] = useState<Webhook | null>(null);

  const add = (url: string, events: WebhookEvent[]) => {
    const hook: Webhook = { id: `wh-${Date.now().toString(36)}`, url: url.trim(), events, secret: token("whsec_", 28), createdAt: demoNow(), active: true };
    update({ webhooks: [hook, ...settings.webhooks] });
    setAdding(false);
    setRevealed(hook);
  };
  const generateKey = () => {
    update({ apiKey: token("evoq_demo_", 28) });
    toast.success("API key created", { description: "Demo key only. It doesn't work with any real service." });
  };
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Couldn't copy", { description: "Select the text and copy it by hand." });
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card label="Webhooks">
        <CardHeader
          title={
            <>
              <WebhooksLogoIcon size={18} aria-hidden /> Webhooks
            </>
          }
          subtitle="Get a message at your own address when something happens in EVOQ."
          action={
            <PrimaryButton icon={PlusIcon} onClick={() => setAdding(true)}>
              Add endpoint
            </PrimaryButton>
          }
        />
        {settings.webhooks.length === 0 ? (
          <EmptyState icon={LightningIcon} title="No endpoints yet" hint="Add a secure address and choose which events to send to it." className="py-10" />
        ) : (
          <ul className="divide-y divide-line-soft px-5 pb-2">
            {settings.webhooks.map((w) => (
              <li key={w.id} className="py-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink" title={w.url}>
                    {w.url}
                  </p>
                  <Badge fg={w.active ? "var(--success)" : "var(--neutral-fg)"} bg={w.active ? "var(--success-bg)" : "var(--neutral-bg)"} dot>
                    {w.active ? "Active" : "Paused"}
                  </Badge>
                </div>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {w.events.map((e) => WEBHOOK_EVENTS.find((x) => x.value === e)?.label ?? e).join(" · ")} · added {formatDateTime(w.createdAt)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <OutlineButton onClick={() => setTesting(w)}>Send test event</OutlineButton>
                  <OutlineButton onClick={() => update({ webhooks: settings.webhooks.map((x) => (x.id === w.id ? { ...x, active: !x.active } : x)) })}>{w.active ? "Pause" : "Resume"}</OutlineButton>
                  <OutlineButton icon={TrashIcon} onClick={() => setRemoving(w)} aria-label={`Delete endpoint ${w.url}`}>
                    Delete
                  </OutlineButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card label="API key" className="self-start">
        <CardHeader
          title={
            <>
              <KeyIcon size={18} aria-hidden /> API key
            </>
          }
          subtitle="For scripts and tools that read or add contacts."
        />
        <div className="px-5 pb-5">
          {settings.apiKey ? (
            <>
              <p className="rounded-lg border border-line bg-campaign-muted px-3 py-2 font-mono text-[12.5px] break-all text-ink">{`${settings.apiKey.slice(0, 14)}${"•".repeat(16)}${settings.apiKey.slice(-4)}`}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <OutlineButton icon={CopyIcon} onClick={() => copy(settings.apiKey!, "API key")}>
                  Copy
                </OutlineButton>
                <OutlineButton onClick={generateKey}>Regenerate</OutlineButton>
              </div>
            </>
          ) : (
            <PrimaryButton icon={KeyIcon} onClick={generateKey}>
              Create API key
            </PrimaryButton>
          )}
          <p className="mt-3 text-[12px] leading-4 text-ink-muted">Demo key: it is stored in this browser and works with nothing. Real keys would be shown once and kept secret.</p>
        </div>
      </Card>

      <AddWebhookDialog open={adding} onOpenChange={setAdding} onAdd={add} />
      <TestDialog hook={testing} onClose={() => setTesting(null)} />
      <Dialog open={!!revealed} onOpenChange={(o) => !o && setRevealed(null)}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          {revealed && (
            <>
              <div className="border-b border-line-soft px-5 pt-5 pb-4 pr-12">
                <DialogTitle className="text-[17px] font-semibold text-ink">Endpoint added</DialogTitle>
                <DialogDescription className="mt-0.5 text-[13px] text-ink-muted">Use this signing secret to check that events really come from EVOQ. Copy it now.</DialogDescription>
              </div>
              <div className="px-5 py-4">
                <p className="rounded-lg border border-line bg-campaign-muted px-3 py-2 font-mono text-[12.5px] break-all text-ink">{revealed.secret}</p>
              </div>
              <div className="flex justify-end gap-2 border-t border-line-soft bg-campaign-muted px-5 py-3">
                <OutlineButton icon={CopyIcon} onClick={() => copy(revealed.secret, "Secret")}>
                  Copy secret
                </OutlineButton>
                <PrimaryButton onClick={() => setRevealed(null)}>Done</PrimaryButton>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Delete this endpoint?"
        description="EVOQ stops sending events to it straight away."
        confirmLabel="Delete endpoint"
        onConfirm={() => {
          if (removing) update({ webhooks: settings.webhooks.filter((x) => x.id !== removing.id) });
          setRemoving(null);
        }}
      />
    </div>
  );
}

function AddWebhookDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (url: string, events: WebhookEvent[]) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">{open && <AddWebhookForm onAdd={onAdd} />}</DialogContent>
    </Dialog>
  );
}

function AddWebhookForm({ onAdd }: { onAdd: (url: string, events: WebhookEvent[]) => void }) {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEvent[]>(["campaign.sent", "email.clicked"]);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const problem = validateWebhookUrl(url) ?? (events.length === 0 ? "Choose at least one event" : null);
        if (problem) return setError(problem);
        onAdd(url, events);
      }}
    >
      <div className="border-b border-line-soft px-5 pt-5 pb-4 pr-12">
        <DialogTitle className="text-[17px] font-semibold text-ink">Add a webhook endpoint</DialogTitle>
        <DialogDescription className="mt-0.5 text-[13px] text-ink-muted">EVOQ sends a signed JSON message to this address for the events you choose.</DialogDescription>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div className="grid gap-1">
          <label htmlFor="wh-url" className="text-[13px] font-medium text-ink">
            Endpoint address
          </label>
          <input id="wh-url" value={url} onChange={(e) => (setUrl(e.target.value), setError(""))} placeholder="https://example.com/hooks/evoq" className={fieldClass} aria-invalid={error ? true : undefined} autoComplete="off" />
          {error && (
            <p role="alert" className="text-[12px] font-medium text-[#D92D20]">
              {error}
            </p>
          )}
        </div>
        <fieldset>
          <legend className="text-[13px] font-medium text-ink">Send me</legend>
          <div className="mt-1.5 space-y-1.5">
            {WEBHOOK_EVENTS.map((ev) => (
              <label key={ev.value} className="flex items-center gap-2 text-[13px] text-ink-body">
                <input type="checkbox" checked={events.includes(ev.value)} onChange={(e) => (setEvents(e.target.checked ? [...events, ev.value] : events.filter((x) => x !== ev.value)), setError(""))} className="size-4 accent-[var(--campaign-action)]" />
                {ev.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex justify-end gap-2 border-t border-line-soft bg-campaign-muted px-5 py-3">
        <PrimaryButton type="submit">Add endpoint</PrimaryButton>
      </div>
    </form>
  );
}

function TestDialog({ hook, onClose }: { hook: Webhook | null; onClose: () => void }) {
  const [event, setEvent] = useState<WebhookEvent | null>(null);
  const ev = event ?? hook?.events[0] ?? "campaign.sent";
  return (
    <Dialog open={!!hook} onOpenChange={(o) => !o && (setEvent(null), onClose())}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        {hook && (
          <>
            <div className="border-b border-line-soft px-5 pt-5 pb-4 pr-12">
              <DialogTitle className="text-[17px] font-semibold text-ink">Test event</DialogTitle>
              <DialogDescription className="mt-0.5 break-all text-[13px] text-ink-muted">Sample message for {hook.url}. Simulated: nothing is sent.</DialogDescription>
            </div>
            <div className="space-y-3 px-5 py-4">
              <select aria-label="Event to test" value={ev} onChange={(e) => setEvent(e.target.value as WebhookEvent)} className={fieldClass}>
                {hook.events.map((x) => (
                  <option key={x} value={x}>
                    {WEBHOOK_EVENTS.find((w) => w.value === x)?.label ?? x}
                  </option>
                ))}
              </select>
              <pre className="max-h-64 overflow-auto rounded-lg bg-campaign-depth p-3 font-mono text-[12px] leading-[18px] text-white">{samplePayload(ev)}</pre>
              <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--success)]">
                <CheckCircleIcon size={16} weight="fill" aria-hidden /> Delivered · 200 OK in 142 ms (simulated)
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
