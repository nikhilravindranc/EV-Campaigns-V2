"use client";

import { useQuery } from "@tanstack/react-query";
import { useHydrated } from "@/hooks/use-hydrated";
import { getSetupProgress, type SetupStepKey } from "@/lib/api/setup";
import { DEFAULT_SENDER } from "@/lib/mock-data/campaigns";

/** Where the (simulated) sender verification is remembered. */
export const VERIFIED_KEY = "evoq-campaigns:sender-verified";
/** Steps a person chose to skip on the Overview checklist. */
export const SKIPPED_KEY = "evoq-campaigns:setup-skipped";

export interface Step {
  key: SetupStepKey;
  title: string;
  text: string;
  action: string;
  /** Rough time to finish, shown as "4 minutes". */
  minutes: number;
  /** A Help Center guide that walks through the step. */
  guide?: string;
  href?: string;
}

export const STEPS: Step[] = [
  { key: "sender", title: "Verify your sender address", text: `Confirm ${DEFAULT_SENDER.email} so inboxes trust your emails.`, action: "Verify sender", minutes: 1 },
  { key: "contacts", title: "Add your contacts", text: "Import a CSV or add people one by one.", action: "Import contacts", minutes: 3, guide: "import-contacts", href: "/contacts?import=1" },
  { key: "audience", title: "Organise your audience", text: "Group contacts into a list or a segment that updates itself.", action: "Create a segment", minutes: 3, guide: "segments", href: "/segments/new" },
  { key: "template", title: "Design an email template", text: "Start from the gallery, a layout or your own HTML.", action: "Create a template", minutes: 4, guide: "templates", href: "/templates" },
  { key: "campaign", title: "Create your first campaign", text: "Email, SMS or WhatsApp — pick an audience and write the message.", action: "Create campaign", minutes: 4, guide: "first-campaign" },
  { key: "launch", title: "Schedule a campaign", text: "Review it, then pick a send time. Nothing is really sent in this demo.", action: "Open campaigns", minutes: 2, guide: "first-campaign", href: "/campaigns?status=draft" },
  { key: "form", title: "Grow your list with a form", text: "Publish a signup form that adds new contacts to a list.", action: "Create a form", minutes: 3, href: "/forms/new" },
];

/** What has been done so far, worked out from this browser's activity. */
export function useSetup(verified: boolean) {
  const hydrated = useHydrated();
  const q = useQuery({ queryKey: ["campaigns", "setup", verified], queryFn: () => getSetupProgress(verified) });
  return hydrated ? q.data : undefined;
}
