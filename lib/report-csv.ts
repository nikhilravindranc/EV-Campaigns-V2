import type { Campaign, CampaignAnalytics } from "@/lib/types/campaigns";

const cell = (v: string | number | undefined) => {
  const t = v === undefined ? "" : String(v);
  // Quote anything with a comma, quote or line break, and neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(t) ? `'${t}` : t;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
const row = (...cols: (string | number | undefined)[]) => cols.map(cell).join(",");

/** A campaign's results as CSV: summary, daily or hourly engagement, links and A/B test. */
export function reportCsv(c: Campaign, a: CampaignAnalytics): string {
  const out: string[] = [];
  out.push(row("Campaign report"), row("Name", c.name), row("Type", c.type), row("Status", c.status), row("Audience", c.audience), row("Recipients", c.recipients));
  out.push(row("Sent", c.sent), row("Delivered", c.delivered), row("Opens", c.opens), row("Open rate %", c.openRate), row("Clicks", c.clicks), row("Click rate %", c.clickRate), row("Bounces", c.bounces), row("Unsubscribes", c.unsubscribes), row("Conversions", c.conversions));
  out.push("", row("Engagement", a.engagementUnit === "hour" ? "by hour" : "by day"), row("Period", "Opens", "Clicks"));
  for (const p of a.engagement) out.push(row(p.title, p.opens, p.clicks));
  out.push("", row("Top links"), row("Link", "URL", "Clicks", "Unique clicks"));
  for (const l of a.links) out.push(row(l.label, l.url, l.clicks, l.unique));
  if (a.ab) {
    out.push("", row("A/B test", `Winner decided by ${a.ab.metric}`, a.ab.winner ? `Version ${a.ab.winner.toUpperCase()}` : "Still running"), row("Version", "Subject", "Recipients", "Opens", "Open rate %", "Clicks", "Click rate %"));
    for (const v of a.ab.variants) out.push(row(v.key.toUpperCase(), v.subject, v.sent, v.opens, v.openRate, v.clicks, v.clickRate));
  }
  return out.join("\r\n");
}

/** Saves text as a file from the browser. */
export function downloadText(filename: string, text: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob(["\uFEFF" + text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
