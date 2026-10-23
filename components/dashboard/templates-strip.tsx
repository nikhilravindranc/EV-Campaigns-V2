"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, viewAllClass } from "@/components/shared/campaign-ui";
import { EmailThumb } from "@/components/shared/email-ui";
import { useTemplates } from "@/hooks/use-templates";
import { galleryHref, GALLERY_ROUTE } from "@/lib/content-session";
import { categoryLabel } from "@/lib/mock-data/templates";
import { NEW_CAMPAIGN_ID } from "@/lib/routes";

const SHOWN = 4;

/** Overview shortcut: start a new campaign from a ready-made design. */
export function TemplatesStrip({ className }: { className?: string }) {
  const { data } = useTemplates({ scope: "gallery" });
  const items = data?.slice(0, SHOWN);
  return (
    <Card label="Start with a template" className={className}>
      <CardHeader
        title="Start with a template"
        subtitle="Pick a design, then add your audience and send time"
        action={
          <Link href={GALLERY_ROUTE} className={viewAllClass}>
            View all templates <ArrowRightIcon size={14} aria-hidden />
          </Link>
        }
      />
      <ul className="grid grid-cols-2 gap-3 px-5 pb-5 lg:grid-cols-4">
        {!items
          ? Array.from({ length: SHOWN }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-[220px] rounded-xl" />
              </li>
            ))
          : items.map((t) => (
              <li key={t.id}>
                <Link href={galleryHref({ campaignId: NEW_CAMPAIGN_ID, category: t.category })} className="group block overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-brand-soft focus-visible:outline-2 focus-visible:outline-brand-action">
                  <EmailThumb content={t.content} className="h-[170px] w-full border-b border-line-soft" />
                  <span className="block px-3 py-2.5">
                    <span className="block truncate text-[13px] font-medium text-ink">{t.name}</span>
                    <span className="block truncate text-[12px] text-ink-muted">{categoryLabel(t.category)}</span>
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </Card>
  );
}
