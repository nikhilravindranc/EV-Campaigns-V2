import type { Metadata } from "next";
import { HelpCenterView } from "@/components/help/help-center-view";

export const metadata: Metadata = { title: "Help Center" };

export default function HelpPage() {
  return <HelpCenterView />;
}
