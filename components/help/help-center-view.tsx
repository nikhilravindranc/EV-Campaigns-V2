import Link from "next/link";
import { ArrowRightIcon, EnvelopeSimpleIcon, LifebuoyIcon, RocketLaunchIcon } from "@phosphor-icons/react/dist/ssr";
import { Card, CardHeader, PageShell, viewAllClass } from "@/components/shared/campaign-ui";
import { HELP_FAQ, HELP_GUIDES, SHORTCUTS, SUPPORT_EMAIL } from "@/lib/help";

export function HelpCenterView() {
  return (
    <PageShell>
      <section aria-labelledby="help-title" className="rounded-2xl border border-campaign-soft bg-gradient-soft px-5 py-6 sm:px-7">
        <p className="text-[12px] font-semibold tracking-[0.08em] text-campaign-action uppercase">Help Center</p>
        <h1 id="help-title" className="mt-1 text-[24px] leading-8 font-semibold text-campaign-depth">How can we help?</h1>
        <p className="mt-1 max-w-xl text-[14px] leading-[22px] text-ink-body">Step-by-step guides for the things people do most, answers to common questions, and a way to reach us.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/getting-started" className={viewAllClass}>
            <RocketLaunchIcon size={16} aria-hidden /> Setup checklist
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=EVOQ%20Campaigns%20support`} className={viewAllClass}>
            <EnvelopeSimpleIcon size={16} aria-hidden /> Email support
          </a>
        </div>
      </section>

      <h2 className="mt-6 mb-3 text-[16px] font-semibold text-ink">Guides</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {HELP_GUIDES.map((g) => (
          <div key={g.id} id={g.id} className="scroll-mt-24 rounded-xl target:ring-2 target:ring-brand-action">
            <Card label={g.title} className="h-full">
              <CardHeader title={g.title} subtitle={`${g.text} · ${g.minutes} min read`} className="[&_h2]:whitespace-normal" />
              <ol className="list-decimal space-y-1.5 px-5 pl-9 text-[13px] leading-5 text-ink-body">
                {g.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="px-5 py-4">
                <Link href={g.href} className={viewAllClass}>
                  {g.cta} <ArrowRightIcon size={14} aria-hidden />
                </Link>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-[16px] font-semibold text-ink">Common questions</h2>
      <Card label="Common questions">
        <ul className="divide-y divide-line-soft">
          {HELP_FAQ.map((f) => (
            <li key={f.q}>
              <details className="group px-5 py-3">
                <summary className="cursor-pointer text-[14px] font-medium text-ink marker:text-ink-muted">{f.q}</summary>
                <p className="mt-2 text-[13px] leading-5 text-ink-body">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card label="Contact support">
          <CardHeader title={<><LifebuoyIcon size={18} aria-hidden /> Still stuck?</>} subtitle="Tell us what you were trying to do and we will help." />
          <div className="px-5 pb-4">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=EVOQ%20Campaigns%20support`} className={viewAllClass}>
              {SUPPORT_EMAIL} <ArrowRightIcon size={14} aria-hidden />
            </a>
          </div>
        </Card>
        <Card label="Keyboard shortcuts">
          <CardHeader title="Keyboard shortcuts" />
          <div className="space-y-1.5 px-5 pb-4 text-[13px] text-ink-body">
            {SHORTCUTS.map((s) => (
              <p key={s.keys} className="flex justify-between">
                {s.label} <kbd className="rounded border border-line px-1.5 font-sans text-[11px] text-ink-muted">{s.keys}</kbd>
              </p>
            ))}
          </div>
        </Card>
      </div>
      <p className="mt-6 text-[12px] text-ink-muted">This is a frontend prototype: nothing you do here sends real email, SMS or WhatsApp messages.</p>
    </PageShell>
  );
}
